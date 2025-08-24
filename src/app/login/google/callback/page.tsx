'use client';

import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

import { Access } from '@/types/models/auth';
import { User } from '@/types/models/user';

export default function Callback() {
    const searchParams = useSearchParams();

    const check = useCallback(async () => {
        const accessToken = searchParams.get('access_token');
        if (!accessToken) return;

        try {
            const { data } = await axios.get<{ access: Access; user: User }>(
                `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`,
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            // Send token + user info back to parent window
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
    }, [searchParams]);

    useEffect(() => {
        check();
    }, [check]);

    return <p>Signing you in…</p>;
}
