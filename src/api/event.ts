import { Event } from '@/types/models/event';
import { AxiosInstance } from 'axios';

export async function all(http: AxiosInstance) {
    const { data } = await http.get<{ events: Event[] }>('/v1/events');

    return data.events;
}

export async function show(http: AxiosInstance, id: string) {
    const { data } = await http.get<{ event: Event }>(`/v1/events/${id}`);

    return data.event;
}

export async function store(http: AxiosInstance, payload: Partial<Event>) {
    const { data } = await http.post<{ event: Event }>(`/v1/events`, payload);

    return data.event;
}

export async function update(
    http: AxiosInstance,
    id: Event['id'],
    payload: Partial<Event>,
) {
    const { data } = await http.put<{ event: Event }>(
        `/v1/events/${id}`,
        payload,
    );

    return data.event;
}

export async function remove(http: AxiosInstance, id: string) {
    await http.delete(`/v1/events/${id}`);
}
