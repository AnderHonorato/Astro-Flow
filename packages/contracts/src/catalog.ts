/**
 * Catalogo estatico do dominio: rotulos pt-BR, atributos classicos e os
 * tracados SVG desenhados a mao no handoff do Claude Design.
 *
 * Extraido de `templates/astrology-app-landing-page/project/*.dc.html`.
 * Os glifos sao paths para um viewBox 24x24 com `fill="none"` — sempre
 * renderize com stroke, nunca com fill.
 */

import type {
  AspectKey, BodyKey, ElementKey, ModalityKey, SignKey,
} from './astrology.js';

/* ── glifos dos signos ─────────────────────────────────────────────────── */

export const SIGN_GLYPHS: Record<SignKey, string> = {
  aries: 'M3.5 18.5C3.5 8 7.5 4.5 12 9.5C16.5 4.5 20.5 8 20.5 18.5',
  taurus: 'M5.5 5.5C8 2.5 16 2.5 18.5 5.5 M6.4 14.9a5.6 5.6 0 1 0 11.2 0a5.6 5.6 0 1 0 -11.2 0',
  gemini: 'M4 4.5C7.5 6.5 16.5 6.5 20 4.5 M4 19.5C7.5 17.5 16.5 17.5 20 19.5 M7.5 5.8V18.2 M16.5 5.8V18.2',
  cancer: 'M3.5 9C6 4.5 14 3.5 20.5 7 M20.5 15C18 19.5 10 20.5 3.5 17 M4 12.2a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0 M14.8 11.8a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0',
  leo: 'M11.7 12.6a4 4 0 1 0 .7 3.4 M12.4 16C14.5 6 20 4.5 20 9.5C20 13 16.5 13.5 15 11',
  virgo: 'M3 6.5V17 M3 8.5C4 5.5 7 5.5 8 8.5V17 M8 8.5C9 5.5 12 5.5 13 8.5V15C13 18.5 15.5 19.5 17.5 17.5 M13 12.5C17.5 12 20 15 17 19',
  libra: 'M2.5 18.5H21.5 M5 13.5H9.5 M14.5 13.5H19 M9.5 13.5C9 7 15 7 14.5 13.5',
  scorpio: 'M2.5 6.5V17 M2.5 8.5C3.5 5.5 6.5 5.5 7.5 8.5V17 M7.5 8.5C8.5 5.5 11.5 5.5 12.5 8.5V17 M12.5 12.5L19 19 M19 19H14 M19 19V14',
  sagittarius: 'M5 19L18.5 5.5 M12 5.5H18.5V12 M7.5 12.5L13 18',
  capricorn: 'M3.5 7C5.5 4 7.5 6 8.5 9L11 15.5 M8.5 9C10.5 5 15 5 16 10C16.8 14 13.5 15 12.5 13C15 11.5 19 13 19 16.2C19 19.5 15.5 20 14.2 17.6',
  aquarius: 'M3 10.5l3.6-3.4l3.6 3.4l3.6-3.4l3.6 3.4l3.6-3.4 M3 17l3.6-3.4l3.6 3.4l3.6-3.4l3.6 3.4l3.6-3.4',
  pisces: 'M7.5 3.5C3.5 8 3.5 16 7.5 20.5 M16.5 3.5C20.5 8 20.5 16 16.5 20.5 M4 12H20',
};

/* ── glifos dos corpos ─────────────────────────────────────────────────── */

export const BODY_GLYPHS: Record<BodyKey, string> = {
  sun: 'M3.5 12a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0 M10.8 12a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0-2.4 0',
  moon: 'M15 3.5A9.5 9.5 0 1 0 15 20.5A11.5 11.5 0 0 1 15 3.5',
  mercury: 'M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M12 16v5 M9.5 19h5 M8.5 3.5C9 7 15 7 15.5 3.5',
  venus: 'M8 9a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M12 13v8 M9 17.5h6',
  mars: 'M4.5 15.5a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0-11 0 M14 12L20 6 M15 5.5h5v5',
  jupiter: 'M4.5 7C6 4 10.5 4.5 10 8.5C9.6 12 5 14.5 5 14.5 M10 8.5V19 M4 19h13',
  saturn: 'M4 7h7 M7.5 3.5V13.5 M7.5 13.5C11.5 12 15 13.5 15 17.5C15 20.5 12 21 10.5 19',
  uranus: 'M9.6 18.1a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0-4.8 0 M12 15.7V3.5 M8 7.5h8',
  neptune: 'M4.5 7.5C4.5 15 19.5 15 19.5 7.5 M4.5 7.5V10.5 M19.5 7.5V10.5 M12 5V21 M8 18.5h8',
  pluto: 'M6 20.5V6.5H10a3.5 3.5 0 0 1 0 7H6 M13.5 6.5V20.5h5.5',
  northNode: 'M8 20.5c0-4 8-4 8 0 M12 16.5a4.5 4.5 0 1 0 0-9a4.5 4.5 0 1 0 0 9 M8 11.5C6 8 7 3.5 12 3.5s6 4.5 4 8',
  chiron: 'M8 15.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0 M11.5 12V3.5 M11.5 7.5L16 3.5 M11.5 7.5L7.5 4.5',
};

