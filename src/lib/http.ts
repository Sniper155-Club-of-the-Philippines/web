import { Http } from '@avidian/http';

export const http = new Http({
	baseUrl: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		Accept: 'application/json',
	},
});
