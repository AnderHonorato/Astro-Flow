import { z } from 'zod';
import {
  birthDataSchema, chartSchema, horoscopeSchema, houseSystemSchema,
  periodSchema, placeSchema, signKeySchema, signProfileSchema,
  skyNowSchema, synastrySchema, transitHitSchema,
} from './astrology.js';

/* ──────────────────────────────────────────────────────────────────────────
   Envelope de erro — toda rota 4xx/5xx responde exatamente isto.
   ────────────────────────────────────────────────────────────────────────── */

export const API_ERROR_CODES = [
  'validation_error',
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'plan_required',
  'rate_limited',
  'internal_error',
] as const;
export const apiErrorCodeSchema = z.enum(API_ERROR_CODES);
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export const apiErrorSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    /** Mensagem em pt-BR, exibivel ao usuario. */
    message: z.string(),
    /** Preenchido apenas em validation_error: campo -> problema. */
    fields: z.record(z.string(), z.string()).optional(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

/* ──────────────────────────────────────────────────────────────────────────
   Planos
   ────────────────────────────────────────────────────────────────────────── */

export const PLAN_KEYS = ['free', 'full', 'lifetime'] as const;
export const planKeySchema = z.enum(PLAN_KEYS);
export type PlanKey = z.infer<typeof planKeySchema>;

export const subscriptionSchema = z.object({
  plan: planKeySchema,
  status: z.enum(['active', 'trialing', 'canceled', 'expired']),
  /** null no plano free e no vitalicio. */
  currentPeriodEnd: z.string().datetime().nullable(),
  trialEndsAt: z.string().datetime().nullable(),
});
export type Subscription = z.infer<typeof subscriptionSchema>;

/* ──────────────────────────────────────────────────────────────────────────
   Auth
   ────────────────────────────────────────────────────────────────────────── */

export const publicUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  subscription: subscriptionSchema,
  /** null ate o usuario concluir o passo 2/3 do cadastro. */
  birth: birthDataSchema.nullable(),
  preferences: z.object({
    houseSystem: houseSystemSchema,
    timezone: z.string(),
    notifications: z.object({
      dailyHoroscope: z.boolean(),
      transitAlerts: z.boolean(),
      moonPhases: z.boolean(),
    }),
  }),
  createdAt: z.string().datetime(),
});
export type PublicUser = z.infer<typeof publicUserSchema>;

