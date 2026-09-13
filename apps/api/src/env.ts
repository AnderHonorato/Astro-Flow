/**
 * Configuracao validada. Qualquer variavel ausente ou malformada derruba o
 * processo no boot, com mensagem legivel — nunca em producao no meio de um
 * request. A superficie e a documentada em `.env.example`.
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const here = dirname(fileURLToPath(import.meta.url));

// `override: false` (padrao) e proposital: o que ja esta no ambiente (CI,
// docker, vitest) manda sobre o arquivo.
dotenv.config({ path: resolve(here, '..', '.env') });

/** "true"/"1"/"yes" -> true. Vazio ou ausente -> o default. */
const boolish = (fallback: boolean) =>
  z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined || value.trim() === '') return fallback;
      return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
    });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL e obrigatoria'),

  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET precisa de ao menos 16 caracteres'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),

  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),

  GEOCODING_API_URL: z
    .string()
    .default('https://geocoding-api.open-meteo.com/v1/search'),
  GEOCODING_ENABLED: boolish(true),

  /** Requisicoes/minuto por IP nas rotas comuns. */
  RATE_LIMIT_GLOBAL: z.coerce.number().int().min(1).default(240),
  /** Requisicoes/minuto por IP em /auth/* e /charts/calculate. */
  RATE_LIMIT_STRICT: z.coerce.number().int().min(1).default(20),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const detail = parsed.error.issues
    .map((issue) => `  • ${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
    .join('\n');
  // eslint-disable-next-line no-console
  console.error(`Configuracao invalida em apps/api/.env:\n${detail}`);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
