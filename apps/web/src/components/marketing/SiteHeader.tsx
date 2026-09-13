import Link from 'next/link';
import { AstrosMark } from '@/components/ui/Glyph';
import { MobileMenu } from './MobileMenu';
import { LOGIN_HREF, NAV_LINKS, SIGNUP_HREF } from './nav-links';

export function SiteHeader() {
  return (
    <header className="relative z-30">
      <nav
        aria-label="Principal"
        className="mx-auto flex max-w-[1440px] items-center gap-4 px-[22px] py-5 lg:gap-[34px] lg:px-14 lg:py-[26px]"
      >
        <Link
          href="/"
          className="mr-auto flex items-center gap-[11px] text-ink no-underline"
          aria-label="Astros — início"
        >
          <AstrosMark size={22} className="lg:hidden" />
          <AstrosMark size={26} className="hidden lg:block" />
          <span className="text-[15px] uppercase tracking-[0.22em] lg:text-[17px]">Astros</span>
        </Link>

        <ul className="hidden list-none items-center gap-[34px] p-0 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[13.5px] text-neutral-300 no-underline transition-colors hover:text-accent-400"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={LOGIN_HREF}
          className="text-[13px] text-neutral-500 no-underline transition-colors hover:text-accent-400 lg:text-[13.5px]"
        >
          Entrar
        </Link>

        <Link
          href={SIGNUP_HREF}
          className="btn btn-primary hidden min-h-[38px] px-[18px] lg:inline-flex"
        >
          Criar minha carta
        </Link>

        <MobileMenu />
      </nav>
    </header>
  );
}
