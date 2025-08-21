import { Chapter } from '@/types/chapter';
import { Http } from '@avidian/http';

export async function all(http: Http) {
    const { data } = await http.get<{ chapters: Chapter[] }>('/v1/chapters');

    return data.chapters;
}

export async function update(http: Http, payload: Partial<Chapter>) {
    const FormData = await import('@avidian/form-data');

    const formData = new FormData.default(payload, {
        nullsAsUndefineds: true,
    });

    formData.set('_method', 'PUT');

    const { data } = await http.post(`/v1/chapters/${payload.id}`, formData);

    return data;
}

export async function remove(http: Http, id: string) {
    await http.delete(`/v1/chapters/${id}`);
}

export async function pdf(http: Http) {
    const { data } = await http.get<Blob>('/v1/chapters/pdf', {
        headers: {
            Accept: 'application/pdf',
        },
        responseType: 'blob',
    });

    return data;
}
