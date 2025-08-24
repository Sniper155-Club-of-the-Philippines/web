import { SETTING_TYPES } from '@/constants';
import { Setting } from '@/types/models/setting';
import { AxiosInstance } from 'axios';

type StorePayload =
    | (Omit<Partial<Setting>, 'value' | 'type'> & {
          type: typeof SETTING_TYPES.IMAGE;
          value: File;
      })
    | (Omit<Partial<Setting>, 'value' | 'type'> & {
          type: Exclude<Setting['type'], typeof SETTING_TYPES.IMAGE>;
          value?: Setting['value'];
      });

export async function all(
    http: AxiosInstance,
    params: Pick<Partial<Setting>, 'group' | 'key'>
) {
    const { data } = await http.get<{ settings: Setting[] }>('/v1/settings', {
        params,
    });

    return data.settings;
}

export async function store(http: AxiosInstance, payload: StorePayload) {
    const FormData = await import('@avidian/form-data');

    const { data } = await http.post(
        `/v1/settings`,
        new FormData.default(payload)
    );

    return data;
}

export async function remove(http: AxiosInstance, id: string) {
    await http.delete(`/v1/settings/${id}`);
}
