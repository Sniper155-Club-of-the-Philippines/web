import type { AxiosInstance } from 'axios';
import type { Batch, BatchProduct } from '@/types/models/store';

export type BatchPayload = Pick<
    Batch,
    | 'name'
    | 'sequence'
    | 'ordering_start_at'
    | 'ordering_end_at'
    | 'is_active'
    | 'notes'
>;

export async function all(http: AxiosInstance) {
    const { data } = await http.get<{ batches: Batch[] }>('/v1/batches');
    return data.batches;
}

export async function show(http: AxiosInstance, id: string) {
    const { data } = await http.get<{ batch: Batch }>(`/v1/batches/${id}`);
    return data.batch;
}

export async function store(http: AxiosInstance, payload: BatchPayload) {
    const { data } = await http.post<{ batch: Batch }>('/v1/batches', payload);
    return data.batch;
}

export async function update(
    http: AxiosInstance,
    id: string,
    payload: BatchPayload,
) {
    const { data } = await http.put<{ batch: Batch }>(
        `/v1/batches/${id}`,
        payload,
    );
    return data.batch;
}

export async function remove(http: AxiosInstance, id: string) {
    await http.delete(`/v1/batches/${id}`);
}

export async function updateProduct(
    http: AxiosInstance,
    batchId: string,
    productId: string,
    payload: Omit<
        BatchProduct,
        'id' | 'batch_id' | 'product_id' | 'created_at' | 'updated_at'
    >,
) {
    const { data } = await http.put<{ batch_product: BatchProduct }>(
        `/v1/batches/${batchId}/products/${productId}`,
        payload,
    );
    return data.batch_product;
}

export async function exportBatch(http: AxiosInstance, id: string) {
    const { data } = await http.get<Blob>(`/v1/batches/${id}/export`, {
        responseType: 'blob',
    });
    return data;
}
