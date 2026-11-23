import type { NextConfig } from 'next';
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    root: process.cwd(),
    rules: { '*.css': { loaders: ['@tailwindcss/turbopack'], as: '*.css' } },
  },
};
export default config;
