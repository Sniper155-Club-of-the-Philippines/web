import { Role } from '@/types/models/role';
import { AxiosInstance } from 'axios';

export async function all(http: AxiosInstance) {
    const { data } = await http.get<{ roles: Role[] }>('/v1/roles');

    return data.roles;
}
