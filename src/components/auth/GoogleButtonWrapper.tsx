'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import { http } from '@/lib/http';

export default function GoogleButtonWrapper({ children }: { children?: React.ReactNode }) {
	const [clientId, setClientId] = useState<string | null>(null);

	const fetchConfig = async () => {
		try {
			const config = await http.get('/v1/auth/config');
			setClientId(config.data.google.clientId);
		} catch (error) {
			console.error('Error fetching Google config:', error);
		}
	};

	useEffect(() => {
		fetchConfig();
	}, []);

	if (!clientId) {
		return null;
	}

	return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
