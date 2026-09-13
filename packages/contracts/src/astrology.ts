import { z } from 'zod';

/* ──────────────────────────────────────────────────────────────────────────
   Vocabulario do dominio. Chaves em ingles (estaveis, seguras para URL e
   banco); rotulos em pt-BR vivem em `labels.ts` e nunca no banco.
   ────────────────────────────────────────────────────────────────────────── */

export const SIGN_KEYS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const;
export const signKeySchema = z.enum(SIGN_KEYS);
export type SignKey = z.infer<typeof signKeySchema>;

/** Ordem canonica usada em toda a UI (roda, listas, tabelas). */
export const BODY_KEYS = [
  'sun', 'moon', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
  'northNode', 'chiron',
] as const;
export const bodyKeySchema = z.enum(BODY_KEYS);
export type BodyKey = z.infer<typeof bodyKeySchema>;

export const ASPECT_KEYS = [
  'conjunction', 'sextile', 'square', 'trine', 'opposition', 'quincunx',
] as const;
export const aspectKeySchema = z.enum(ASPECT_KEYS);
export type AspectKey = z.infer<typeof aspectKeySchema>;

export const ELEMENT_KEYS = ['fire', 'earth', 'air', 'water'] as const;
export const elementKeySchema = z.enum(ELEMENT_KEYS);
export type ElementKey = z.infer<typeof elementKeySchema>;

export const MODALITY_KEYS = ['cardinal', 'fixed', 'mutable'] as const;
export const modalityKeySchema = z.enum(MODALITY_KEYS);
export type ModalityKey = z.infer<typeof modalityKeySchema>;

export const HOUSE_SYSTEMS = ['placidus', 'koch', 'equal'] as const;
export const houseSystemSchema = z.enum(HOUSE_SYSTEMS);
export type HouseSystem = z.infer<typeof houseSystemSchema>;

export const PERIODS = ['day', 'week', 'month', 'year'] as const;
export const periodSchema = z.enum(PERIODS);
export type Period = z.infer<typeof periodSchema>;

export const MOON_PHASES = [
  'new', 'waxingCrescent', 'firstQuarter', 'waxingGibbous',
  'full', 'waningGibbous', 'lastQuarter', 'waningCrescent',
] as const;
export const moonPhaseSchema = z.enum(MOON_PHASES);
export type MoonPhase = z.infer<typeof moonPhaseSchema>;

/* ──────────────────────────────────────────────────────────────────────────
   Dados de nascimento
   ────────────────────────────────────────────────────────────────────────── */

export const geoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type GeoPoint = z.infer<typeof geoPointSchema>;

export const placeSchema = geoPointSchema.extend({
  /** "Belo Horizonte" */
  name: z.string().min(1),
  /** "MG" — opcional fora do Brasil */
  region: z.string().nullable().default(null),
  /** ISO 3166-1 alpha-2, ex.: "BR" */
  countryCode: z.string().length(2),
  /** IANA, ex.: "America/Sao_Paulo" — resolve DST historico */
  timezone: z.string().min(1),
});
export type Place = z.infer<typeof placeSchema>;

export const birthDataSchema = z.object({
  /** Data civil local do nascimento, YYYY-MM-DD. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD'),
  /**
   * Hora civil local, HH:mm (24h). `null` quando desconhecida — o motor cai
   * para meio-dia solar e marca `timeIsEstimated`, que apaga casas e angulos
   * na UI.
   */
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'use HH:mm').nullable(),
  place: placeSchema,
  houseSystem: houseSystemSchema.default('placidus'),
});
export type BirthData = z.infer<typeof birthDataSchema>;

/* ──────────────────────────────────────────────────────────────────────────
   Carta
   ────────────────────────────────────────────────────────────────────────── */

/** Posicao eclíptica de um corpo, ja decomposta para exibicao direta. */
export const bodyPositionSchema = z.object({
  body: bodyKeySchema,
  /** Longitude eclíptica 0–360, a partir de 0° Aries. */
  longitude: z.number().min(0).max(360),
  latitude: z.number(),
  /** Graus/dia; negativo = retrogrado. */
  speed: z.number(),
  retrograde: z.boolean(),
  sign: signKeySchema,
  /** 0–29 dentro do signo. */
  degreeInSign: z.number().min(0).lt(30),
  minuteInSign: z.number().int().min(0).lt(60),
  /** "22°14′" — pre-formatado, a UI nunca recalcula. */
  formatted: z.string(),
  /** 1–12, ou null quando a hora e desconhecida. */
  house: z.number().int().min(1).max(12).nullable(),
  /** I, II ou III. */
  decan: z.number().int().min(1).max(3),
});
export type BodyPosition = z.infer<typeof bodyPositionSchema>;

export const houseCuspSchema = z.object({
  /** 1–12 */
  index: z.number().int().min(1).max(12),
  longitude: z.number().min(0).max(360),
  sign: signKeySchema,
  degreeInSign: z.number().min(0).lt(30),
  formatted: z.string(),
});
export type HouseCusp = z.infer<typeof houseCuspSchema>;

export const angleSchema = z.object({
  longitude: z.number().min(0).max(360),
  sign: signKeySchema,
  degreeInSign: z.number().min(0).lt(30),
  formatted: z.string(),
});
export type Angle = z.infer<typeof angleSchema>;

