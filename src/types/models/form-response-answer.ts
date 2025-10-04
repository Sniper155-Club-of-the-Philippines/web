import type { Model } from '@/types/models/model';
import type { FormResponse } from '@/types/models/form-response';
import type { FormField } from '@/types/models/form-field';

export interface FormResponseAnswer extends Model {
    response?: FormResponse;
    field?: FormField;
    answer: string;
}
