import type { AxiosInstance } from 'axios';
import type { Order, OrderStatus } from '@/types/models/order';
import type { Paginated } from '@/types/pagination';

export interface OrderListParams {
    order_status?: OrderStatus;
    payment_status?: string;
    batch_id?: string;
    product_id?: string;
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
}

export interface OrderItemEdit {
    id: string;
    size?: string;
    recipient_nickname?: string;
    quantity?: number;
}

export async function list(http: AxiosInstance, params: OrderListParams = {}) {
    const { data } = await http.get<Paginated<Order>>('/v1/admin/orders', {
        params,
    });
    return data;
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
