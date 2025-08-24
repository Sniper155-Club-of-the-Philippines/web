import { Chapter } from '@/types/models/chapter';
import { AxiosInstance } from 'axios';

export async function all(http: AxiosInstance) {
    const { data } = await http.get<{ chapters: Chapter[] }>('/v1/chapters');

    return data.chapters;
}

export async function store(http: AxiosInstance, payload: Partial<Chapter>) {
    const FormData = await import('@avidian/form-data');

    const formData = new FormData.default(payload, {
        nullsAsUndefineds: true,
    });

    const { data } = await http.post(`/v1/chapters`, formData);

    return data;
}

export async function update(http: AxiosInstance, payload: Partial<Chapter>) {
    const FormData = await import('@avidian/form-data');

    const formData = new FormData.default(payload, {
        nullsAsUndefineds: true,
    });

    formData.set('_method', 'PUT');

    const { data } = await http.post(`/v1/chapters/${payload.id}`, formData);

    return data;
}

export async function remove(http: AxiosInstance, id: string) {
    await http.delete(`/v1/chapters/${id}`);
}

export async function pdf(http: AxiosInstance) {
    const { data } = await http.get<Blob>('/v1/chapters/pdf', {
        headers: {
            Accept: 'application/pdf',
        },
        responseType: 'blob',
    });

    return data;
}
