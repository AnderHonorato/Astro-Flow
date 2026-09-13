'use client';

import { useState } from 'react';

/** Chave do repasse entre o hero e o formulario de cadastro, na mesma aba. */
export const EMAIL_HANDOFF_KEY = 'astros.signup.email';

/**
 * Captura de e-mail do hero. Nao cria conta sozinha: guarda o e-mail e leva
 * a pessoa ao formulario completo, que ja abre preenchido.
 */
export function HeroEmailForm() {
  const [email, setEmail] = useState('');

  return (
    <form
      className="flex max-w-[480px] flex-col gap-[9px] sm:flex-row sm:items-center sm:gap-[10px]"
      onSubmit={(event) => {
        event.preventDefault();
        try {
          window.sessionStorage.setItem(EMAIL_HANDOFF_KEY, email);
        } catch {
          /* sessionStorage bloqueado: segue sem o preenchimento previo. */
        }
        window.dispatchEvent(new CustomEvent('astros:prefill-email', { detail: email }));
        document.getElementById('criar-conta')?.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('signup-name')?.focus({ preventScroll: true });
      }}
    >
      <label htmlFor="hero-email" className="sr-only">
        Seu e-mail
      </label>
      <input
        id="hero-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        className="input min-h-[48px] flex-1 text-[14.5px]"
        placeholder="seu e-mail"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <button
        type="submit"
        className="btn btn-primary min-h-[48px] whitespace-nowrap px-6 text-[14.5px] max-sm:w-full"
      >
        Calcular meu céu
      </button>
    </form>
  );
}
