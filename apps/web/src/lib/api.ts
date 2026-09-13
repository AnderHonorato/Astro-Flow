import type {
  ApiError, ApiErrorCode, AuthResponse, ChartResponse, HoroscopeResponse,
  LoginRequest, PlaceSearchResponse, PublicUser, RegisterRequest,
  SkyNowResponse, StartCheckoutResponse, SynastryEntry, SynastryResponse,
  TransitsResponse, UpdateBirthRequest, UpdatePreferencesRequest,
  BirthData, Period, SignKey,
} from '@astros/contracts';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3333';

const ACCESS_KEY = 'astros.access';
const REFRESH_KEY = 'astros.refresh';

/** Erro tipado: a UI olha `code` para decidir entre avisar e redirecionar. */
export class AstrosApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fields: Record<string, string>;

  constructor(status: number, code: ApiErrorCode, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'AstrosApiError';
    this.status = status;
    this.code = code;
    this.fields = fields ?? {};
  }
}

/* ── tokens ────────────────────────────────────────────────────────────── */

export const tokens = {
  get access(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  get refresh(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ACCESS_KEY, access);
    window.localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};

/* ── transporte ────────────────────────────────────────────────────────── */

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Anexa o access token e tenta renovar uma vez em 401. */
  auth?: boolean;
  /** Repassado ao fetch do Next para cache de rotas publicas. */
  next?: { revalidate?: number };
  signal?: AbortSignal;
}

/**
 * Uma renovacao em voo por vez: varias chamadas que batem 401 juntas
 * compartilham o mesmo refresh em vez de disparar N rotacoes de token.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokens.refresh;
  if (!refreshToken) return false;

  refreshInFlight ??= (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        tokens.clear();
        return false;
      }
      const data = (await res.json()) as AuthResponse;
      tokens.set(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, next, signal } = options;

  const send = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['content-type'] = 'application/json';
    if (auth) {
      const token = tokens.access;
      if (token) headers.authorization = `Bearer ${token}`;
    }
    return fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      ...(next ? { next } : {}),
    });
  };

  let res: Response;
  try {
    res = await send();
  } catch (cause) {
    throw new AstrosApiError(
      0, 'internal_error',
      'Não foi possível falar com o servidor. Verifique sua conexão.',
    );
  }

  if (res.status === 401 && auth && (await refreshTokens())) {
    res = await send();
  }

  if (res.status === 204) return undefined as T;

  const payload: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const err = payload as ApiError | null;
    throw new AstrosApiError(
      res.status,
      err?.error?.code ?? 'internal_error',
      err?.error?.message ?? 'Algo deu errado. Tente de novo em instantes.',
      err?.error?.fields,
    );
  }

  return payload as T;
}

/* ── superficie tipada ─────────────────────────────────────────────────── */

export const api = {
  /* auth */
  register: (input: RegisterRequest) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: input }),

  login: (input: LoginRequest) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: input }),

  logout: () =>
    request<void>('/auth/logout', {
      method: 'POST', auth: true, body: { refreshToken: tokens.refresh },
    }),

  /* perfil */
  me: () => request<{ user: PublicUser }>('/me', { auth: true }),

  updateBirth: (input: UpdateBirthRequest) =>
    request<{ user: PublicUser }>('/me/birth', { method: 'PUT', auth: true, body: input }),

  updatePreferences: (input: UpdatePreferencesRequest) =>
    request<{ user: PublicUser }>('/me/preferences', { method: 'PATCH', auth: true, body: input }),

  /* lugares */
  searchPlaces: (q: string, signal?: AbortSignal) =>
    request<PlaceSearchResponse>(`/places/search?q=${encodeURIComponent(q)}`, { signal }),

  /* cartas */
  calculateChart: (birth: BirthData) =>
    request<ChartResponse>('/charts/calculate', { method: 'POST', body: birth }),

  myChart: () => request<ChartResponse>('/me/chart', { auth: true }),

  /* ceu */
  skyNow: (timezone = 'America/Sao_Paulo') =>
    request<SkyNowResponse>(`/sky/now?timezone=${encodeURIComponent(timezone)}`, {
      next: { revalidate: 300 },
    }),

  transits: (date?: string) =>
    request<TransitsResponse>(`/me/transits${date ? `?date=${date}` : ''}`, { auth: true }),

  horoscope: (period: Period = 'day', date?: string) =>
    request<HoroscopeResponse>(
      `/me/horoscope?period=${period}${date ? `&date=${date}` : ''}`, { auth: true },
    ),

  /* sinastria */
  listSynastry: () =>
    request<{ partners: SynastryEntry[] }>('/me/synastry', { auth: true }),

  createSynastry: (input: { name: string; birth: BirthData }) =>
    request<SynastryResponse>('/me/synastry', { method: 'POST', auth: true, body: input }),

  getSynastry: (id: string) =>
    request<SynastryResponse>(`/me/synastry/${id}`, { auth: true }),

  deleteSynastry: (id: string) =>
    request<void>(`/me/synastry/${id}`, { method: 'DELETE', auth: true }),

  /* signos */
  signProfile: (sign: SignKey) =>
    request<{ profile: import('@astros/contracts').SignProfile }>(`/signs/${sign}`, {
      next: { revalidate: 86400 },
    }),

  /* cobranca */
  startCheckout: (plan: 'full' | 'lifetime') =>
    request<StartCheckoutResponse>('/billing/checkout', {
      method: 'POST', auth: true, body: { plan },
    }),
};
