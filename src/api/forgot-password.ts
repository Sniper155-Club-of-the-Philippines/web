import { FinalizePayload, VerifyPayload } from '@/types/api/forgot-password';
import { AxiosInstance } from 'axios';

export async function send(http: AxiosInstance, email: string) {
    const { data } = await http.post<{
        forgot_password_id: string;
        expires: string;
    }>('/v1/auth/forgot-password/send', {
        email,
    });

    return data;
}

export async function verify(http: AxiosInstance, payload: VerifyPayload) {
    await http.post('/v1/auth/forgot-password/verify', payload);
}

export async function finalize(http: AxiosInstance, payload: FinalizePayload) {
    await http.post('/v1/auth/forgot-password/finalize', payload);
}
