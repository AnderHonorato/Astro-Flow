/**
 * Os quatro links do menu, compartilhados entre a barra do desktop e o menu
 * do celular. As tres primeiras rotas pertencem ao app logado (outro dono);
 * a landing so aponta para elas.
 */
export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: '/app/hoje', label: 'O céu hoje' },
  { href: '/app/mapa', label: 'Mapa natal' },
  { href: '/app/sinastria', label: 'Sinastria' },
  { href: '#planos', label: 'Planos' },
] as const;

export const LOGIN_HREF = '/entrar';
export const SIGNUP_HREF = '#criar-conta';
