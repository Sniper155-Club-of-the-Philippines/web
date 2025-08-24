import { User } from '@/types/models/user';
import { AxiosInstance } from 'axios';

export async function all(http: AxiosInstance) {
    const { data } = await http.get<{ users: User[] }>('/v1/users');

    return data.users;
}

export async function store(http: AxiosInstance, payload: Partial<User>) {
    const { data } = await http.post(`/v1/users`, payload);

    return data;
}

export async function update(http: AxiosInstance, payload: Partial<User>) {
    const FormData = await import('@avidian/form-data');

    if ('password' in payload && !payload.password) {
        delete payload.password;
    }

    const formData = new FormData.default(payload);

    formData.set('_method', 'PUT');

    const { data } = await http.post(`/v1/users/${payload.id}`, formData);

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
