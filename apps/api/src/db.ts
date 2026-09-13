/**
 * Cliente Prisma unico. Em dev o `tsx watch` reavalia o modulo a cada save;
 * guardar a instancia no globalThis evita abrir um pool novo a cada reload.
 */

import { PrismaClient } from '@prisma/client';
import { env, isProduction } from './env.js';

const globalForPrisma = globalThis as unknown as { __astrosPrisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.__astrosPrisma ??
  new PrismaClient({
    log: env.LOG_LEVEL === 'debug' || env.LOG_LEVEL === 'trace'
      ? ['query', 'warn', 'error']
      : ['warn', 'error'],
  });

if (!isProduction) globalForPrisma.__astrosPrisma = prisma;

/** Ping real no banco — usado por GET /health. */
export async function checkDatabase(): Promise<{ ok: boolean; latencyMs: number }> {
  const started = Date.now();
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    return { ok: true, latencyMs: Date.now() - started };
  } catch {
    return { ok: false, latencyMs: Date.now() - started };
  }
}
