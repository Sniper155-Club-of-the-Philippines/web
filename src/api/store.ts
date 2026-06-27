import type { AxiosInstance } from 'axios';

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
