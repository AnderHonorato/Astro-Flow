import {
  ASPECT_GLYPHS, BODY_GLYPHS, SIGN_GLYPHS,
  type AspectKey, type BodyKey, type SignKey,
} from '@astros/contracts';

/**
 * Todo glifo do handoff e um path para viewBox 24x24 desenhado a traco —
 * nunca preenchido. Este componente e o unico lugar que sabe disso.
 */
interface GlyphProps {
  path: string;
  size?: number;
  /** Cor do traco. Default: `currentColor`, para herdar do container. */
  color?: string;
  strokeWidth?: number;
  className?: string;
  title?: string;
}

export function Glyph({
  path, size = 20, color = 'currentColor', strokeWidth = 1.4, className, title,
}: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path d={path} />
    </svg>
  );
}

export function SignGlyph({ sign, ...rest }: { sign: SignKey } & Omit<GlyphProps, 'path'>) {
  return <Glyph path={SIGN_GLYPHS[sign]} {...rest} />;
}

export function BodyGlyph({ body, ...rest }: { body: BodyKey } & Omit<GlyphProps, 'path'>) {
  return <Glyph path={BODY_GLYPHS[body]} {...rest} />;
}

export function AspectGlyph({ aspect, ...rest }: { aspect: AspectKey } & Omit<GlyphProps, 'path'>) {
  return <Glyph path={ASPECT_GLYPHS[aspect]} {...rest} />;
}

/** Marca da Astros — o disco solar com os quatro raios cardeais. */
export function AstrosMark({ size = 26, color = '#b5abfc', className }: {
  size?: number; color?: string; className?: string;
}) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.2} strokeLinecap="round"
      className={className} aria-hidden
    >
      <path d="M3.5 12a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0" />
      <path d="M10.8 12a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0-2.4 0" />
      <path d="M12 1.2v2.2 M12 20.6v2.2 M1.2 12h2.2 M20.6 12h2.2" />
    </svg>
  );
}