/* ── glifos dos aspectos ───────────────────────────────────────────────── */

export const ASPECT_GLYPHS: Record<AspectKey, string> = {
  conjunction: 'M7 12a5 5 0 1 0 10 0a5 5 0 1 0-10 0',
  sextile: 'M12 4v16 M5 8l14 8 M19 8L5 16',
  square: 'M5 5h14v14H5z',
  trine: 'M12 4l8 15H4z',
  opposition: 'M4 12h16 M4 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M16 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
  quincunx: 'M12 4v16 M6 7l12 10 M18 7L6 17',
};

/* ── atributos dos signos ──────────────────────────────────────────────── */

export interface SignInfo {
  key: SignKey;
  name: string;
  /** "23 jul – 22 ago" */
  dates: string;
  element: ElementKey;
  modality: ModalityKey;
  ruler: BodyKey;
  /** Longitude eclíptica onde o signo comeca: 0, 30, 60... */
  startLongitude: number;
}

export const SIGNS: readonly SignInfo[] = [
  { key: 'aries', name: 'Áries', dates: '21 mar – 19 abr', element: 'fire', modality: 'cardinal', ruler: 'mars', startLongitude: 0 },
  { key: 'taurus', name: 'Touro', dates: '20 abr – 20 mai', element: 'earth', modality: 'fixed', ruler: 'venus', startLongitude: 30 },
  { key: 'gemini', name: 'Gêmeos', dates: '21 mai – 20 jun', element: 'air', modality: 'mutable', ruler: 'mercury', startLongitude: 60 },
  { key: 'cancer', name: 'Câncer', dates: '21 jun – 22 jul', element: 'water', modality: 'cardinal', ruler: 'moon', startLongitude: 90 },
  { key: 'leo', name: 'Leão', dates: '23 jul – 22 ago', element: 'fire', modality: 'fixed', ruler: 'sun', startLongitude: 120 },
  { key: 'virgo', name: 'Virgem', dates: '23 ago – 22 set', element: 'earth', modality: 'mutable', ruler: 'mercury', startLongitude: 150 },
  { key: 'libra', name: 'Libra', dates: '23 set – 22 out', element: 'air', modality: 'cardinal', ruler: 'venus', startLongitude: 180 },
  { key: 'scorpio', name: 'Escorpião', dates: '23 out – 21 nov', element: 'water', modality: 'fixed', ruler: 'pluto', startLongitude: 210 },
  { key: 'sagittarius', name: 'Sagitário', dates: '22 nov – 21 dez', element: 'fire', modality: 'mutable', ruler: 'jupiter', startLongitude: 240 },
  { key: 'capricorn', name: 'Capricórnio', dates: '22 dez – 19 jan', element: 'earth', modality: 'cardinal', ruler: 'saturn', startLongitude: 270 },
  { key: 'aquarius', name: 'Aquário', dates: '20 jan – 18 fev', element: 'air', modality: 'fixed', ruler: 'uranus', startLongitude: 300 },
  { key: 'pisces', name: 'Peixes', dates: '19 fev – 20 mar', element: 'water', modality: 'mutable', ruler: 'neptune', startLongitude: 330 },
] as const;

export const SIGN_BY_KEY: Record<SignKey, SignInfo> = Object.fromEntries(
  SIGNS.map((s) => [s.key, s]),
) as Record<SignKey, SignInfo>;

/** Signo a partir da longitude eclíptica (0–360). */
export function signFromLongitude(longitude: number): SignKey {
  const normalized = ((longitude % 360) + 360) % 360;
  return SIGNS[Math.floor(normalized / 30)]!.key;
}

/* ── rotulos ───────────────────────────────────────────────────────────── */

export const BODY_LABELS: Record<BodyKey, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno',
  pluto: 'Plutão', northNode: 'Nodo Norte', chiron: 'Quíron',
};

export const ASPECT_LABELS: Record<AspectKey, string> = {
  conjunction: 'conjunção', sextile: 'sextil', square: 'quadratura',
  trine: 'trígono', opposition: 'oposição', quincunx: 'quincunce',
};

