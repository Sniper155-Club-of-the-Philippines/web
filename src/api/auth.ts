import { http } from '@/lib/http';
import { Access } from '@/types/auth';
import { User } from '@/types/user';

export async function login(email: string, password: string) {
	const { data } = await http.post<{ user: User; access: Access }>('/v1/auth/login', {
		email,
		password,
	});

	return data;
}

export async function loginWithGoogle(accessToken: string) {
	const { data } = await http.post<{ user: User; access: Access }>('/v1/auth/oauth/google', {
		access_token: accessToken,
	});

	return data;
}
