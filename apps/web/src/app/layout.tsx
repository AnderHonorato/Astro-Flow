import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Astros — o céu que te escreve',
    template: '%s · Astros',
  },
  description:
    'Seu mapa natal calculado ao minuto do primeiro respiro, e o trânsito de hoje lido em cima dele. Não o horóscopo de revista — a sua carta, em tempo real.',
  openGraph: {
    title: 'Astros — o céu que te escreve',
    description:
      'Mapa natal, trânsitos e horóscopo calculados sobre a sua carta, em tempo real.',
    locale: 'pt_BR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#161826',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
