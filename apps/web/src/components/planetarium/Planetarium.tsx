'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Planetarium.module.css';
import {
  ALL_OBJECTS,
  CONSTELLATIONS,
  DEEP_SKY,
  NAMED_STARS,
  PLANETS,
  type CatalogObject,
} from './catalog';

type AstronomyApi = {
  Observer: new (latitude: number, longitude: number, height: number) => unknown;
  Equator: (
    body: string,
    date: Date,
    observer: unknown,
    ofdate: boolean,
    aberration: boolean,
  ) => { ra: number; dec: number; dist: number };
  Horizon: (
    date: Date,
    observer: unknown,
    ra: number,
    dec: number,
    refraction: string,
  ) => { azimuth: number; altitude: number };
  Illumination?: (body: string, date: Date) => { phase_angle: number; phase_fraction: number; mag: number };
};

declare global {
  interface Window {
    Astronomy?: AstronomyApi;
  }
}

type ViewState = { azimuth: number; altitude: number; fov: number };
type Position = { az: number; alt: number; ra?: number; dec?: number; dist?: number };
type RenderedTarget = { object: CatalogObject; x: number; y: number; radius: number; position: Position };
type LayerState = {
  constellations: boolean;
  constellationArt: boolean;
  azimuthGrid: boolean;
  equatorialGrid: boolean;
  ecliptic: boolean;
  atmosphere: boolean;
  landscape: boolean;
  labels: boolean;
  deepSky: boolean;
  planets: boolean;
  horizon: boolean;
};

