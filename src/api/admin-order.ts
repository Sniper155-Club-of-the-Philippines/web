import type { AxiosInstance } from 'axios';
import type { Order, OrderStatus } from '@/types/models/order';

export interface OrderItemEdit {
    id: string;
    size?: string;
    recipient_nickname?: string;
    quantity?: number;
}

/**
 * Every order in one request. Search, status, and batch filtering all happen
 * client-side, so there are no query params and no pagination.
 */
export async function list(http: AxiosInstance) {
    const { data } = await http.get<{ orders?: Order[] }>('/v1/admin/orders');
    return data.orders ?? [];
}

export async function get(http: AxiosInstance, id: string) {
    const { data } = await http.get<{ order: Order }>(`/v1/admin/orders/${id}`);
    return data.order;
}

export async function updateStatus(
    http: AxiosInstance,
    id: string,
    orderStatus: OrderStatus,
) {
    const { data } = await http.patch<{ order: Order }>(
        `/v1/admin/orders/${id}/status`,
        { order_status: orderStatus },
    );
    return data.order;
}

export async function bulkStatus(
    http: AxiosInstance,
    orderIds: string[],
    orderStatus: OrderStatus,
) {
    const { data } = await http.post<{ changed: number }>(
        '/v1/admin/orders/bulk-status',
        { order_ids: orderIds, order_status: orderStatus },
    );
    return data.changed;
}

export async function voidOrder(
    http: AxiosInstance,
    id: string,
    voidReason?: string,
) {
    const { data } = await http.post<{ order: Order }>(
        `/v1/admin/orders/${id}/void`,
        voidReason ? { void_reason: voidReason } : {},
    );
    return data.order;
}

export async function updateItems(
    http: AxiosInstance,
    id: string,
    items: OrderItemEdit[],
) {
    const { data } = await http.patch<{ order: Order }>(
        `/v1/admin/orders/${id}/items`,
        { items },
    );
    return data.order;
}
