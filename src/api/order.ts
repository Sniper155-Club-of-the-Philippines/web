import type { AxiosInstance } from 'axios';
import type { Order } from '@/types/models/order';

export async function list(http: AxiosInstance) {
    const { data } = await http.get<{ orders: Order[] }>('/v1/orders');
    return data.orders;
}

export async function get(http: AxiosInstance, id: string) {
    const { data } = await http.get<{ order: Order }>(`/v1/orders/${id}`);
    return data.order;
}

export async function checkout(http: AxiosInstance) {
    const { data } = await http.post<{ order: Order }>('/v1/checkout');
    return data.order;
}

export async function voidOrder(http: AxiosInstance, id: string) {
    const { data } = await http.post<{ order: Order }>(`/v1/orders/${id}/void`);
    return data.order;
}
