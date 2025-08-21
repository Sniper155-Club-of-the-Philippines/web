import { Access } from '@/types/auth';
import { User } from '@/types/user';
import { Http } from '@avidian/http';

export async function login(http: Http, email: string, password: string) {
    const { data } = await http.post<{ user: User; access: Access }>(
        '/v1/auth/login',
        {
            email,
            password,
        }
    );

    return data;
}

export async function loginWithGoogle(http: Http, accessToken: string) {
    const { data } = await http.post<{ user: User; access: Access }>(
        '/v1/auth/oauth/google',
        {
            access_token: accessToken,
        }
    );

    return data;
}

export async function logout(http: Http) {
    await http.get('/v1/auth/logout');
}

export async function designations(http: Http) {
    const { data } = await http.get<{ designations: Record<string, string> }>(
        '/v1/auth/designations'
    );

    return Object.values(data.designations).map((value) => ({
        label: value,
        value,
    }));
}
