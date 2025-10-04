import { FormFieldType } from '@/types/models/form-field';

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

export interface FormPayload {
    title: string;
    description?: string | null;
    active: boolean;
    fields: FormField[];
}

export interface FormField {
    label: string;
    type: FormFieldType;
    required: boolean;
    order: number;
    meta?: Record<string, any> | string | null;
    options?: FormFieldOption[];
}

export interface FormFieldOption {
    label: string;
    value: string;
    order: number;
}