export const ELEMENT_LABELS: Record<ElementKey, string> = {
  fire: 'Fogo', earth: 'Terra', air: 'Ar', water: 'Água',
};

export const MODALITY_LABELS: Record<ModalityKey, string> = {
  cardinal: 'Cardinal', fixed: 'Fixo', mutable: 'Mutável',
};

export const HOUSE_SYSTEM_LABELS = {
  placidus: 'Placidus', koch: 'Koch', equal: 'Casas iguais',
} as const;

export const PERIOD_LABELS = {
  day: 'Dia', week: 'Semana', month: 'Mês', year: 'Ano',
} as const;

export const MOON_PHASE_LABELS = {
  new: 'Nova', waxingCrescent: 'Crescente', firstQuarter: 'Quarto crescente',
  waxingGibbous: 'Gibosa crescente', full: 'Cheia', waningGibbous: 'Gibosa minguante',
  lastQuarter: 'Quarto minguante', waningCrescent: 'Minguante',
} as const;

/** Numeral romano da casa — a UI mostra "X", nunca "10". */
export const HOUSE_NUMERALS = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII',
] as const;

/* ── definicao dos aspectos ────────────────────────────────────────────── */

export interface AspectInfo {
  key: AspectKey;
  /** Angulo exato em graus. */
  angle: number;
  /** Orbe maximo aceito (graus) para corpos comuns. */
  orb: number;
  harmony: 'harmonic' | 'tense' | 'neutral';
}

export const ASPECTS: readonly AspectInfo[] = [
  { key: 'conjunction', angle: 0, orb: 8, harmony: 'neutral' },
  { key: 'sextile', angle: 60, orb: 4, harmony: 'harmonic' },
  { key: 'square', angle: 90, orb: 6, harmony: 'tense' },
  { key: 'trine', angle: 120, orb: 6, harmony: 'harmonic' },
  { key: 'opposition', angle: 180, orb: 8, harmony: 'tense' },
  { key: 'quincunx', angle: 150, orb: 3, harmony: 'tense' },
] as const;

/**
 * Peso do corpo no calculo de forca do aspecto e na escolha do aspecto
 * regente da leitura. Luminares pesam mais; transaturninos, menos.
 */
export const BODY_WEIGHTS: Record<BodyKey, number> = {
  sun: 1, moon: 1, mercury: 0.7, venus: 0.7, mars: 0.7,
  jupiter: 0.6, saturn: 0.6, uranus: 0.4, neptune: 0.4, pluto: 0.4,
  northNode: 0.3, chiron: 0.3,
};

/* ── planos ────────────────────────────────────────────────────────────── */

export interface PlanInfo {
  key: 'free' | 'full' | 'lifetime';
  name: string;
  price: string;
  per: string;
  tag: string | null;
  cta: string;
  perks: readonly string[];
  featured: boolean;
}

export const PLANS: readonly PlanInfo[] = [
  {
    key: 'free', name: 'Ascendente', price: 'Grátis', per: 'para sempre',
    tag: null, cta: 'Criar conta', featured: false,
    perks: [
      'Mapa natal completo com roda interativa',
      'Horóscopo diário resumido',
      'Trânsitos do dia',
      'Uma sinastria salva',
    ],
  },
  {
    key: 'full', name: 'Pleno', price: 'R$ 129', per: 'por ano · R$ 10,75/mês',
    tag: '2 meses grátis', cta: 'Começar 7 dias grátis', featured: true,
    perks: [
      'Leituras longas de dia, semana, mês e ano',
      'Alertas de trânsito na hora exata do aspecto',
      'Progressões, decanatos e revisão de casas',
      'Sinastria ilimitada e mapa em PDF',
    ],
  },
  {
    key: 'lifetime', name: 'Vitalício', price: 'R$ 399', per: 'pagamento único',
    tag: null, cta: 'Comprar uma vez', featured: false,
    perks: [
      'Tudo do Pleno, sem renovação',
      'Novos módulos incluídos',
      'Suporte por e-mail em 24h',
      'Transferível entre dispositivos',
    ],
  },
] as const;

/** Quantos parceiros de sinastria cada plano permite salvar. */
export const SYNASTRY_LIMIT = { free: 1, full: Infinity, lifetime: Infinity } as const;

/** Periodos de horoscopo liberados por plano — o resto vem `locked`. */
export const HOROSCOPE_ACCESS = {
  free: ['day'],
  full: ['day', 'week', 'month', 'year'],
  lifetime: ['day', 'week', 'month', 'year'],
} as const;
