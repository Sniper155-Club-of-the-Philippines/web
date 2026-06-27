'use client';

import { auth } from '@/api';
import { accessAtom, userAtom } from '@/atoms/auth';
import { useHttp } from '@/hooks/http';
import { useSetAtom } from 'jotai';
import { RESET } from 'jotai/utils';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Sign the member out: revoke the session on the server (best effort), clear
 * the client auth state, and return to the login screen. Shared by the account
 * menu and the settings page so the flow stays identical wherever it is used.
 */
export function useLogout() {
    const http = useHttp();
    const setUser = useSetAtom(userAtom);
    const setAccess = useSetAtom(accessAtom);
    const router = useRouter();

    return useCallback(async () => {
        try {
            await auth.logout(http);
        } catch (error) {
            console.error(error);
        } finally {
            setUser(RESET);
            setAccess(RESET);
            router.push('/login');
        }
    }, [http, router, setAccess, setUser]);
}
