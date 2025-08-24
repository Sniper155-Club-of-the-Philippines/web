import { Profile } from '@/types/models/profile';
import { AxiosInstance } from 'axios';

export async function all(http: AxiosInstance) {
    const { data } = await http.get<{ profiles: Profile[] }>('/v1/profiles');

    return data.profiles;
}

export async function show(http: AxiosInstance, id: string) {
    const { data } = await http.get<{ profile: Profile }>(`/v1/profiles/${id}`);

    return data.profile;
}

export async function store(http: AxiosInstance, payload: Partial<Profile>) {
    const { data } = await http.post(`/v1/profiles`, payload);

    return data;
}

export async function remove(http: AxiosInstance, id: string) {
    await http.delete(`/v1/profiles/${id}`);
}
