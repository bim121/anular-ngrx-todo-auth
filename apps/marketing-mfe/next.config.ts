import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      '@marketing/shared': resolve(__dirname, 'src/shared'),
      '@shared/design-tokens': resolve(rootDir, 'libs/shared/design-tokens'),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@marketing/shared': resolve(__dirname, 'src/shared'),
      '@shared/design-tokens': resolve(rootDir, 'libs/shared/design-tokens'),
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
