import Link from 'next/link';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { NebulaDrift, Starfield } from '@/components/ui/Starfield';
import { ZodiacWheel } from '@/components/ui/ZodiacWheel';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <NebulaDrift className="absolute inset-0 opacity-70" />
        <Starfield count={70} seed={29} className="absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_50%_18%,rgba(145,132,217,.16),transparent_58%)]" />
      </div>
      <SiteHeader />
      <section className="relative mx-auto grid min-h-[calc(100vh-90px)] max-w-[1440px] items-center gap-10 px-[22px] pb-16 pt-8 lg:grid-cols-[1.05fr_.95fr] lg:px-14 lg:pb-24">
        <div className="relative z-10 max-w-[700px]">
          <p className="mb-5 text-[11px] uppercase tracking-[.24em] text-accent-400">mapa natal · trânsitos · céu em tempo real</p>
          <h1 className="max-w-[680px] text-[clamp(44px,7vw,82px)] font-medium leading-[.96] tracking-[-.055em] text-ink">O céu que te escreve.</h1>
          <p className="mt-7 max-w-[570px] text-[17px] leading-8 text-neutral-400 lg:text-[19px]">
            Sua carta natal, seus trânsitos e suas leituras em um único lugar.
            Sem horóscopo genérico. O mapa é seu, e o céu continua se movendo.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="#criar-conta" className="btn btn-primary min-h-11 px-5">Criar minha carta</Link>
            <Link href="/observatorio" className="btn btn-secondary min-h-11 px-5"><span aria-hidden>✦</span> Observatório Celeste</Link>
          </div>
          <div className="mt-12 grid max-w-[620px] grid-cols-2 gap-px overflow-hidden rounded-lg bg-neutral-800/60 sm:grid-cols-4">
            {[['Sol agora','Leão 22°14′'],['Lua','Peixes · minguante'],['Trânsitos','Em movimento'],['Precisão','Ao minuto']].map(([label,value]) => (
              <div key={label} className="bg-surface/70 px-4 py-4">
                <div className="text-[10px] uppercase tracking-[.12em] text-neutral-600">{label}</div>
                <div className="mt-1 text-[12px] text-neutral-300">{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[610px]">
          <div className="absolute inset-[12%] rounded-full bg-accent-700/10 blur-3xl" />
          <ZodiacWheel variant="celestial" className="relative" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-bg-deep/75 px-4 py-2 text-[10px] uppercase tracking-[.16em] text-neutral-500 backdrop-blur">uma visão do seu céu</div>
        </div>
      </section>
      <section id="planos" className="relative border-t border-white/5 bg-bg-deep/45">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-[22px] py-16 lg:grid-cols-3 lg:px-14">
          <div><p className="text-[10px] uppercase tracking-[.18em] text-accent-400">Astros</p><h2 className="mt-3 text-3xl text-ink">Seu mapa primeiro.</h2></div>
          <p className="text-[15px] leading-7 text-neutral-400">Casas, aspectos, planetas e interpretações construídos sobre seus dados de nascimento, com uma interface feita para explorar sem se perder.</p>
          <Link href="/observatorio" className="btn btn-secondary self-start justify-self-start">Explorar o céu →</Link>
        </div>
      </section>
    </main>
  );
}
