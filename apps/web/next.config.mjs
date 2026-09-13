/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @astros/contracts e distribuido como TS compilado no workspace; o Next
  // precisa transpila-lo junto do app.
  transpilePackages: ['@astros/contracts'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333',
  },
};

export default nextConfig;