export const aspectSchema = z.object({
  aspect: aspectKeySchema,
  /** Corpo A da carta base. */
  a: bodyKeySchema,
  /** Corpo B — da mesma carta (natal) ou da outra (transito/sinastria). */
  b: bodyKeySchema,
  /** Desvio absoluto do angulo exato, em graus. */
  orb: z.number().min(0),
  /** "1°14′" */
  orbFormatted: z.string(),
  /** true = orbe fechando (aplicativo), false = abrindo (separativo). */
  applying: z.boolean(),
  /** 0–1 — proximidade do exato ponderada pelo peso dos corpos. */
  strength: z.number().min(0).max(1),
  /** Aspectos harmonicos vs tensos, para cor e traco na roda. */
  harmony: z.enum(['harmonic', 'tense', 'neutral']),
});
export type Aspect = z.infer<typeof aspectSchema>;

export const chartSchema = z.object({
  /** Instante UTC efetivamente calculado (ja com DST historico resolvido). */
  utc: z.string().datetime(),
  /** Dia juliano em TT — util para depurar o motor. */
  julianDay: z.number(),
  birth: birthDataSchema,
  /** true quando a hora foi estimada (meio-dia solar). */
  timeIsEstimated: z.boolean(),
  bodies: z.array(bodyPositionSchema),
  /** Vazio quando `timeIsEstimated` — casas exigem hora. */
  houses: z.array(houseCuspSchema),
  ascendant: angleSchema.nullable(),
  midheaven: angleSchema.nullable(),
  aspects: z.array(aspectSchema),
  /** Contagem por elemento e modalidade, para os medidores do perfil. */
  distribution: z.object({
    elements: z.record(elementKeySchema, z.number().int()),
    modalities: z.record(modalityKeySchema, z.number().int()),
  }),
});
export type Chart = z.infer<typeof chartSchema>;

/* ──────────────────────────────────────────────────────────────────────────
   Ceu ao vivo — alimenta a faixa da landing e a home do app
   ────────────────────────────────────────────────────────────────────────── */

export const skyNowSchema = z.object({
  at: z.string().datetime(),
  timezone: z.string(),
  sun: bodyPositionSchema,
  moon: bodyPositionSchema.extend({
    phase: moonPhaseSchema,
    /** 0–100 */
    illumination: z.number().min(0).max(100),
  }),
  bodies: z.array(bodyPositionSchema),
  retrogrades: z.array(z.object({
    body: bodyKeySchema,
    /** ISO date em que a estacao direta acontece. */
    until: z.string(),
    /** 0–1 — quanto do periodo retrogrado ja passou (barra de progresso). */
    progress: z.number().min(0).max(1),
  })),
  /** Aspectos que se fecham nas proximas 48h, mais proximo primeiro. */
  upcomingAspects: z.array(aspectSchema.extend({
    exactAt: z.string().datetime(),
  })),
});
export type SkyNow = z.infer<typeof skyNowSchema>;

/* ──────────────────────────────────────────────────────────────────────────
   Transitos e horoscopo
   ────────────────────────────────────────────────────────────────────────── */

export const transitHitSchema = aspectSchema.extend({
  /** Corpo em transito (ceu de hoje). */
  transiting: bodyKeySchema,
  /** Ponto natal tocado. */
  natal: bodyKeySchema,
  exactAt: z.string().datetime().nullable(),
  /** "19h42" no fuso do usuario. */
  exactAtFormatted: z.string().nullable(),
  title: z.string(),
  note: z.string(),
});
export type TransitHit = z.infer<typeof transitHitSchema>;

export const lifeAreaSchema = z.object({
  key: z.enum(['love', 'work', 'money', 'health']),
  /** 0–5, renderizado como pontos. */
  score: z.number().int().min(0).max(5),
  /** "intenso", "morno"... */
  word: z.string(),
});
export type LifeArea = z.infer<typeof lifeAreaSchema>;

export const horoscopeSchema = z.object({
  period: periodSchema,
  /** Inicio/fim do periodo, ISO date. */
  start: z.string(),
  end: z.string(),
  /** "14 ago" / "11 – 17 ago" — pronto para a UI. */
  rangeFormatted: z.string(),
  /** Frase de abertura, destacada em corpo maior. */
  lede: z.string(),
  /** Paragrafos do corpo; o primeiro leva a capitular. */
  body: z.array(z.string()),
  /** O aspecto que gerou o texto — a UI o nomeia junto da leitura. */
  rulingAspect: transitHitSchema.nullable(),
  areas: z.array(lifeAreaSchema),
  /** true quando o conteudo foi truncado por falta de plano. */
  locked: z.boolean(),
});
export type Horoscope = z.infer<typeof horoscopeSchema>;

/* ──────────────────────────────────────────────────────────────────────────
   Sinastria
   ────────────────────────────────────────────────────────────────────────── */

export const synastryAxisSchema = z.object({
  key: z.enum(['attraction', 'communication', 'stability', 'growth']),
  /** 0–100 */
  score: z.number().int().min(0).max(100),
});
export type SynastryAxis = z.infer<typeof synastryAxisSchema>;

export const synastrySchema = z.object({
  /** 0–100 — o anel grande. */
  affinity: z.number().int().min(0).max(100),
  summary: z.string(),
  axes: z.array(synastryAxisSchema),
  aspects: z.array(aspectSchema.extend({
    title: z.string(),
    note: z.string(),
  })),
});
export type Synastry = z.infer<typeof synastrySchema>;

/* ──────────────────────────────────────────────────────────────────────────
   Perfil de signo (tela 05)
   ────────────────────────────────────────────────────────────────────────── */

export const signProfileSchema = z.object({
  sign: signKeySchema,
  name: z.string(),
  dates: z.string(),
  element: elementKeySchema,
  modality: modalityKeySchema,
  ruler: bodyKeySchema,
  body: z.string(),
  rows: z.array(z.object({ key: z.string(), value: z.string() })),
  virtues: z.array(z.string()),
  shadow: z.array(z.string()),
});
export type SignProfile = z.infer<typeof signProfileSchema>;
