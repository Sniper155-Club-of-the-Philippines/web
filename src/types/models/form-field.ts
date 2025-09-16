import type { Model } from '@/types/models/model';
import type { Form } from '@/types/models/form';
import { FORM_FIELD_TYPES } from '@/constants';

export type FormFieldType =
    (typeof FORM_FIELD_TYPES)[keyof typeof FORM_FIELD_TYPES];

export interface FormField extends Model {
    form_id: string;
    form?: Form;
    label: string;
    type: FormFieldType;
    required: boolean;
    order: number;
    meta?: any;
}
