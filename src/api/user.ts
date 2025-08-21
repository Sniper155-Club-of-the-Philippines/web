import { User } from '@/types/user';
import { Http } from '@avidian/http';

export async function all(http: Http) {
    const { data } = await http.get<{ users: User[] }>('/v1/users');

    return data.users;
}

export async function update(http: Http, payload: Partial<User>) {
    const FormData = await import('@avidian/form-data');

    if ('password' in payload && !payload.password) {
        delete payload.password;
    }

    const formData = new FormData.default(payload);

    formData.set('_method', 'PUT');

    const { data } = await http.post(`/v1/users/${payload.id}`, formData);

    return data;
}

export async function remove(http: Http, id: string) {
    await http.delete(`/v1/users/${id}`);
}

export async function pdf(http: Http) {
    const { data } = await http.get<Blob>('/v1/users/pdf', {
        headers: {
            Accept: 'application/pdf',
        },
        responseType: 'blob',
    });

    return data;
}
