'use client';

import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { GoogleLoginResponse } from '@/types/auth';

type Props = {
	onSuccess?: (response: GoogleLoginResponse) => void;
};

export default function GoogleButton({ onSuccess }: Props) {
	const login = useGoogleLogin({
		onSuccess(response) {
			onSuccess?.(response);
		},
	});

	return (
		<Button
			variant='outline'
			className='w-full'
			onClick={(e) => {
				e.preventDefault();
				login();
			}}>
			<FontAwesomeIcon icon={faGoogle} />
			Login with Google
		</Button>
	);
}
