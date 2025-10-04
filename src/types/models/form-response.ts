import type { Model } from '@/types/models/model';
import type { Form } from '@/types/models/form';
import type { User } from '@/types/models/user';
import type { FormResponseAnswer } from '@/types/models/form-response-answer';

export interface FormResponse extends Model {
    form?: Form;
    user?: User;
    answers?: FormResponseAnswer[];
}
