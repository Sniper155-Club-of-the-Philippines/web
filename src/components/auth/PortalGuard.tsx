'use client';

import { accessAtom, userAtom } from '@/atoms/auth';
import { useRefreshToken } from '@/hooks/auth';
import { useHydrated } from '@/hooks/hydrated';
import { portalRedirect, type PortalKind } from '@/lib/auth';
import { useAtomValue } from 'jotai';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingOverlay from '@/components/root/LoadingOverlay';

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
    const hydrated = useHydrated();

    useRefreshToken({ redirectTo: pathname });

    const redirect = access && user ? portalRedirect(user, portal) : null;

    useEffect(() => {
        if (redirect) {
            router.replace(redirect);
        }
    }, [redirect, router]);

    // Still hydrating (the server never sees the stored session), validating
    // the stored token, or redirecting to the right portal.
    if (!hydrated || !access || !user || redirect) {
        return <LoadingOverlay />;
    }

    return children;
}
