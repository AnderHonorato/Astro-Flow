'use client';

import { useMemo } from 'react';
import {
  BODY_GLYPHS, SIGNS, SIGN_GLYPHS,
  type Aspect, type BodyPosition, type ElementKey, type SignKey,
} from '@astros/contracts';

/**
 * Roda do zodiaco — porte fiel de
 * templates/astrology-app-landing-page/project/ZodiacWheel.dc.html
 *
 * Geometria (viewBox 400x400, centro 200,200):
 *   r 196  fundo do vazio          r 188  aro interno do ceu
 *   r 178–152  faixa dos signos    r 152  aro dos graus
 *   r 118/114  aro interno         r 100/84  orbita dos planetas
 *   r 52   nucleo solar
 *
 * O Ascendente fica sempre a esquerda (9h) — por isso o -cos/+sin em `pt`.
 */

const CENTER = 200;

/** Preenchimento da faixa por elemento — Terra e Agua pesam, Fogo e Ar respiram. */
const ELEMENT_FILL: Record<ElementKey, string> = {
  fire: 'rgba(145,132,217,0.14)',
  earth: 'rgba(63,66,77,0.55)',
  air: 'rgba(167,161,219,0.09)',
  water: 'rgba(38,42,96,0.62)',
};

const ELEMENT_HATCH: Record<ElementKey, number> = {
  fire: 0.3, earth: 0.55, air: 0.14, water: 0.14,
};

export interface ZodiacWheelProps {
  /** Longitude do Ascendente; gira a roda inteira. */
  ascendant?: number;
  /**
   * `celestial` = emblema decorativo da landing (nucleo em raios, sem
   * planetas). `chart` = a carta de verdade.
   */
  variant?: 'chart' | 'celestial';
  /** Posicoes reais; vazio cai no emblema decorativo. */
  bodies?: BodyPosition[];
  /** 12 longitudes de cuspide. Vazio esconde as casas. */
  cusps?: number[];
  aspects?: Aspect[];
  activeSign?: SignKey | null;
  onSelectSign?: (sign: SignKey) => void;
  className?: string;
}

