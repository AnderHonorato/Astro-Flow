/**
 * Campo de estrelas do handoff. O gerador e o mesmo LCG (Lehmer, a=16807)
 * usado no mock, com a mesma semente — as estrelas caem exatamente onde
 * caiam no design. Ser deterministico tambem evita divergencia de hidratacao:
 * servidor e cliente produzem os mesmos valores.
 */

interface StarfieldProps {
  count?: number;
  /** Semente do LCG. 29 na landing, 13 nas telas do app. */
  seed?: number;
  /** Altura maxima (%) em que uma estrela pode nascer. */
  spread?: number;
  className?: string;
}

export function Starfield({ count = 22, seed = 29, spread = 100, className }: StarfieldProps) {
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;

  const stars = Array.from({ length: count }, (_, i) => {
    const left = rnd() * 100;
    const top = rnd() * spread;
    const size = 1 + rnd() * 1.8;
    const duration = 2.5 + rnd() * 4;
    const delay = rnd() * 5;
    return { i, left, top, size, duration, delay };
  });

  return (
    <div className={className} aria-hidden>
      {stars.map((star) => (
        <i
          key={star.i}
          style={{
            position: 'absolute',
            left: `${star.left.toFixed(1)}%`,
            top: `${star.top.toFixed(1)}%`,
            width: `${star.size.toFixed(1)}px`,
            height: `${star.size.toFixed(1)}px`,
            borderRadius: '999px',
            background: '#e9e9ed',
            animation: `twinkle ${star.duration.toFixed(1)}s ease-in-out ${star.delay.toFixed(1)}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/** As duas manchas de nebulosa que derivam atras do heroi e dos formularios. */
export function NebulaDrift({ className }: { className?: string }) {
  return (
    <div
      className={className}
      aria-hidden
      style={{
        position: 'absolute',
        inset: '-15%',
        background:
          'radial-gradient(50% 40% at 22% 8%, rgba(66,58,106,.85), transparent 70%),' +
          'radial-gradient(40% 40% at 78% 30%, rgba(38,42,96,.75), transparent 72%)',
        animation: 'drift 30s ease-in-out infinite alternate',
      }}
    />
  );
}
