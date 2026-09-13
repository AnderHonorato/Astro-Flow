/**
 * STUB — as assinaturas abaixo sao o contrato descrito em `API.md` e existem
 * para que `apps/api` compile antes do motor ficar pronto. Cada funcao sera
 * substituida pela implementacao real; as assinaturas nao mudam.
 */

import type {
  BirthData, Chart, Horoscope, Period, SignKey, SignProfile,
  SkyNow, Synastry, TransitHit,
} from '@astros/contracts';

const notImplemented = (name: string): never => {
  throw new Error(`@astros/astro-core: ${name}() ainda nao foi implementado`);
};

export function resolveBirthInstant(_birth: BirthData): {
  utc: Date; julianDay: number; estimated: boolean;
} {
  return notImplemented('resolveBirthInstant');
}

export function calculateChart(_birth: BirthData): Chart {
  return notImplemented('calculateChart');
}

export function calculateSkyNow(_at: Date, _timezone: string): SkyNow {
  return notImplemented('calculateSkyNow');
}

export function calculateTransits(_chart: Chart, _at: Date, _timezone: string): TransitHit[] {
  return notImplemented('calculateTransits');
}

export function calculateSynastry(_a: Chart, _b: Chart): Synastry {
  return notImplemented('calculateSynastry');
}

export function generateHoroscope(_input: {
  chart: Chart; period: Period; date: Date; timezone: string; unlocked: boolean;
}): Horoscope {
  return notImplemented('generateHoroscope');
}

export function getSignProfile(_sign: SignKey): SignProfile {
  return notImplemented('getSignProfile');
}

export function splitLongitude(_longitude: number): {
  sign: SignKey; degree: number; minute: number; formatted: string;
} {
  return notImplemented('splitLongitude');
}

export function angularSeparation(_a: number, _b: number): number {
  return notImplemented('angularSeparation');
}