type IconName =
  | 'menu' | 'search' | 'pin' | 'clock' | 'minus' | 'plus' | 'play' | 'pause'
  | 'layers' | 'fullscreen' | 'camera' | 'locate' | 'close' | 'star' | 'info'
  | 'rewind' | 'forward' | 'now' | 'help' | 'eye' | 'compass' | 'night';

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const DEFAULT_LOCATION = { latitude: -23.5505, longitude: -46.6333, name: 'São Paulo, Brasil' };
const BODY_MAP: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune',
};
const PLANET_GLYPHS: Record<string, string> = {
  sun: '☉', moon: '☾', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆',
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  const paths: Record<IconName, React.ReactNode> = {
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    pin: <><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></>,
    clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>,
    minus: <path d="M6 12h12" />,
    plus: <path d="M12 6v12M6 12h12" />,
    play: <path d="m9 7 8 5-8 5Z" />,
    pause: <><path d="M9 7v10M15 7v10" /></>,
    layers: <><path d="m12 4 8 4-8 4-8-4 8-4Z" /><path d="m4 12 8 4 8-4M4 16l8 4 8-4" /></>,
    fullscreen: <><path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4" /></>,
    camera: <><path d="M5 8h3l1.2-2h5.6L16 8h3v10H5Z" /><circle cx="12" cy="13" r="3" /></>,
    locate: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></>,
    close: <path d="m7 7 10 10M17 7 7 17" />,
    star: <path d="m12 4 2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8L12 4Z" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7.5h.01" /></>,
    rewind: <><path d="m11 8-5 4 5 4V8ZM18 8l-5 4 5 4V8Z" /></>,
    forward: <><path d="m13 8 5 4-5 4V8ZM6 8l5 4-5 4V8Z" /></>,
    now: <><circle cx="12" cy="12" r="7" /><path d="M12 8v4l3 2" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9.2a2.4 2.4 0 0 1 4.6.9c0 1.8-2.4 2-2.4 3.5M12 17h.01" /></>,
    eye: <><path d="M3 12s3.3-5 9-5 9 5 9 5-3.3 5-9 5-9-5-9-5Z" /><circle cx="12" cy="12" r="2.5" /></>,
    compass: <><circle cx="12" cy="12" r="8" /><path d="m14.8 9.2-1.5 4.1-4.1 1.5 1.5-4.1 4.1-1.5Z" /></>,
    night: <path d="M18.5 15.5A7 7 0 0 1 8.5 5a7.5 7.5 0 1 0 10 10.5Z" />,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeAngle(value: number) {
  return ((value % 360) + 360) % 360;
}

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function dot(a: [number, number, number], b: [number, number, number]) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function norm(v: [number, number, number]): [number, number, number] {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
}

function horizontalVector(az: number, alt: number): [number, number, number] {
  const a = az * DEG;
  const h = alt * DEG;
  const c = Math.cos(h);
  return [c * Math.sin(a), c * Math.cos(a), Math.sin(h)];
}

function projectHorizontal(
  az: number,
  alt: number,
  view: ViewState,
  width: number,
  height: number,
): { x: number; y: number; visible: boolean; depth: number } {
  const forward = norm(horizontalVector(view.azimuth, view.altitude));
  const worldUp: [number, number, number] = [0, 0, 1];
  let right = cross(forward, worldUp);
  if (Math.hypot(...right) < 0.01) right = [1, 0, 0];
  right = norm(right);
  const up = norm(cross(right, forward));
  const point = horizontalVector(az, alt);
  const depth = dot(point, forward);
  if (depth <= 0.03) return { x: 0, y: 0, visible: false, depth };
  const scale = Math.min(width, height) / (2 * Math.tan((view.fov * DEG) / 2));
  const x = width / 2 + (dot(point, right) / depth) * scale;
  const y = height / 2 - (dot(point, up) / depth) * scale;
  return { x, y, visible: x > -100 && x < width + 100 && y > -100 && y < height + 100, depth };
}

function julianDay(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function localSiderealDegrees(date: Date, longitude: number) {
  const jd = julianDay(date);
  const t = (jd - 2451545.0) / 36525;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t - (t * t * t) / 38710000;
  return normalizeAngle(gmst + longitude);
}

function radecToHorizontal(raHours: number, decDeg: number, date: Date, latitude: number, longitude: number): Position {
  const lst = localSiderealDegrees(date, longitude);
  const hourAngle = normalizeAngle(lst - raHours * 15) * DEG;
  const dec = decDeg * DEG;
  const lat = latitude * DEG;
  const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(hourAngle);
  const alt = Math.asin(clamp(sinAlt, -1, 1));
  const y = -Math.sin(hourAngle) * Math.cos(dec);
  const x = Math.sin(dec) * Math.cos(lat) - Math.cos(dec) * Math.sin(lat) * Math.cos(hourAngle);
  const az = Math.atan2(y, x);
  return { az: normalizeAngle(az * RAD), alt: alt * RAD, ra: raHours, dec: decDeg };
}

function eclipticToEquatorial(longitude: number, latitude = 0): { ra: number; dec: number } {
  const lon = longitude * DEG;
  const lat = latitude * DEG;
  const eps = 23.439291 * DEG;
  const x = Math.cos(lon) * Math.cos(lat);
  const y = Math.sin(lon) * Math.cos(lat) * Math.cos(eps) - Math.sin(lat) * Math.sin(eps);
  const z = Math.sin(lon) * Math.cos(lat) * Math.sin(eps) + Math.sin(lat) * Math.cos(eps);
  const ra = normalizeAngle(Math.atan2(y, x) * RAD) / 15;
  const dec = Math.asin(z) * RAD;
  return { ra, dec };
}

function seededStars() {
  let seed = 1337;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  return Array.from({ length: 900 }, (_, index) => {
    const ra = random() * 24;
    const dec = Math.asin(random() * 2 - 1) * RAD;
    const magnitude = 3.8 + random() * 3.3;
    return { id: `field-${index}`, ra, dec, magnitude };
  });
}

const FIELD_STARS = seededStars();
const STAR_BY_ID = new Map(NAMED_STARS.map((star) => [star.id, star]));

function formatDateLocal(date: Date) {
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function cardinal(az: number) {
  const names = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
  return names[Math.round(normalizeAngle(az) / 45) % 8];
}

function round(value: number | undefined, digits = 1) {
  return value == null || !Number.isFinite(value) ? '—' : value.toFixed(digits);
}

function objectGlyph(object: CatalogObject) {
  if (object.kind === 'planeta') return PLANET_GLYPHS[object.id] ?? '●';
  if (object.kind === 'ceu-profundo') return '◇';
  return '✦';
}

export default function Planetarium() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderedRef = useRef<RenderedTarget[]>([]);
  const dragRef = useRef<{ x: number; y: number; az: number; alt: number; moved: boolean } | null>(null);

  const [astronomy, setAstronomy] = useState<AstronomyApi | null>(null);
  const [engineError, setEngineError] = useState(false);
  const [date, setDate] = useState(() => new Date());
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [view, setView] = useState<ViewState>({ azimuth: 0, altitude: 28, fov: 95 });
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [layers, setLayers] = useState<LayerState>({
    constellations: true,
    constellationArt: true,
    azimuthGrid: true,
    equatorialGrid: false,
    ecliptic: false,
    atmosphere: true,
    landscape: true,
    labels: true,
    deepSky: true,
    planets: true,
    horizon: true,
  });
  const [nightMode, setNightMode] = useState(false);
  const [selected, setSelected] = useState<CatalogObject | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [followSelected, setFollowSelected] = useState(false);
  const [search, setSearch] = useState('');
  const [layersOpen, setLayersOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [locationDraft, setLocationDraft] = useState({ latitude: String(DEFAULT_LOCATION.latitude), longitude: String(DEFAULT_LOCATION.longitude), name: DEFAULT_LOCATION.name });

  const observer = useMemo(() => {
    if (!astronomy) return null;
    try { return new astronomy.Observer(location.latitude, location.longitude, 0); } catch { return null; }
  }, [astronomy, location.latitude, location.longitude]);

  useEffect(() => {
    const stored = window.localStorage.getItem('astroflow:planetarium:favorites');
    if (stored) {
      try { setFavorites(JSON.parse(stored)); } catch { /* preferência corrompida: ignora */ }
    }
  }, []);

  useEffect(() => {
    if (window.Astronomy) {
      setAstronomy(window.Astronomy);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js';
    script.async = true;
    script.onload = () => window.Astronomy ? setAstronomy(window.Astronomy) : setEngineError(true);
    script.onerror = () => setEngineError(true);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setDate((current) => new Date(current.getTime() + speed * 250));
    }, 250);
    return () => window.clearInterval(timer);
  }, [playing, speed]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const getPosition = useCallback((object: CatalogObject): Position | null => {
    if (object.kind === 'planeta') {
      if (!astronomy || !observer) return null;
      const body = BODY_MAP[object.id];
      if (!body) return null;
      try {
        const equ = astronomy.Equator(body, date, observer, true, true);
        const hor = astronomy.Horizon(date, observer, equ.ra, equ.dec, 'normal');
        return { az: hor.azimuth, alt: hor.altitude, ra: equ.ra, dec: equ.dec, dist: equ.dist };
      } catch {
        return null;
      }
    }
    if (object.ra == null || object.dec == null) return null;
    return radecToHorizontal(object.ra, object.dec, date, location.latitude, location.longitude);
  }, [astronomy, observer, date, location.latitude, location.longitude]);

  const selectObject = useCallback((object: CatalogObject, follow = false) => {
    setSelected(object);
    setSearch('');
    const position = getPosition(object);
    if (position) {
      setSelectedPosition(position);
      if (follow) {
        setFollowSelected(true);
        setView((current) => ({ ...current, azimuth: position.az, altitude: clamp(position.alt, -20, 88), fov: Math.min(current.fov, 42) }));
      }
    }
  }, [getPosition]);

  useEffect(() => {
    if (!selected) {
      setSelectedPosition(null);
      return;
    }
    const position = getPosition(selected);
    setSelectedPosition(position);
    if (position && followSelected) {
      setView((current) => ({ ...current, azimuth: position.az, altitude: clamp(position.alt, -25, 88) }));
    }
  }, [selected, getPosition, followSelected, date]);

  const toggleLayer = (key: keyof LayerState) => {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelW = Math.round(rect.width * dpr);
    const pixelH = Math.round(rect.height * dpr);
    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    let sunAlt = -20;
    const sun = PLANETS.find((item) => item.id === 'sun');
    if (sun) sunAlt = getPosition(sun)?.alt ?? -20;
    const daylight = layers.atmosphere ? clamp((sunAlt + 12) / 22, 0, 1) : 0;
    const horizonGlow = layers.atmosphere ? clamp((sunAlt + 20) / 35, 0.05, 0.8) : 0;

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    if (nightMode) {
      sky.addColorStop(0, '#100205');
      sky.addColorStop(0.65, '#180306');
      sky.addColorStop(1, '#240507');
    } else {
      const top = daylight > 0.2 ? `rgb(${Math.round(9 + 38 * daylight)},${Math.round(18 + 76 * daylight)},${Math.round(38 + 104 * daylight)})` : '#050812';
      const bottom = daylight > 0.2 ? `rgb(${Math.round(18 + 86 * daylight)},${Math.round(30 + 93 * daylight)},${Math.round(58 + 92 * daylight)})` : `rgb(${Math.round(6 + 30 * horizonGlow)},${Math.round(9 + 30 * horizonGlow)},${Math.round(20 + 44 * horizonGlow)})`;
      sky.addColorStop(0, top);
      sky.addColorStop(0.72, '#090d1b');
      sky.addColorStop(1, bottom);
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const project = (az: number, alt: number) => projectHorizontal(az, alt, view, width, height);

    const strokeProjectedCurve = (points: Array<[number, number]>, color: string, lineWidth = 1, dash: number[] = []) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash(dash);
      let drawing = false;
      ctx.beginPath();
      for (const [az, alt] of points) {
        const p = project(az, alt);
        if (!p.visible) { drawing = false; continue; }
        if (!drawing) { ctx.moveTo(p.x, p.y); drawing = true; } else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.restore();
    };

    if (layers.azimuthGrid) {
      for (let alt = -30; alt <= 75; alt += 15) {
        const points: Array<[number, number]> = [];
        for (let az = 0; az <= 360; az += 3) points.push([az, alt]);
        strokeProjectedCurve(points, nightMode ? 'rgba(160,35,35,.24)' : 'rgba(124,144,190,.16)', 0.8);
      }
      for (let az = 0; az < 360; az += 15) {
        const points: Array<[number, number]> = [];
        for (let alt = -35; alt <= 90; alt += 2) points.push([az, alt]);
        strokeProjectedCurve(points, nightMode ? 'rgba(160,35,35,.2)' : 'rgba(124,144,190,.13)', 0.8);
      }
    }

    if (layers.equatorialGrid) {
      const gridColor = nightMode ? 'rgba(210,55,55,.22)' : 'rgba(125,112,204,.23)';
      for (let ra = 0; ra < 24; ra += 2) {
        const points: Array<[number, number]> = [];
        for (let dec = -75; dec <= 75; dec += 2.5) {
          const h = radecToHorizontal(ra, dec, date, location.latitude, location.longitude);
          points.push([h.az, h.alt]);
        }
        strokeProjectedCurve(points, gridColor, 0.8, [3, 4]);
      }
      for (let dec = -60; dec <= 60; dec += 15) {
        const points: Array<[number, number]> = [];
        for (let ra = 0; ra <= 24; ra += 0.15) {
          const h = radecToHorizontal(ra, dec, date, location.latitude, location.longitude);
          points.push([h.az, h.alt]);
        }
        strokeProjectedCurve(points, gridColor, 0.8, [3, 4]);
      }
    }

    if (layers.ecliptic) {
      const points: Array<[number, number]> = [];
      for (let lon = 0; lon <= 360; lon += 2) {
        const eq = eclipticToEquatorial(lon);
        const h = radecToHorizontal(eq.ra, eq.dec, date, location.latitude, location.longitude);
        points.push([h.az, h.alt]);
      }
      strokeProjectedCurve(points, nightMode ? 'rgba(255,90,70,.62)' : 'rgba(224,180,93,.58)', 1.2, [7, 6]);
    }

    if (layers.constellationArt) {
      for (const constellation of CONSTELLATIONS) {
        const positions = constellation.lines.flatMap(([a, b]) => [STAR_BY_ID.get(a), STAR_BY_ID.get(b)]).filter(Boolean) as CatalogObject[];
        if (!positions.length) continue;
        const projected = positions.map((star) => {
          const pos = getPosition(star);
          return pos ? project(pos.az, pos.alt) : null;
        }).filter((value): value is { x: number; y: number; visible: boolean; depth: number } => Boolean(value?.visible));
        if (!projected.length) continue;
        const cx = projected.reduce((sum, p) => sum + p.x, 0) / projected.length;
        const cy = projected.reduce((sum, p) => sum + p.y, 0) / projected.length;
        const radius = clamp(70 + (110 - view.fov) * 1.4, 50, 150);
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        glow.addColorStop(0, nightMode ? 'rgba(120,12,12,.12)' : 'rgba(118,101,207,.10)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (layers.constellations) {
      ctx.save();
      ctx.strokeStyle = nightMode ? 'rgba(226,70,70,.55)' : 'rgba(150,137,226,.52)';
      ctx.lineWidth = 1.15;
      for (const constellation of CONSTELLATIONS) {
        for (const [startId, endId] of constellation.lines) {
          const start = STAR_BY_ID.get(startId);
          const end = STAR_BY_ID.get(endId);
          if (!start || !end) continue;
          const a = getPosition(start);
          const b = getPosition(end);
          if (!a || !b) continue;
          const pa = project(a.az, a.alt);
          const pb = project(b.az, b.alt);
          if (!pa.visible || !pb.visible) continue;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    const starOpacity = clamp(1 - daylight * 0.88, 0.1, 1);
    for (const star of FIELD_STARS) {
      const pos = radecToHorizontal(star.ra, star.dec, date, location.latitude, location.longitude);
      const p = project(pos.az, pos.alt);
      if (!p.visible || pos.alt < -12) continue;
      const radius = clamp((7.5 - star.magnitude) * 0.34 * (105 / view.fov), 0.35, 1.7);
      ctx.globalAlpha = starOpacity * clamp((7.6 - star.magnitude) / 4, 0.08, 0.72);
      ctx.fillStyle = nightMode ? '#f15d5d' : '#dfe8ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const rendered: RenderedTarget[] = [];
    for (const star of NAMED_STARS) {
      const pos = getPosition(star);
      if (!pos || pos.alt < -18) continue;
      const p = project(pos.az, pos.alt);
      if (!p.visible) continue;
      const radius = clamp((3.9 - (star.magnitude ?? 3)) * 1.2 + 2.2, 1.6, 5.2) * clamp(100 / view.fov, 0.8, 2);
      ctx.globalAlpha = starOpacity;
      ctx.fillStyle = nightMode ? '#ff7676' : '#f4f6ff';
      ctx.shadowColor = nightMode ? 'rgba(255,55,55,.75)' : 'rgba(204,219,255,.88)';
      ctx.shadowBlur = radius * 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      if (layers.labels && (view.fov < 115 || (star.magnitude ?? 5) < 1.2)) {
        ctx.font = '500 11px Inter, system-ui, sans-serif';
        ctx.fillStyle = nightMode ? 'rgba(255,125,125,.9)' : 'rgba(230,234,248,.86)';
        ctx.fillText(star.name, p.x + radius + 5, p.y - 4);
      }
      rendered.push({ object: star, x: p.x, y: p.y, radius: Math.max(12, radius + 7), position: pos });
    }

    if (layers.deepSky) {
      for (const object of DEEP_SKY) {
        const pos = getPosition(object);
        if (!pos || pos.alt < -18) continue;
        const p = project(pos.az, pos.alt);
        if (!p.visible) continue;
        const r = clamp(5.4 * (100 / view.fov), 3.5, 9);
        ctx.save();
        ctx.strokeStyle = nightMode ? 'rgba(255,85,85,.72)' : 'rgba(142,185,219,.72)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p.x - r - 3, p.y); ctx.lineTo(p.x + r + 3, p.y);
        ctx.moveTo(p.x, p.y - r - 3); ctx.lineTo(p.x, p.y + r + 3);
        ctx.stroke();
        if (layers.labels && view.fov < 100) {
          ctx.font = '500 10px Inter, system-ui, sans-serif';
          ctx.fillStyle = nightMode ? 'rgba(255,120,120,.82)' : 'rgba(170,208,232,.84)';
          ctx.fillText(object.name, p.x + r + 5, p.y - 3);
        }
        ctx.restore();
        rendered.push({ object, x: p.x, y: p.y, radius: Math.max(13, r + 6), position: pos });
      }
    }

    if (layers.planets) {
      for (const object of PLANETS) {
        const pos = getPosition(object);
        if (!pos || pos.alt < -20) continue;
        const p = project(pos.az, pos.alt);
        if (!p.visible) continue;
        const base = object.id === 'sun' ? 14 : object.id === 'moon' ? 11 : object.id === 'jupiter' ? 6 : object.id === 'venus' ? 5.5 : 4.4;
        const r = clamp(base * (95 / view.fov), 3.5, object.id === 'sun' ? 28 : 16);
        const color = nightMode ? '#ff4f4f' : object.id === 'sun' ? '#fff4cf' : object.id === 'moon' ? '#e9edf4' : object.id === 'mars' ? '#db8d74' : object.id === 'jupiter' ? '#d6b895' : object.id === 'saturn' ? '#dfcf9e' : object.id === 'venus' ? '#f7e8c3' : '#b7cbed';
        ctx.save();
        ctx.shadowColor = nightMode ? 'rgba(255,50,50,.9)' : color;
        ctx.shadowBlur = object.id === 'sun' ? 28 : 12;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (object.id === 'saturn' && view.fov < 50) {
          ctx.strokeStyle = nightMode ? '#ff5555' : '#d8c993';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, r * 1.8, r * 0.55, -0.3, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (layers.labels) {
          ctx.font = '600 11px Inter, system-ui, sans-serif';
          ctx.fillStyle = nightMode ? 'rgba(255,125,125,.95)' : 'rgba(246,246,249,.92)';
          ctx.fillText(object.name, p.x + r + 6, p.y - 4);
        }
        ctx.restore();
        rendered.push({ object, x: p.x, y: p.y, radius: Math.max(16, r + 8), position: pos });
      }
    }

    if (layers.horizon) {
      const horizonPoints: Array<[number, number]> = [];
      for (let az = 0; az <= 360; az += 2) horizonPoints.push([az, 0]);
      strokeProjectedCurve(horizonPoints, nightMode ? 'rgba(230,60,60,.58)' : 'rgba(188,198,221,.38)', 1.25);
    }

    if (layers.landscape && view.altitude < 65) {
      const horizonSamples = Array.from({ length: 181 }, (_, i) => {
        const az = normalizeAngle(view.azimuth - 90 + i);
        return project(az, -1.2 - Math.sin(i * 0.14) * 1.6 - Math.sin(i * 0.047) * 2.5);
      }).filter((p) => p.visible);
      if (horizonSamples.length > 2) {
        ctx.save();
        ctx.fillStyle = nightMode ? 'rgba(28,0,2,.9)' : daylight > 0.25 ? 'rgba(14,20,29,.86)' : 'rgba(4,7,12,.94)';
        ctx.beginPath();
        ctx.moveTo(horizonSamples[0].x, height + 20);
        for (const p of horizonSamples) ctx.lineTo(p.x, p.y);
        ctx.lineTo(horizonSamples[horizonSamples.length - 1].x, height + 20);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    for (const [az, label] of [[0, 'N'], [90, 'L'], [180, 'S'], [270, 'O']] as Array<[number, string]>) {
      const p = project(az, 1.5);
      if (!p.visible) continue;
      ctx.font = '700 11px Inter, system-ui, sans-serif';
      ctx.fillStyle = label === 'S' ? (nightMode ? '#ff4f4f' : '#df726f') : (nightMode ? 'rgba(255,105,105,.9)' : 'rgba(199,205,224,.82)');
      ctx.fillText(label, p.x - 4, p.y - 7);
    }

    if (selected) {
      const target = rendered.find((item) => item.object.id === selected.id);
      if (target) {
        ctx.save();
        ctx.strokeStyle = nightMode ? '#ff4949' : '#a99cf6';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(target.x - target.radius - 14, target.y); ctx.lineTo(target.x - target.radius - 5, target.y);
        ctx.moveTo(target.x + target.radius + 5, target.y); ctx.lineTo(target.x + target.radius + 14, target.y);
        ctx.moveTo(target.x, target.y - target.radius - 14); ctx.lineTo(target.x, target.y - target.radius - 5);
        ctx.moveTo(target.x, target.y + target.radius + 5); ctx.lineTo(target.x, target.y + target.radius + 14);
        ctx.stroke();
        ctx.restore();
      }
    }

    renderedRef.current = rendered;
  }, [date, getPosition, layers, location.latitude, location.longitude, nightMode, selected, view]);

  useEffect(() => {
    let frame = 0;
    const render = () => {
      draw();
      frame = window.requestAnimationFrame(render);
    };
    frame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frame);
  }, [draw]);

  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.matches('input, textarea')) return;
      if (event.code === 'Space') { event.preventDefault(); setPlaying((value) => !value); }
      if (event.key === '+' || event.key === '=') setView((v) => ({ ...v, fov: clamp(v.fov - 10, 12, 145) }));
      if (event.key === '-') setView((v) => ({ ...v, fov: clamp(v.fov + 10, 12, 145) }));
      if (event.key.toLowerCase() === 'c') toggleLayer('constellations');
      if (event.key.toLowerCase() === 'g') toggleLayer('azimuthGrid');
      if (event.key.toLowerCase() === 'a') toggleLayer('atmosphere');
      if (event.key.toLowerCase() === 'l') toggleLayer('labels');
      if (event.key.toLowerCase() === 'n') setNightMode((value) => !value);
      if (event.key.toLowerCase() === 'f') rootRef.current?.requestFullscreen?.();
      if (event.key === 'Escape') { setLayersOpen(false); setLocationOpen(false); setTimeOpen(false); setHelpOpen(false); setMenuOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const searchResults = useMemo(() => {
    const query = normalizeSearch(search);
    if (!query) return [];
    return ALL_OBJECTS.filter((object) => {
      const haystack = normalizeSearch([object.name, ...object.aliases, object.constellation ?? ''].join(' '));
      return haystack.includes(query);
    }).slice(0, 8);
  }, [search]);

  const favoriteObjects = useMemo(() => favorites.map((id) => ALL_OBJECTS.find((item) => item.id === id)).filter(Boolean) as CatalogObject[], [favorites]);

  const toggleFavorite = (object: CatalogObject) => {
    setFavorites((current) => {
      const next = current.includes(object.id) ? current.filter((id) => id !== object.id) : [...current, object.id];
      window.localStorage.setItem('astroflow:planetarium:favorites', JSON.stringify(next));
      return next;
    });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    canvas.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, az: view.azimuth, alt: view.altitude, moved: false };
    setFollowSelected(false);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.hypot(dx, dy) > 4) drag.moved = true;
    const sensitivity = view.fov / Math.min(event.currentTarget.clientWidth, event.currentTarget.clientHeight) * 1.25;
    setView((current) => ({ ...current, azimuth: normalizeAngle(drag.az - dx * sensitivity), altitude: clamp(drag.alt + dy * sensitivity, -70, 89) }));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || drag.moved) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const target = renderedRef.current
      .map((item) => ({ item, distance: Math.hypot(item.x - x, item.y - y) }))
      .filter(({ item, distance }) => distance <= item.radius)
      .sort((a, b) => a.distance - b.distance)[0]?.item;
    if (target) {
      setSelected(target.object);
      setSelectedPosition(target.position);
    } else {
      setSelected(null);
      setFollowSelected(false);
    }
  };

  const useDeviceLocation = () => {
    if (!navigator.geolocation) {
      setToast('Seu navegador não oferece geolocalização.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { latitude: position.coords.latitude, longitude: position.coords.longitude, name: 'Minha localização' };
        setLocation(next);
        setLocationDraft({ latitude: next.latitude.toFixed(5), longitude: next.longitude.toFixed(5), name: next.name });
        setLocationOpen(false);
        setToast('Localização atualizada.');
      },
      () => setToast('Não foi possível acessar sua localização.'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const applyManualLocation = () => {
    const latitude = Number(locationDraft.latitude);
    const longitude = Number(locationDraft.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setToast('Confira latitude e longitude.');
      return;
    }
    setLocation({ latitude, longitude, name: locationDraft.name.trim() || 'Local personalizado' });
    setLocationOpen(false);
    setToast('Localização aplicada.');
  };

  const captureSky = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `astro-flow-ceu-${date.toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setToast('Imagem do céu salva.');
  };

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await rootRef.current?.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch {
      setToast('Tela cheia não está disponível neste navegador.');
    }
  };

  const setNow = () => {
    setDate(new Date());
    setSpeed(1);
    setPlaying(true);
  };

  const closePopovers = () => {
    setLayersOpen(false); setLocationOpen(false); setTimeOpen(false); setHelpOpen(false); setMenuOpen(false);
  };

  return (
    <main ref={rootRef} className={`${styles.root} ${nightMode ? styles.nightMode : ''}`}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { dragRef.current = null; }}
        onWheel={(event) => {
          event.preventDefault();
          setView((current) => ({ ...current, fov: clamp(current.fov + Math.sign(event.deltaY) * 8, 12, 145) }));
        }}
        aria-label="Mapa celeste interativo"
      />

      <header className={styles.topbar}>
        <button className={styles.iconButton} onClick={() => { closePopovers(); setMenuOpen((value) => !value); }} aria-label="Abrir menu"><Icon name="menu" /></button>
        <div className={styles.brand}><span className={styles.brandMark}>A</span><span>Astro Flow</span><small>Observatório</small></div>
        <div className={styles.searchWrap}>
          <Icon name="search" size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar estrela, planeta, nebulosa..." aria-label="Buscar no céu" />
          {search && <button className={styles.clearSearch} onClick={() => setSearch('')} aria-label="Limpar busca"><Icon name="close" size={16} /></button>}
          {searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map((object) => (
                <button key={object.id} onClick={() => selectObject(object, true)}>
                  <span className={styles.resultGlyph}>{objectGlyph(object)}</span>
                  <span><strong>{object.name}</strong><small>{object.kind === 'ceu-profundo' ? 'Céu profundo' : object.kind === 'planeta' ? 'Sistema Solar' : object.constellation ?? 'Estrela'}</small></span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={styles.topActions}>
          <button className={styles.textButton} onClick={() => { closePopovers(); setLocationOpen(true); }}><Icon name="pin" size={17} /><span>{location.name}</span></button>
          <button className={styles.iconButton} onClick={() => setNightMode((value) => !value)} aria-label="Modo noturno"><Icon name="night" /></button>
          <button className={styles.iconButton} onClick={enterFullscreen} aria-label="Tela cheia"><Icon name="fullscreen" /></button>
        </div>
      </header>

      {menuOpen && (
        <aside className={`${styles.popover} ${styles.menuPopover}`}>
          <div className={styles.popoverTitle}><span>Observatório</span><button onClick={() => setMenuOpen(false)}><Icon name="close" size={18} /></button></div>
          <button className={styles.menuRow} onClick={() => { setMenuOpen(false); setLayersOpen(true); }}><Icon name="layers" /><span>Camadas do céu</span></button>
          <button className={styles.menuRow} onClick={() => { setMenuOpen(false); setLocationOpen(true); }}><Icon name="pin" /><span>Localização do observador</span></button>
          <button className={styles.menuRow} onClick={() => { setMenuOpen(false); setTimeOpen(true); }}><Icon name="clock" /><span>Data e velocidade do tempo</span></button>
          <button className={styles.menuRow} onClick={() => { setMenuOpen(false); setHelpOpen(true); }}><Icon name="help" /><span>Controles e atalhos</span></button>
          {favoriteObjects.length > 0 && <><div className={styles.menuLabel}>Favoritos</div>{favoriteObjects.map((object) => <button key={object.id} className={styles.favoriteRow} onClick={() => { setMenuOpen(false); selectObject(object, true); }}><span>{objectGlyph(object)}</span>{object.name}</button>)}</>}
        </aside>
      )}

      <div className={styles.leftRail}>
        <button className={`${styles.railButton} ${layers.constellations ? styles.active : ''}`} onClick={() => toggleLayer('constellations')} title="Constelações (C)"><span className={styles.customIcon}>⌁</span><span>Constelações</span></button>
        <button className={`${styles.railButton} ${layers.azimuthGrid ? styles.active : ''}`} onClick={() => toggleLayer('azimuthGrid')} title="Grade azimutal (G)"><span className={styles.customIcon}>⊕</span><span>Grade</span></button>
        <button className={`${styles.railButton} ${layers.atmosphere ? styles.active : ''}`} onClick={() => toggleLayer('atmosphere')} title="Atmosfera (A)"><span className={styles.customIcon}>◒</span><span>Atmosfera</span></button>
        <button className={`${styles.railButton} ${layers.deepSky ? styles.active : ''}`} onClick={() => toggleLayer('deepSky')} title="Objetos de céu profundo"><span className={styles.customIcon}>◇</span><span>Profundo</span></button>
        <button className={`${styles.railButton} ${layersOpen ? styles.active : ''}`} onClick={() => { closePopovers(); setLayersOpen((value) => !value); }} title="Mais camadas"><Icon name="layers" size={19} /><span>Camadas</span></button>
      </div>

      <div className={styles.zoomRail}>
        <button onClick={() => setView((v) => ({ ...v, fov: clamp(v.fov - 12, 12, 145) }))} aria-label="Aproximar"><Icon name="plus" /></button>
        <div className={styles.zoomValue}>{Math.round(view.fov)}°</div>
        <button onClick={() => setView((v) => ({ ...v, fov: clamp(v.fov + 12, 12, 145) }))} aria-label="Afastar"><Icon name="minus" /></button>
        <button onClick={() => setView({ azimuth: 0, altitude: 28, fov: 95 })} aria-label="Recentrar"><Icon name="compass" /></button>
      </div>

      {layersOpen && (
        <aside className={`${styles.popover} ${styles.layersPopover}`}>
          <div className={styles.popoverTitle}><span>Camadas do céu</span><button onClick={() => setLayersOpen(false)}><Icon name="close" size={18} /></button></div>
          {([
            ['constellations', 'Linhas das constelações'], ['constellationArt', 'Realce das constelações'], ['labels', 'Nomes e rótulos'],
            ['planets', 'Sol, Lua e planetas'], ['deepSky', 'Nebulosas, galáxias e aglomerados'], ['azimuthGrid', 'Grade azimutal'],
            ['equatorialGrid', 'Grade equatorial'], ['ecliptic', 'Linha da eclíptica'], ['atmosphere', 'Atmosfera e crepúsculo'],
            ['landscape', 'Paisagem do horizonte'], ['horizon', 'Linha do horizonte'],
          ] as Array<[keyof LayerState, string]>).map(([key, label]) => (
            <label key={key} className={styles.toggleRow}><span>{label}</span><input type="checkbox" checked={layers[key]} onChange={() => toggleLayer(key)} /><i /></label>
          ))}
        </aside>
      )}

      {selected && (
        <aside className={styles.objectPanel}>
          <div className={styles.objectHead}>
            <div className={styles.objectGlyph}>{objectGlyph(selected)}</div>
            <div><span className={styles.eyebrow}>{selected.kind === 'planeta' ? 'Sistema Solar' : selected.kind === 'ceu-profundo' ? 'Céu profundo' : selected.constellation ?? 'Estrela'}</span><h2>{selected.name}</h2></div>
            <button className={styles.panelClose} onClick={() => { setSelected(null); setFollowSelected(false); }}><Icon name="close" size={19} /></button>
          </div>
          <p className={styles.objectDescription}>{selected.description}</p>
          <div className={styles.dataGrid}>
            <div><span>Azimute</span><strong>{round(selectedPosition?.az, 2)}°</strong></div>
            <div><span>Altitude</span><strong>{round(selectedPosition?.alt, 2)}°</strong></div>
            <div><span>Ascensão reta</span><strong>{round(selectedPosition?.ra, 3)} h</strong></div>
            <div><span>Declinação</span><strong>{round(selectedPosition?.dec, 2)}°</strong></div>
            {selectedPosition?.dist != null && <div><span>Distância</span><strong>{round(selectedPosition.dist, 4)} UA</strong></div>}
            {selected.magnitude != null && <div><span>Magnitude</span><strong>{round(selected.magnitude, 2)}</strong></div>}
          </div>
          <div className={styles.panelActions}>
            <button className={`${styles.followButton} ${followSelected ? styles.active : ''}`} onClick={() => { setFollowSelected((value) => !value); if (!followSelected) selectObject(selected, true); }}><Icon name="locate" size={17} />{followSelected ? 'Seguindo' : 'Centralizar e seguir'}</button>
            <button className={`${styles.favoriteButton} ${favorites.includes(selected.id) ? styles.active : ''}`} onClick={() => toggleFavorite(selected)} aria-label="Favoritar"><Icon name="star" size={18} /></button>
          </div>
        </aside>
      )}

      <div className={styles.statusBar}>
        <span><Icon name="compass" size={15} /> {cardinal(view.azimuth)} {Math.round(view.azimuth)}° · {Math.round(view.altitude)}°</span>
        <span>{astronomy ? 'Efemérides precisas ativas' : engineError ? 'Modo de catálogo local' : 'Carregando efemérides…'}</span>
      </div>

      <div className={styles.timeBar}>
        <button onClick={() => setDate((d) => new Date(d.getTime() - 3600000))} aria-label="Voltar uma hora"><Icon name="rewind" size={18} /></button>
        <button className={styles.playButton} onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pausar tempo' : 'Reproduzir tempo'}><Icon name={playing ? 'pause' : 'play'} size={18} /></button>
        <button onClick={() => setDate((d) => new Date(d.getTime() + 3600000))} aria-label="Avançar uma hora"><Icon name="forward" size={18} /></button>
        <button className={styles.dateButton} onClick={() => { closePopovers(); setTimeOpen(true); }}><span>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(date)}</span><strong>{new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date)}</strong></button>
        <button className={styles.nowButton} onClick={setNow}><Icon name="now" size={16} />Agora</button>
        <select value={speed} onChange={(event) => { setSpeed(Number(event.target.value)); setPlaying(true); }} aria-label="Velocidade do tempo">
          <option value={1}>1×</option><option value={60}>60×</option><option value={600}>600×</option><option value={3600}>3600×</option>
        </select>
      </div>

      <div className={styles.bottomActions}>
        <button onClick={captureSky} title="Salvar imagem"><Icon name="camera" /></button>
        <button onClick={() => setNightMode((value) => !value)} title="Modo noturno"><Icon name="night" /></button>
        <button onClick={() => { closePopovers(); setHelpOpen(true); }} title="Ajuda"><Icon name="help" /></button>
      </div>

      {locationOpen && (
        <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setLocationOpen(false); }}>
          <section className={styles.modal}>
            <div className={styles.popoverTitle}><span>Localização do observador</span><button onClick={() => setLocationOpen(false)}><Icon name="close" /></button></div>
            <p>O céu muda conforme a latitude e longitude. Você pode usar o GPS ou informar coordenadas manualmente.</p>
            <button className={styles.primaryAction} onClick={useDeviceLocation}><Icon name="locate" size={18} />Usar minha localização</button>
            <div className={styles.formGrid}>
              <label><span>Nome do local</span><input value={locationDraft.name} onChange={(e) => setLocationDraft((v) => ({ ...v, name: e.target.value }))} /></label>
              <label><span>Latitude</span><input inputMode="decimal" value={locationDraft.latitude} onChange={(e) => setLocationDraft((v) => ({ ...v, latitude: e.target.value }))} /></label>
              <label><span>Longitude</span><input inputMode="decimal" value={locationDraft.longitude} onChange={(e) => setLocationDraft((v) => ({ ...v, longitude: e.target.value }))} /></label>
            </div>
            <div className={styles.modalFooter}><button onClick={() => setLocationOpen(false)}>Cancelar</button><button className={styles.primaryAction} onClick={applyManualLocation}>Aplicar localização</button></div>
          </section>
        </div>
      )}

      {timeOpen && (
        <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setTimeOpen(false); }}>
          <section className={styles.modal}>
            <div className={styles.popoverTitle}><span>Tempo astronômico</span><button onClick={() => setTimeOpen(false)}><Icon name="close" /></button></div>
            <p>Viaje no tempo para observar posições passadas ou futuras. O mapa é recalculado continuamente.</p>
            <label className={styles.dateField}><span>Data e hora</span><input type="datetime-local" value={formatDateLocal(date)} onChange={(event) => { const next = new Date(event.target.value); if (Number.isFinite(next.getTime())) { setDate(next); setPlaying(false); } }} /></label>
            <div className={styles.quickTimes}>
              <button onClick={() => setDate((d) => new Date(d.getTime() - 86400000))}>− 1 dia</button>
              <button onClick={setNow}>Agora</button>
              <button onClick={() => setDate((d) => new Date(d.getTime() + 86400000))}>+ 1 dia</button>
              <button onClick={() => setDate((d) => new Date(d.getTime() + 30 * 86400000))}>+ 30 dias</button>
            </div>
            <div className={styles.speedChoices}>{[1, 60, 600, 3600].map((value) => <button key={value} className={speed === value ? styles.active : ''} onClick={() => { setSpeed(value); setPlaying(true); }}>{value}×</button>)}</div>
          </section>
        </div>
      )}

      {helpOpen && (
        <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setHelpOpen(false); }}>
          <section className={`${styles.modal} ${styles.helpModal}`}>
            <div className={styles.popoverTitle}><span>Como explorar o céu</span><button onClick={() => setHelpOpen(false)}><Icon name="close" /></button></div>
            <div className={styles.helpGrid}>
              <div><strong>Arrastar</strong><span>Olhar ao redor do céu</span></div><div><strong>Roda / + −</strong><span>Controlar o zoom</span></div>
              <div><strong>Toque</strong><span>Selecionar estrela, planeta ou objeto</span></div><div><strong>Espaço</strong><span>Pausar ou retomar o tempo</span></div>
              <div><strong>C</strong><span>Constelações</span></div><div><strong>G</strong><span>Grade azimutal</span></div>
              <div><strong>A</strong><span>Atmosfera</span></div><div><strong>L</strong><span>Rótulos</span></div>
              <div><strong>N</strong><span>Modo noturno vermelho</span></div><div><strong>F</strong><span>Tela cheia</span></div>
            </div>
            <p className={styles.helpNote}>As posições do Sol, Lua e planetas usam Astronomy Engine no navegador. Estrelas nomeadas e objetos de céu profundo usam coordenadas de catálogo.</p>
          </section>
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </main>
  );
}
