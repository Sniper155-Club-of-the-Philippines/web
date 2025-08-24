'use client';

import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { GoogleLoginResponse } from '@/types/models/auth';
import { configAtom } from '@/atoms/auth';
import { useAtom } from 'jotai';

type Props = {
    onSuccess?: (response: GoogleLoginResponse) => void;
};

export default function GoogleButton({ onSuccess }: Props) {
    const [config] = useAtom(configAtom);

    const login = useGoogleLogin({
        flow: 'auth-code',
        redirect_uri: config?.google?.redirectUri,
        onSuccess,
    });

    return (
        <Button
            variant='outline'
            className='w-full'
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
