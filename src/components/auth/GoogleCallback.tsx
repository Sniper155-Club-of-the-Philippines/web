'use client';

import { accessAtom, userAtom } from '@/atoms/auth';
import { Access } from '@/types/models/auth';
import { User } from '@/types/models/user';
import axios from 'axios';
import { useAtom } from 'jotai';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export default function GoogleCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [, setAccess] = useAtom(accessAtom);
    const [, setUser] = useAtom(userAtom);
    const http = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        withCredentials: true,
    });

    const check = useCallback(async () => {
        const accessToken = searchParams.get('access_token');
        if (!accessToken) return;

        const { data } = await http.get<{ access: Access; user: User }>(
            '/v1/auth/refresh',
            {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        setAccess(data.access);
        setUser(data.user);

        router.replace('/dashboard');
    }, [searchParams, router, setAccess, setUser]);

    useEffect(() => {
        check();
    }, [check]);

    return <p>Signing you in…</p>;
}