export const registerRequestSchema = z.object({
  name: z.string().min(2, 'informe seu nome completo').max(120),
  email: z.string().email('e-mail invalido'),
  password: z.string().min(8, 'minimo 8 caracteres').max(200),
  /** Opcional: o app envia nos passos seguintes via PUT /me/birth. */
  birth: birthDataSchema.optional(),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const loginRequestSchema = z.object({
  email: z.string().email('e-mail invalido'),
  password: z.string().min(1, 'informe a senha'),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const authResponseSchema = z.object({
  /** JWT curto (15 min). Vai no header Authorization: Bearer. */
  accessToken: z.string(),
  /** Opaco, 30 dias, rotacionado a cada refresh. */
  refreshToken: z.string(),
  user: publicUserSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

export const refreshRequestSchema = z.object({ refreshToken: z.string().min(1) });
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;

/* ──────────────────────────────────────────────────────────────────────────
   Perfil
   ────────────────────────────────────────────────────────────────────────── */

export const updateBirthRequestSchema = birthDataSchema;
export type UpdateBirthRequest = z.infer<typeof updateBirthRequestSchema>;

export const updatePreferencesRequestSchema = z.object({
  houseSystem: houseSystemSchema.optional(),
  timezone: z.string().optional(),
  notifications: z.object({
    dailyHoroscope: z.boolean(),
    transitAlerts: z.boolean(),
    moonPhases: z.boolean(),
  }).partial().optional(),
});
export type UpdatePreferencesRequest = z.infer<typeof updatePreferencesRequestSchema>;

/* ──────────────────────────────────────────────────────────────────────────
   Lugares (autocomplete de cidade de nascimento)
   ────────────────────────────────────────────────────────────────────────── */

export const placeSearchQuerySchema = z.object({
  q: z.string().min(2, 'digite ao menos 2 letras'),
  limit: z.coerce.number().int().min(1).max(10).default(5),
});
export type PlaceSearchQuery = z.infer<typeof placeSearchQuerySchema>;

export const placeSearchResponseSchema = z.object({
  results: z.array(placeSchema.extend({
    /** "Belo Horizonte, MG · Brasil" — pronto para a lista. */
    label: z.string(),
    /** "19°55′S 43°56′O" */
    coordFormatted: z.string(),
  })),
});
export type PlaceSearchResponse = z.infer<typeof placeSearchResponseSchema>;

/* ──────────────────────────────────────────────────────────────────────────
   Carta, ceu, horoscopo, sinastria
   ────────────────────────────────────────────────────────────────────────── */

/** POST /charts/calculate — carta avulsa, sem conta (usado pela landing). */
export const calculateChartRequestSchema = birthDataSchema;
export const chartResponseSchema = z.object({ chart: chartSchema });
export type ChartResponse = z.infer<typeof chartResponseSchema>;

export const skyNowQuerySchema = z.object({
  timezone: z.string().default('America/Sao_Paulo'),
});
export const skyNowResponseSchema = z.object({ sky: skyNowSchema });
export type SkyNowResponse = z.infer<typeof skyNowResponseSchema>;

export const transitsQuerySchema = z.object({
  /** ISO date; default = hoje no fuso do usuario. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
export const transitsResponseSchema = z.object({
  date: z.string(),
  hits: z.array(transitHitSchema),
  /** O alerta pessoal destacado no card roxo da home. */
  highlight: z.string().nullable(),
});
export type TransitsResponse = z.infer<typeof transitsResponseSchema>;

export const horoscopeQuerySchema = z.object({
  period: periodSchema.default('day'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
export const horoscopeResponseSchema = z.object({ horoscope: horoscopeSchema });
export type HoroscopeResponse = z.infer<typeof horoscopeResponseSchema>;

export const createSynastryRequestSchema = z.object({
  name: z.string().min(1).max(120),
  birth: birthDataSchema,
});
export type CreateSynastryRequest = z.infer<typeof createSynastryRequestSchema>;

export const synastryEntrySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  birth: birthDataSchema,
  createdAt: z.string().datetime(),
});
export type SynastryEntry = z.infer<typeof synastryEntrySchema>;

export const synastryResponseSchema = z.object({
  partner: synastryEntrySchema,
  synastry: synastrySchema,
});
export type SynastryResponse = z.infer<typeof synastryResponseSchema>;

export const signProfileResponseSchema = z.object({ profile: signProfileSchema });
export const signProfileParamsSchema = z.object({ sign: signKeySchema });

/* ──────────────────────────────────────────────────────────────────────────
   Assinatura (checkout simulado — sem PSP real neste estagio)
   ────────────────────────────────────────────────────────────────────────── */

export const startCheckoutRequestSchema = z.object({
  plan: z.enum(['full', 'lifetime']),
});
export const startCheckoutResponseSchema = z.object({
  /** URL para onde o cliente redireciona. */
  checkoutUrl: z.string(),
  subscription: subscriptionSchema,
});
export type StartCheckoutResponse = z.infer<typeof startCheckoutResponseSchema>;

/* ──────────────────────────────────────────────────────────────────────────
   Mapa de rotas — a fonte da verdade compartilhada entre api e web.
   ────────────────────────────────────────────────────────────────────────── */

export const API_ROUTES = {
  health: 'GET /health',

  register: 'POST /auth/register',
  login: 'POST /auth/login',
  refresh: 'POST /auth/refresh',
  logout: 'POST /auth/logout',

  me: 'GET /me',
  updateBirth: 'PUT /me/birth',
  updatePreferences: 'PATCH /me/preferences',

  searchPlaces: 'GET /places/search',

  calculateChart: 'POST /charts/calculate',
  myChart: 'GET /me/chart',

  skyNow: 'GET /sky/now',
  transits: 'GET /me/transits',
  horoscope: 'GET /me/horoscope',

  listSynastry: 'GET /me/synastry',
  createSynastry: 'POST /me/synastry',
  getSynastry: 'GET /me/synastry/:id',
  deleteSynastry: 'DELETE /me/synastry/:id',

  signProfile: 'GET /signs/:sign',

  startCheckout: 'POST /billing/checkout',
} as const;
