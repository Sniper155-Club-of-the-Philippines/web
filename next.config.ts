import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';
import initWithBundleAnalyzer from '@next/bundle-analyzer';

const baseConfig: NextConfig = {
    images: {
        remotePatterns: [],
    },
    async headers() {
        return [
            {
                source: '/:all*(svg|jpg|png|gif|webp|js|css)',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,OPTIONS',
                    },
                    { key: 'Access-Control-Allow-Headers', value: '*' },
                ],
            },
        ];
    },
};

if (process.env.NEXT_PUBLIC_STORAGE_URL) {
    const url = new URL(process.env.NEXT_PUBLIC_STORAGE_URL);
    baseConfig.images?.remotePatterns?.push({
        protocol: url.protocol.replace(':', ''),
        hostname: url.hostname,
        port: url.port,
        pathname: '/**',
    } as RemotePattern);
}

if (process.env.NEXT_PUBLIC_API_URL) {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL);
    baseConfig.images?.remotePatterns?.push({
        protocol: url.protocol.replace(':', ''),
        hostname: url.hostname,
        port: url.port,
        pathname: '/files/**',
        search: '',
    } as RemotePattern);
}

const withBundleAnalyzer = initWithBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

const isTauri = process.env.TAURI === 'true';
const isProd = process.env.NODE_ENV === 'production';
const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

const tauriOverrides: NextConfig = isTauri
    ? {
          output: 'export',
          images: {
              ...baseConfig.images,
              unoptimized: true, // required in Tauri SSG
          },
          assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
      }
    : {};

const finalConfig: NextConfig = {
    ...baseConfig,
    ...tauriOverrides,
};

export default withBundleAnalyzer(finalConfig);
