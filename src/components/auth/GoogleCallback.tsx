'use client';

import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

import { Access } from '@/types/models/auth';
import { User } from '@/types/models/user';

export default function GoogleCallback() {
    const searchParams = useSearchParams();

    const http = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        withCredentials: true,
    });

    const check = useCallback(async () => {
        const accessToken = searchParams.get('access_token');
        if (!accessToken) return;

        try {
            const { data } = await http.get<{ access: Access; user: User }>(
                '/v1/auth/refresh',
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (window.opener) {
                window.opener.postMessage(
                    {
                        access: data.access,
                        user: data.user,
                    },
                    window.location.origin
                );
            }

            window.close();
        } catch (error) {
            if (window.opener) {
                window.opener.postMessage(
                    {
                        error,
                    },
                    window.location.origin
                );
            }
            window.close();
        }
    }, [searchParams, http]);

    useEffect(() => {
        check();
    }, [check]);

    return <p>Signing you in…</p>;
}
