import type { Form } from '@/types/models/form';
import type { AxiosInstance } from 'axios';

export type GetAllParams =
    | {
          user_id?: string;
          active?: boolean;
          from?: undefined;
          to?: undefined;
      }
    | {
          user_id?: string;
          active?: boolean;
          from: string;
          to: string;
      };

export async function all(http: AxiosInstance, params?: GetAllParams) {
    const { data } = await http.get<{ forms: Form[] }>('/v1/forms', {
        params,
    });

    return data.forms;
}

export async function remove(http: AxiosInstance, id: string) {
    await http.delete(`/v1/forms/${id}`);
}
