import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';
import initWithBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [],
    },
};

const withBundleAnalyzer = initWithBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

if (process.env.NEXT_PUBLIC_API_URL) {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL);

    nextConfig.images?.remotePatterns?.push({
        protocol: url.protocol.replace(':', ''),
        hostname: url.hostname,
        port: url.port,
        pathname: '/files/**',
        search: '',
    } as RemotePattern);
}

export default withBundleAnalyzer(nextConfig);
