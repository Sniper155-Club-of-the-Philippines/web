import type { AxiosInstance } from 'axios';
import type { StoreProduct, StoreStatus } from '@/types/models/store';

export async function status(http: AxiosInstance) {
    const { data } = await http.get<StoreStatus>('/v1/store/status');
    return data;
}

export async function products(http: AxiosInstance) {
    const { data } = await http.get<{ products: StoreProduct[] }>(
        '/v1/store/products',
    );
    return data.products;
}

export async function settings(http: AxiosInstance) {
    const { data } = await http.get<{ store_enabled: boolean }>(
        '/v1/store/settings',
    );
    return data;
}

export async function updateSettings(
    http: AxiosInstance,
    storeEnabled: boolean,
) {
    const { data } = await http.put<{ store_enabled: boolean }>(
        '/v1/store/settings',
        {
            store_enabled: storeEnabled,
        },
    );
    return data;
}
