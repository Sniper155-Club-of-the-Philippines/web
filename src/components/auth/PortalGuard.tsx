'use client';

import { accessAtom, userAtom } from '@/atoms/auth';
import { useRefreshToken } from '@/hooks/auth';
import { portalRedirect, type PortalKind } from '@/lib/auth';
import { useAtomValue } from 'jotai';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PortalGuard({
    children,
    portal,
}: {
    children: React.ReactNode;
    portal: PortalKind;
}) {
    const access = useAtomValue(accessAtom);
    const user = useAtomValue(userAtom);
    const pathname = usePathname();
    const router = useRouter();

    useRefreshToken({ redirectTo: pathname });

    const redirect = access && user ? portalRedirect(user, portal) : null;

    useEffect(() => {
        if (redirect) {
            router.replace(redirect);
        }
    }, [redirect, router]);

    if (!access || !user || redirect) {
        return null;
    }

    return children;
}
