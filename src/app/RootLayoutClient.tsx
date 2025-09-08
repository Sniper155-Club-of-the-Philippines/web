'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import Spinner from '@/components/root/Spinner';
import { Toaster } from '@/components/ui/sonner';
import QueryProvider from '@/components/base/QueryProvider';
import { cn } from '@/lib/utils';

export default function RootLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
            <div
                className={cn(
                    pathname.startsWith('/dashboard') &&
                        !pathname.endsWith('/nfc-id') &&
                        'overflow-hidden',
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
