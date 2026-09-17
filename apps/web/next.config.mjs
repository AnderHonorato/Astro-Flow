/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repoBasePath = '/Astro-Flow';

const nextConfig = {
  reactStrictMode: true,

  // @astros/contracts e distribuido como TS compilado no workspace; o Next
  // precisa transpila-lo junto do app.
  transpilePackages: ['@astros/contracts'],

  // No GitHub Pages nao existe servidor Node. Durante o workflow do Pages,
  // o frontend vira um site estatico em apps/web/out.
  ...(isGitHubPages
    ? {
        output: 'export',
        basePath: repoBasePath,
        assetPrefix: repoBasePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333',
  },
};

export default nextConfig;
