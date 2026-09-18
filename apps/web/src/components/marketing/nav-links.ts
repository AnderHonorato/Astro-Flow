/**
 * Links compartilhados entre a barra principal e o menu mobile.
 */
export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: '/app/hoje', label: 'O céu hoje' },
  { href: '/app/mapa', label: 'Mapa natal' },
  { href: '/app/sinastria', label: 'Sinastria' },
  { href: '/observatorio', label: 'Observatório' },
  { href: '#planos', label: 'Planos' },
] as const;

export const LOGIN_HREF = '/entrar';
export const SIGNUP_HREF = '#criar-conta';
