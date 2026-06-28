import type { AxiosInstance } from 'axios';
import type { Order, ProofPayload } from '@/types/models/order';

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

export async function submitProof(
    http: AxiosInstance,
    id: string,
    payload: ProofPayload,
) {
    const body = new FormData();
    body.set('payment_method_id', payload.payment_method_id);
    body.set('proof', payload.proof);
    if (payload.payment_ref_no) {
        body.set('payment_ref_no', payload.payment_ref_no);
    }
    if (payload.paid_amount !== undefined) {
        body.set('paid_amount', String(payload.paid_amount));
    }

    const { data } = await http.post<{ order: Order }>(
        `/v1/orders/${id}/proof`,
        body,
    );
    return data.order;
}

export async function proofUrl(http: AxiosInstance, id: string) {
    const { data } = await http.get<{ url: string }>(`/v1/orders/${id}/proof`);
    return data.url;
}

export async function approvePayment(http: AxiosInstance, id: string) {
    const { data } = await http.post<{ order: Order }>(
        `/v1/orders/${id}/payment/approve`,
    );
    return data.order;
}

export async function rejectPayment(
    http: AxiosInstance,
    id: string,
    rejectReason?: string,
) {
    const { data } = await http.post<{ order: Order }>(
        `/v1/orders/${id}/payment/reject`,
        rejectReason ? { reject_reason: rejectReason } : {},
    );
    return data.order;
}
