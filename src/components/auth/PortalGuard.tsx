'use client';

import { accessAtom, userAtom } from '@/atoms/auth';
import { useRefreshToken } from '@/hooks/auth';
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

    useRefreshToken({ redirectTo: pathname });

    const redirect = access && user ? portalRedirect(user, portal) : null;

    useEffect(() => {
        if (redirect) {
            router.replace(redirect);
        }
    }, [redirect, router]);

    // Still validating the stored token, or redirecting to the right portal.
    if (!access || !user || redirect) {
        return <LoadingOverlay />;
    }

    return children;
}
