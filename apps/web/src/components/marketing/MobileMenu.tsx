'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { LOGIN_HREF, NAV_LINKS, SIGNUP_HREF } from './nav-links';

/**
 * Menu do celular. Operavel por teclado: Escape fecha e devolve o foco ao
 * botao, Tab circula dentro do painel enquanto ele esta aberto.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('a, button')?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-icon btn-secondary rounded-[10px] lg:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cfd3e5" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12 M18 6L6 18" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cfd3e5" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
            <path d="M4 7h16 M4 12h16 M4 17h16" />
          </svg>
        )}
      </button>

      {open ? (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={close}
            className="fixed inset-0 z-40 cursor-default bg-bg-deep/70 lg:hidden"
          />
          <div
            ref={panelRef}
            id={panelId}
            className="fixed inset-x-0 top-0 z-50 flex flex-col gap-1 border-b border-ink/10 bg-bg px-[22px] pt-[74px] pb-6 shadow-plate lg:hidden"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="rounded-md px-2 py-3 text-[15px] text-neutral-300 no-underline hover:text-accent-400"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={LOGIN_HREF}
              onClick={close}
              className="rounded-md px-2 py-3 text-[15px] text-neutral-500 no-underline hover:text-accent-400"
            >
              Entrar
            </Link>
            <Link
              href={SIGNUP_HREF}
              onClick={close}
              className="btn btn-primary btn-block mt-2 min-h-[46px]"
            >
              Criar minha carta
            </Link>
          </div>
        </>
      ) : null}
    </>
  );
}
