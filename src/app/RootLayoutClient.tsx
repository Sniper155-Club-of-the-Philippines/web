'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import Spinner from '@/components/root/Spinner';
import { Toaster } from '@/components/ui/sonner';
import QueryProvider from '@/components/base/QueryProvider';
import { cn } from '@/lib/utils';
import { minimatch } from 'minimatch';

export default function RootLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const excluded = [
        '/dashboard/generation/nfc-id',
        '/dashboard/forms/manage/**',
        '/dashboard/forms/responses/**',
    ];

    const shouldHideOverflow =
        pathname.startsWith('/dashboard') &&
        !excluded.some((pattern) => minimatch(pathname, pattern));

    return (
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
            <div
                className={cn(
                    shouldHideOverflow && 'overflow-hidden',
                    pathname.startsWith('/profile') && 'overflow-x-hidden'
                )}
            >
                <Spinner />
                <Toaster />
                <QueryProvider>{children}</QueryProvider>
            </div>
        </ThemeProvider>
    );
}