export function ZodiacWheel({
  ascendant = 228.5,
  variant = 'chart',
  bodies = [],
  cusps = [],
  aspects = [],
  activeSign = null,
  onSelectSign,
  className,
}: ZodiacWheelProps) {
  const celestial = variant === 'celestial';

  const geometry = useMemo(() => {
    /** Longitude eclíptica → ponto no SVG, com o Asc ancorado a esquerda. */
    const pt = (lon: number, r: number): [number, number] => {
      const a = ((lon - ascendant) * Math.PI) / 180;
      return [CENTER - r * Math.cos(a), CENTER + r * Math.sin(a)];
    };

    const f = (n: number) => n.toFixed(2);

    /** Setor anelar entre dois angulos — uma placa de signo. */
    const arc = (rOuter: number, rInner: number, a0: number, a1: number) => {
      const [x1, y1] = pt(a0, rOuter);
      const [x2, y2] = pt(a1, rOuter);
      const [x3, y3] = pt(a1, rInner);
      const [x4, y4] = pt(a0, rInner);
      return `M${f(x1)} ${f(y1)} A${rOuter} ${rOuter} 0 0 0 ${f(x2)} ${f(y2)} ` +
        `L${f(x3)} ${f(y3)} A${rInner} ${rInner} 0 0 1 ${f(x4)} ${f(y4)} Z`;
    };

    /** Posiciona um glifo 24x24 centrado sobre (lon, r). */
    const glyphTransform = (lon: number, r: number, scale: number) => {
      const [x, y] = pt(lon, r);
      return `translate(${f(x - 12 * scale)} ${f(y - 12 * scale)}) scale(${scale})`;
    };

    const segments = SIGNS.map((sign, i) => {
      const on = activeSign === sign.key;
      return {
        key: sign.key,
        name: sign.name,
        d: arc(178, 152, i * 30, i * 30 + 30),
        fill: on ? 'rgba(145,132,217,0.34)' : ELEMENT_FILL[sign.element],
        hatch: ELEMENT_HATCH[sign.element],
        transform: glyphTransform(i * 30 + 15, 165, 0.82),
        glyph: SIGN_GLYPHS[sign.key],
        stroke: on ? '#f5f4ff' : '#d2cefd',
        strokeWidth: on ? 2 : 1.5,
      };
    });

    // Graduacao de 2 em 2 graus; marca maior a cada 10.
    const ticks: Array<{ x1: string; y1: string; x2: string; y2: string; w: number; o: number }> = [];
    for (let d = 0; d < 360; d += 2) {
      const major = d % 10 === 0;
      const mid = d % 5 === 0;
      const len = major ? 9 : mid ? 5.5 : 2.8;
      const [x1, y1] = pt(d, 152);
      const [x2, y2] = pt(d, 152 + len);
      ticks.push({
        x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2),
        w: major ? 0.8 : 0.5, o: major ? 0.55 : 0.3,
      });
    }

    // Cuspides: os quatro angulos (I, IV, VII, X) sao solidos e vao mais longe.
    const cuspLines = cusps.map((lon, i) => {
      const isAngle = i === 0 || i === 3 || i === 6 || i === 9;
      const [x1, y1] = pt(lon, 118);
      const [x2, y2] = pt(lon, isAngle ? 188 : 152);
      const next = cusps[(i + 1) % 12] ?? lon + 30;
      const halfGap = (((next - lon) % 360) + 360) % 360 / 2;
      const [nx, ny] = pt(lon + halfGap, 126);
      return {
        x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2),
        stroke: isAngle ? '#b5abfc' : '#595d6c',
        w: isAngle ? 1.1 : 0.55,
        dash: isAngle ? 'none' : '3 3',
        num: i + 1, nx: f(nx), ny: f(ny),
      };
    });

    // Planetas: quem chega a menos de 9° do vizinho recua para o anel interno,
    // senao os discos de 10px se sobrepoem.
    const sorted = [...bodies].sort((a, b) => a.longitude - b.longitude);
    const planets = sorted.map((body, i) => {
      const prev = sorted[(i - 1 + sorted.length) % sorted.length]!;
      const gap = ((body.longitude - prev.longitude) % 360 + 360) % 360;
      const r = sorted.length > 1 && gap < 9 ? 84 : 100;
      const [cx, cy] = pt(body.longitude, r);
      const [lx1, ly1] = pt(body.longitude, 114);
      const [lx2, ly2] = pt(body.longitude, r + 10);
      const [dx, dy] = pt(body.longitude, r - 15);
      const luminary = body.body === 'sun' || body.body === 'moon';
      return {
        key: body.body,
        cx: f(cx), cy: f(cy),
        transform: glyphTransform(body.longitude, r, 0.58),
        glyph: BODY_GLYPHS[body.body],
        ink: luminary ? '#f5f4ff' : '#d2cefd',
        ring: body.body === 'sun' ? '#b5abfc' : '#595d6c',
        lx1: f(lx1), ly1: f(ly1), lx2: f(lx2), ly2: f(ly2),
        dx: f(dx), dy: f(dy + 2),
        degLabel: `${body.degreeInSign | 0}°${String(body.minuteInSign).padStart(2, '0')}`,
        retrograde: body.retrograde,
      };
    });

    // Linhas de aspecto: harmonico solido em roxo, tenso tracejado em cinza.
    const byBody = new Map(bodies.map((b) => [b.body, b.longitude]));
    const aspectLines = aspects.flatMap((aspect, i) => {
      const lonA = byBody.get(aspect.a);
      const lonB = byBody.get(aspect.b);
      if (lonA === undefined || lonB === undefined) return [];
      const [x1, y1] = pt(lonA, 114);
      const [x2, y2] = pt(lonB, 114);
      const soft = aspect.harmony === 'harmonic';
      return [{
        id: `${aspect.a}-${aspect.b}-${aspect.aspect}-${i}`,
        x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2),
        stroke: soft ? '#9184d9' : '#75798c',
        w: soft ? 0.8 : 0.6,
        dash: soft ? 'none' : '4 3',
        o: soft ? 0.75 : 0.5,
      }];
    });

    // Poeira estelar do anel externo — mesmo LCG e mesma semente do mock.
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const stars = Array.from({ length: 70 }, (_, i) => {
      const a = rnd() * Math.PI * 2;
      const rr = 180 + rnd() * 14;
      return {
        id: i,
        x: (CENTER + Math.cos(a) * rr).toFixed(1),
        y: (CENTER + Math.sin(a) * rr).toFixed(1),
        r: (0.4 + rnd() * 1.1).toFixed(2),
        o: (0.25 + rnd() * 0.6).toFixed(2),
      };
    });

    // Coroa de raios do nucleo (so no emblema celestial).
    const nRays = 28;
    const rays = Array.from({ length: nRays }, (_, i) => {
      const a = (i / nRays) * Math.PI * 2;
      const long = i % 2 === 0;
      const rIn = 30;
      const rOut = long ? 50 : 40;
      const w = long ? 0.055 : 0.035;
      const p = (ang: number, r: number) =>
        `${(CENTER + Math.cos(ang) * r).toFixed(2)} ${(CENTER + Math.sin(ang) * r).toFixed(2)}`;
      return { id: i, d: `M${p(a - w, rIn)} L${p(a, rOut)} L${p(a + w, rIn)} Z`, o: long ? 0.85 : 0.5 };
    });

    return { segments, ticks, cuspLines, planets, aspectLines, stars, rays };
  }, [ascendant, bodies, cusps, aspects, activeSign]);

  const showPlanets = !celestial && geometry.planets.length > 0;

  return (
    <div className={className} style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
      <svg
        viewBox="0 0 400 400"
        width="100%"
        height="100%"
        style={{ display: 'block', overflow: 'visible' }}
        role="img"
        aria-label="Roda do zodíaco"
      >
        <defs>
          <radialGradient id="zwSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f5f4ff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#b5abfc" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#9184d9" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="zwVoid" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1b1e30" />
            <stop offset="100%" stopColor="#12141f" />
          </radialGradient>
          <pattern id="zwHatch" width="6" height="6" patternTransform="rotate(35)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#9184d9" strokeOpacity="0.22" strokeWidth="1" />
          </pattern>
        </defs>

        <circle cx={CENTER} cy={CENTER} r={196} fill="url(#zwVoid)" />
        {geometry.stars.map((s) => (
          <circle key={s.id} cx={s.x} cy={s.y} r={s.r} fill="#e9e9ed" opacity={s.o} />
        ))}

        <circle cx={CENTER} cy={CENTER} r={192} fill="none" stroke="#595d6c" strokeWidth={0.6} opacity={0.7} />
        <circle cx={CENTER} cy={CENTER} r={188} fill="none" stroke="#9184d9" strokeWidth={0.5} opacity={0.45} />

        {geometry.ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#b2b6ca" strokeWidth={t.w} opacity={t.o} />
        ))}

        {geometry.segments.map((seg) => {
          const interactive = Boolean(onSelectSign);
          return (
            <g
              key={seg.key}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              onClick={interactive ? () => onSelectSign?.(seg.key) : undefined}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? seg.name : undefined}
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectSign?.(seg.key);
                      }
                    }
                  : undefined
              }
            >
              <path d={seg.d} fill={seg.fill} stroke="#595d6c" strokeWidth={0.7} opacity={0.95} />
              <path d={seg.d} fill="url(#zwHatch)" opacity={seg.hatch} />
              <g transform={seg.transform}>
                <path
                  d={seg.glyph} fill="none" stroke={seg.stroke} strokeWidth={seg.strokeWidth}
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </g>
            </g>
          );
        })}

        <circle cx={CENTER} cy={CENTER} r={152} fill="none" stroke="#595d6c" strokeWidth={0.7} opacity={0.8} />
        <circle cx={CENTER} cy={CENTER} r={118} fill="none" stroke="#595d6c" strokeWidth={0.7} opacity={0.8} />
        <circle cx={CENTER} cy={CENTER} r={114} fill="none" stroke="#9184d9" strokeWidth={0.5} opacity={0.35} />

        {geometry.cuspLines.map((c) => (
          <g key={c.num}>
            <line
              x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
              stroke={c.stroke} strokeWidth={c.w} strokeDasharray={c.dash} opacity={0.9}
            />
            <text
              x={c.nx} y={c.ny} fill="#b2b6ca" fontSize={8} fontFamily="Inter, system-ui"
              textAnchor="middle" dominantBaseline="middle" opacity={0.85}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {c.num}
            </text>
          </g>
        ))}

        {geometry.aspectLines.map((a) => (
          <line
            key={a.id} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
            stroke={a.stroke} strokeWidth={a.w} strokeDasharray={a.dash} opacity={a.o}
          />
        ))}

        <circle cx={CENTER} cy={CENTER} r={52} fill="url(#zwSun)" opacity={celestial ? 1 : 0.5} />
        {celestial
          ? geometry.rays.map((r) => <path key={r.id} d={r.d} fill="#e7e5fe" opacity={r.o} />)
          : null}
        <circle
          cx={CENTER} cy={CENTER} r={celestial ? 30 : 22}
          fill="none" stroke="#d2cefd" strokeWidth={0.8} opacity={0.6}
        />

        {showPlanets
          ? geometry.planets.map((p) => (
              <g key={p.key}>
                <line x1={p.lx1} y1={p.ly1} x2={p.lx2} y2={p.ly2} stroke="#9184d9" strokeWidth={0.6} opacity={0.5} />
                <circle cx={p.cx} cy={p.cy} r={10} fill="#161826" stroke={p.ring} strokeWidth={0.8} opacity={0.96} />
                <g transform={p.transform}>
                  <path
                    d={p.glyph} fill="none" stroke={p.ink} strokeWidth={1.7}
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                </g>
                <text
                  x={p.dx} y={p.dy} fill="#9397ab" fontSize={6.5} fontFamily="Inter, system-ui"
                  textAnchor="middle" style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {p.degLabel}{p.retrograde ? ' ℞' : ''}
                </text>
              </g>
            ))
          : null}
      </svg>
    </div>
  );
}
