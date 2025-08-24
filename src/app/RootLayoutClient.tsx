'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import Spinner from '@/components/root/Spinner';
import { Toaster } from '@/components/ui/sonner';
import QueryProvider from '@/components/base/QueryProvider';

export default function RootLayoutClient({
    children,
    fontClass,
}: {
    children: React.ReactNode;
    fontClass: string;
}) {
    const pathname = usePathname();

    return (
        <html
            lang='en'
            suppressHydrationWarning
            className={
                pathname.startsWith('/dashboard') ? 'overflow-hidden' : ''
            }
        >
            <body className={`${fontClass} antialiased`}>
                <ThemeProvider
                    attribute='class'
                    defaultTheme='system'
                    enableSystem
                >
                    <Spinner />
                    <Toaster />
                    <QueryProvider>{children}</QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
