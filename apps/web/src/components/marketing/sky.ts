/**
 * Dados do ceu que alimentam a faixa ao vivo e a linha do rodape.
 *
 * A landing e um server component: busca `GET /sky/now` no servidor, com
 * revalidacao, e entrega HTML ja formatado — nada de efemeride no cliente.
 *
 * ATENCAO — fallback: quando a API nao responde (ambiente de dev sem
 * `apps/api` no ar, build estatico sem backend), caimos nos valores do mock
 * de design. Eles sao VISUALMENTE identicos, mas NAO sao dados ao vivo:
 * `live: false` marca isso para quem le o codigo, e a faixa deixa de anunciar
 * "efemerides ao vivo" como se fosse verdade — veja `Hero`/`LiveBand`, que
 * recebem esse flag.
 */

import {
  ASPECT_GLYPHS, BODY_GLYPHS, BODY_LABELS, MOON_PHASE_LABELS, SIGN_BY_KEY,
  type AspectKey, type SkyNow,
} from '@astros/contracts';
import { api } from '@/lib/api';

/* ── formas ────────────────────────────────────────────────────────────── */

export interface LiveCell {
  /** Rotulo em versalete: "sol agora", "lua"... */
  label: string;
  /** Valor ja formatado para leitura direta. */
  value: string;
  /** Path 24x24 desenhado a traco. */
  glyph: string;
}

export interface SkyBand {
  cells: LiveCell[];
  /** "Sol 22°14′ Leão · Lua 8°02′ Peixes · atualizado agora" */
  footer: string;
  /** false = a faixa esta mostrando o fallback do design, nao o ceu real. */
  live: boolean;
}

/* ── simbolos ──────────────────────────────────────────────────────────── */

/** Retrogrado nao e corpo nem aspecto: o glifo da seta vem do mock. */
const RETROGRADE_GLYPH = 'M20 12a8 8 0 1 1-3.2-6.4 M20 4v5h-5';

const ASPECT_SYMBOLS: Record<AspectKey, string> = {
  conjunction: '☌', sextile: '⚹', square: '□',
  trine: '△', opposition: '☍', quincunx: '⚻',
};

/* ── fallback (valores do mock 1a) ─────────────────────────────────────── */

const FALLBACK: SkyBand = {
  cells: [
    { label: 'sol agora', value: 'Leão 22°14′', glyph: BODY_GLYPHS.sun },
    { label: 'lua', value: 'Peixes · minguante 68%', glyph: BODY_GLYPHS.moon },
    { label: 'retrógrados', value: 'Mercúrio · Saturno', glyph: RETROGRADE_GLYPH },
    { label: 'próximo aspecto', value: 'Vênus △ Netuno · 19h42', glyph: ASPECT_GLYPHS.trine },
  ],
  footer: 'Sol 22°14′ Leão · Lua 8°02′ Peixes · atualizado agora',
  live: false,
};

/* ── formatacao ────────────────────────────────────────────────────────── */

function signName(sign: SkyNow['sun']['sign']): string {
  return SIGN_BY_KEY[sign].name;
}

/** "19h42" no fuso do ceu consultado. */
function formatHour(iso: string, timezone: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone,
    }).format(at).replace(':', 'h');
  } catch {
    return '';
  }
}

function format(sky: SkyNow): Omit<SkyBand, 'live'> {
  const moonPhase = MOON_PHASE_LABELS[sky.moon.phase].toLowerCase();
  const moonValue =
    `${signName(sky.moon.sign)} · ${moonPhase} ${Math.round(sky.moon.illumination)}%`;

  const retrogrades = sky.retrogrades.map((r) => BODY_LABELS[r.body]);
  const retroValue = retrogrades.length > 0 ? retrogrades.join(' · ') : 'nenhum';

  const next = sky.upcomingAspects[0];
  const nextValue = next
    ? [
        `${BODY_LABELS[next.a]} ${ASPECT_SYMBOLS[next.aspect]} ${BODY_LABELS[next.b]}`,
        formatHour(next.exactAt, sky.timezone),
      ].filter(Boolean).join(' · ')
    : 'céu calmo nas próximas 48h';

  return {
    cells: [
      {
        label: 'sol agora',
        value: `${signName(sky.sun.sign)} ${sky.sun.formatted}`,
        glyph: BODY_GLYPHS.sun,
      },
      { label: 'lua', value: moonValue, glyph: BODY_GLYPHS.moon },
      { label: 'retrógrados', value: retroValue, glyph: RETROGRADE_GLYPH },
      {
        label: 'próximo aspecto',
        value: nextValue,
        glyph: next ? ASPECT_GLYPHS[next.aspect] : ASPECT_GLYPHS.trine,
      },
    ],
    footer:
      `Sol ${sky.sun.formatted} ${signName(sky.sun.sign)}` +
      ` · Lua ${sky.moon.formatted} ${signName(sky.moon.sign)} · atualizado agora`,
  };
}

/* ── carga ─────────────────────────────────────────────────────────────── */

/**
 * Le o ceu de agora. Nunca lanca: a landing precisa renderizar mesmo com o
 * backend fora do ar — nesse caso devolve o fallback marcado com `live:false`.
 */
export async function loadSkyBand(): Promise<SkyBand> {
  try {
    const { sky } = await api.skyNow();
    return { ...format(sky), live: true };
  } catch {
    return FALLBACK;
  }
}
