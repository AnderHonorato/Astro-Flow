# @astros/astro-core — superfície pública (contrato congelado)

Este arquivo é o contrato entre o motor e a API. **Não mude assinaturas sem
atualizar `apps/api` no mesmo passo.** Tudo é exportado de `src/index.ts`.

Todos os tipos de retorno vêm de `@astros/contracts`.

```ts
import type {
  BirthData, Chart, Horoscope, Period, SignKey, SignProfile,
  SkyNow, Synastry, TransitHit,
} from '@astros/contracts';

/** Resolve a data/hora civil local para UTC, aplicando DST histórico da IANA.
 *  Quando `birth.time` é null, usa meio-dia local e devolve estimated: true. */
export function resolveBirthInstant(birth: BirthData): {
  utc: Date;
  julianDay: number;
  estimated: boolean;
};

/** Carta natal completa: corpos, casas, ângulos, aspectos, distribuição. */
export function calculateChart(birth: BirthData): Chart;

/** Céu do instante `at`, formatado para o fuso `timezone`. */
export function calculateSkyNow(at: Date, timezone: string): SkyNow;

/** Aspectos entre o céu de `at` e os pontos natais de `chart`. */
export function calculateTransits(chart: Chart, at: Date, timezone: string): TransitHit[];

/** Aspectos cruzados entre duas cartas + eixos e nota de afinidade. */
export function calculateSynastry(a: Chart, b: Chart): Synastry;

/** Texto da leitura, derivado dos trânsitos — determinístico para
 *  (chart, period, date): a mesma carta no mesmo dia dá o mesmo texto. */
export function generateHoroscope(input: {
  chart: Chart;
  period: Period;
  date: Date;
  timezone: string;
  /** Quando false, o corpo vem truncado e `locked: true`. */
  unlocked: boolean;
}): Horoscope;

/** Perfil estático do signo (tela 05) — texto curado, sem cálculo. */
export function getSignProfile(sign: SignKey): SignProfile;

/* ── utilitários de formatação, reexportados para a API e a web ───────── */

/** 142.2389 → { sign: 'leo', degree: 22, minute: 14, formatted: '22°14′' } */
export function splitLongitude(longitude: number): {
  sign: SignKey; degree: number; minute: number; formatted: string;
};

/** Distância angular mínima entre duas longitudes (0–180). */
export function angularSeparation(a: number, b: number): number;
```

## Regras de cálculo

- **Efemérides**: `astronomy-engine` (puro JS, sem binding nativo). Longitudes
  eclípticas geocêntricas aparentes, época da data.
- **Retrogradação**: derivada da velocidade — amostre a longitude em `t` e
  `t + 1h` e compare; negativo é retrógrado.
- **Casas**: Placidus e Koch por solução iterativa sobre o tempo sideral local;
  casas iguais a partir do Ascendente. Sem hora de nascimento, `houses` vem
  vazio e `ascendant`/`midheaven` vêm `null`.
- **Aspectos**: tabela `ASPECTS` de `@astros/contracts` (ângulo + orbe).
  `applying` compara a separação em `t` e `t + 1h`: encolheu, está aplicando.
  `strength` = `(1 - orb/orbeMáximo) * peso médio dos dois corpos`.
- **Determinismo**: nada de `Math.random()`. Onde o texto precisa variar,
  derive de um hash estável de (id da carta, data, período).
