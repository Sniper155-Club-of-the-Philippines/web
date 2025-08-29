'use client';

import { useEffect } from 'react';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/button';
import { Access } from '@/types/models/auth';
import { User } from '@/types/models/user';
import type { AxiosError } from 'axios';

type GoogleButtonProps = {
    onSuccess?: (access: Access, user: User) => void;
    onError?: (error: Error | AxiosError) => void;
};

export default function GoogleButton({
    onSuccess,
    onError,
}: GoogleButtonProps) {
    useEffect(() => {
        const handler = (
            event: MessageEvent<{
                access: Access;
                user: User;
                error?: Error | AxiosError;
            }>
        ) => {
            // Only accept messages from same origin
            if (event.origin !== window.location.origin) return;

            const { access, user, error } = event.data || {};

            if (access && user) {
                onSuccess?.(access, user);
            } else if (error) {
                onError?.(error);
            }
        };

        window.addEventListener('message', handler);
        return () => {
            window.removeEventListener('message', handler);
        };
    }, [onSuccess, onError]);

    const login = () => {
        const width = 500;
        const height = 600;

        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        window.open(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/oauth/google/redirect`,
            'googleLogin',
            `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars`
        );
    };

    return (
        <Button
            variant='outline'
            className='w-full flex items-center gap-2'
            onClick={(e) => {
                e.preventDefault();
                login();
            }}
        >
            <FontAwesomeIcon icon={faGoogle} />
            Login with Google
        </Button>
    );
}
