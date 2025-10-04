import type { FormPayload, GetAllParams } from '@/types/api/form';
import type { Form } from '@/types/models/form';
import type { FormResponse } from '@/types/models/form-response';
import type { AxiosInstance } from 'axios';

export async function all(http: AxiosInstance, params?: GetAllParams) {
    const { data } = await http.get<{ forms: Form[] }>('/v1/forms', {
        params,
    });

    return data.forms;
}

export async function show(http: AxiosInstance, id: string) {
    const { data } = await http.get<{ form: Form }>(`/v1/forms/${id}`);

    return data.form;
}

export async function store(http: AxiosInstance, payload: FormPayload) {
    const { data } = await http.post(`/v1/forms`, payload);

    return data;
}

export async function update(
    http: AxiosInstance,
    payload: Partial<FormPayload> & { id: string }
) {
    const { data } = await http.put(`/v1/forms/${payload.id}`, payload);

    return data;
}

export async function toggle(http: AxiosInstance, id: string, active: boolean) {
    await http.put(`/v1/forms/${id}/toggle`, { active });
}

export async function remove(http: AxiosInstance, id: string) {
    await http.delete(`/v1/forms/${id}`);
}

export async function status(http: AxiosInstance, id: string) {
    const { data } = await http.get<{ response: FormResponse }>(
        `/v1/forms/${id}/status`
    );

    return data.response;
}

export async function answer(
    http: AxiosInstance,
    id: string,
    answers: Record<string, any>
) {
    await http.post(`/v1/forms/${id}/answer`, { answers });
}

export async function answers(http: AxiosInstance, id: string) {
    const { data } = await http.get<{ data: FormResponse }>(
        `/v1/forms/${id}/answers`
    );

    return data.data;
}

export async function responses(http: AxiosInstance, id: string) {
    const { data } = await http.get<{ responses: FormResponse[] }>(
        `/v1/forms/${id}/responses`
    );

    return data.responses;
}
