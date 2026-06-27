import type { AxiosInstance } from 'axios';
import type { PaymentMethod } from '@/types/models/store';

export type PaymentMethodPayload = Pick<
    PaymentMethod,
    | 'label'
    | 'type'
    | 'account_name'
    | 'account_number'
    | 'instructions'
    | 'is_active'
    | 'sort_order'
> & { qr_image?: File };

function formData(payload: PaymentMethodPayload) {
    const data = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        data.set(
            key,
            value instanceof File
                ? value
                : typeof value === 'boolean'
                  ? value
                      ? '1'
                      : '0'
                  : String(value),
        );
    });
    return data;
}

export async function all(http: AxiosInstance) {
    const { data } = await http.get<{ payment_methods: PaymentMethod[] }>(
        '/v1/payment-methods',
    );
    return data.payment_methods;
}

export async function store(
    http: AxiosInstance,
    payload: PaymentMethodPayload,
) {
    const { data } = await http.post<{ payment_method: PaymentMethod }>(
        '/v1/payment-methods',
        formData(payload),
    );
    return data.payment_method;
}

export async function update(
    http: AxiosInstance,
    id: string,
    payload: PaymentMethodPayload,
) {
    const body = formData(payload);
    body.set('_method', 'PUT');
    const { data } = await http.post<{ payment_method: PaymentMethod }>(
        `/v1/payment-methods/${id}`,
        body,
    );
    return data.payment_method;
}

export async function remove(http: AxiosInstance, id: string) {
    await http.delete(`/v1/payment-methods/${id}`);
}
