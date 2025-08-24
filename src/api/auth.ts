import { Access } from '@/types/models/auth';
import { User } from '@/types/models/user';
import { AxiosInstance } from 'axios';

export async function login(
    http: AxiosInstance,
    email: string,
    password: string
) {
    const { data } = await http.post<{ user: User; access: Access }>(
        '/v1/auth/login',
        {
            email,
            password,
        }
    );

    return data;
}

export async function loginWithGoogle(
    http: AxiosInstance,
    accessToken: string
) {
    const { data } = await http.post<{ user: User; access: Access }>(
        '/v1/auth/oauth/google',
        {
            access_token: accessToken,
        }
    );

    return data;
}

export async function logout(http: AxiosInstance) {
    await http.get('/v1/auth/logout');
}

export async function designations(http: AxiosInstance) {
    const { data } = await http.get<{ designations: Record<string, string> }>(
        '/v1/auth/designations'
    );

    return Object.values(data.designations).map((value) => ({
        label: value,
        value,
    }));
}
