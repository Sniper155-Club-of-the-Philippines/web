import type { AxiosInstance } from 'axios';
import type { CartItem, CartLine, RecipientType } from '@/types/models/cart';

export interface AddToCartPayload {
    product_id: string;
    recipient_type: RecipientType;
    size: string;
    quantity: number;
}

export interface UpdateCartPayload {
    size?: string;
    quantity?: number;
}

export async function list(http: AxiosInstance) {
    const { data } = await http.get<{ cart: CartLine[]; total: number }>(
        '/v1/cart',
    );
    return data;
}

export async function add(http: AxiosInstance, payload: AddToCartPayload) {
    const { data } = await http.post<{ item: CartItem }>('/v1/cart', payload);
    return data.item;
}

export async function update(
    http: AxiosInstance,
    id: string,
    payload: UpdateCartPayload,
) {
    const { data } = await http.patch<{ item: CartItem }>(
        `/v1/cart/${id}`,
        payload,
    );
    return data.item;
}

export async function remove(http: AxiosInstance, id: string) {
    await http.delete(`/v1/cart/${id}`);
}
