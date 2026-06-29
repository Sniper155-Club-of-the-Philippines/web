import { User } from '@/types/models/user';
import { AxiosInstance } from 'axios';

/**
 * Admin user create/update payload. `password` is write-only (not part of the
 * `User` model) and `photo` is the uploaded file; both are sent as form data.
 */
export type UserPayload = Partial<User> & {
    password?: string;
    password_confirmation?: string;
    photo?: File;
};

export interface TemporaryPasswordResponse {
    user: User;
    temp_password: string;
}

export async function all(http: AxiosInstance) {
    const { data } = await http.get<{ users: User[] }>('/v1/users');

    return data.users;
}

export async function store(http: AxiosInstance, payload: UserPayload) {
    const FormData = await import('@avidian/form-data');

    const formData = new FormData.default(payload);

    const { data } = await http.post<TemporaryPasswordResponse>(
        `/v1/users`,
        formData,
    );

    return data;
}

export async function resetPassword(http: AxiosInstance, id: User['id']) {
    const { data } = await http.post<TemporaryPasswordResponse>(
        `/v1/users/${id}/reset-password`,
    );

    return data;
}

export async function update(
    http: AxiosInstance,
    id: User['id'],
    payload: UserPayload,
) {
    const FormData = await import('@avidian/form-data');

    if ('password' in payload && !payload.password) {
        delete payload.password;
    }

    const formData = new FormData.default(payload);

    formData.set('_method', 'PUT');

    const { data } = await http.post<{ user: User }>(
        `/v1/users/${id}`,
        formData,
    );

    return data.user;
}

export async function assignRoles(
    http: AxiosInstance,
    id: string,
    roles: string[],
) {
    const { data } = await http.post<{ user: User }>(`/v1/users/${id}/roles`, {
        roles,
    });

    return data;
}

export async function remove(http: AxiosInstance, id: string) {
    await http.delete(`/v1/users/${id}`);
}

export async function pdf(http: AxiosInstance) {
    const { data } = await http.get<Blob>('/v1/users/pdf', {
        headers: {
            Accept: 'application/pdf',
        },
        responseType: 'blob',
    });

    return data;
}
