import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import RootLayoutClient from './RootLayoutClient';

const font = Inter({
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Sniper155 Club of the Philippines',
    description: '',
    icons: {
        icon: '/icons/favicon.ico',
        shortcut: '/icons/favicon-16x16.png',
        apple: '/icons/apple-touch-icon.png',
        other: [
            {
                rel: 'icon',
                url: '/icons/favicon-32x32.png',
                sizes: '32x32',
            },
            {
                rel: 'icon',
                url: '/icons/android-chrome-192x192.png',
                sizes: '192x192',
            },
            {
                rel: 'icon',
                url: '/icons/android-chrome-512x512.png',
                sizes: '512x512',
            },
        ],
    },
    manifest: '/icons/site.webmanifest',
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <RootLayoutClient fontClass={font.className}>
            {children}
        </RootLayoutClient>
    );
}
