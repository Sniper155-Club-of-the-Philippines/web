import { Role } from '@/types/models/role';
import { AxiosInstance } from 'axios';

export async function all(http: AxiosInstance) {
    const { data } = await http.get<{ roles: Role[] }>('/v1/roles');

    return data.roles;
}

export type RolePayload = { name: string; permissions: string[] };

export async function store(http: AxiosInstance, payload: RolePayload) {
    const { data } = await http.post<{ role: Role }>('/v1/roles', payload);
    return data.role;
}

export async function update(
    http: AxiosInstance,
    id: string,
    payload: RolePayload,
) {
    const { data } = await http.put<{ role: Role }>(`/v1/roles/${id}`, payload);
    return data.role;
}

export async function remove(http: AxiosInstance, id: string) {
    await http.delete(`/v1/roles/${id}`);
}
