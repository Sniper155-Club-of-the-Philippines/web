'use client';

import { accessAtom, userAtom } from '@/atoms/auth';
import { AUTH_ROUTES, mustChangePassword } from '@/lib/auth';
import { useAtomValue } from 'jotai';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ForcedPasswordGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const access = useAtomValue(accessAtom);
    const user = useAtomValue(userAtom);
    const pathname = usePathname();
    const router = useRouter();
    const isBlocked = Boolean(
        access &&
        user &&
        mustChangePassword(user) &&
        pathname !== AUTH_ROUTES.changePassword,
    );

    useEffect(() => {
        if (isBlocked) {
            router.replace(AUTH_ROUTES.changePassword);
        }
    }, [isBlocked, router]);

    return isBlocked ? null : children;
}
