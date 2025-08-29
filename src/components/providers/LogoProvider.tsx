'use client';

import { ReactNode } from 'react';
import { LogoContext } from '@/contexts/logo';

export default function LogoProvider({
    children,
    logo,
}: {
    children: ReactNode;
    logo: string;
}) {
    return <LogoContext.Provider value={logo}>{children}</LogoContext.Provider>;
}
