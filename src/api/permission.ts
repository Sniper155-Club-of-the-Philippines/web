import type { AxiosInstance } from 'axios';
import type { Permission } from '@/types/models/role';

export async function all(http: AxiosInstance) {
    const { data } = await http.get<{ permissions: Permission[] }>(
        '/v1/permissions',
    );
    return data.permissions;
}
