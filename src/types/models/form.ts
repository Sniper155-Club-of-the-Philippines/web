import type { Model } from '@/types/models/model';
import type { User } from '@/types/models/user';
import { FormField } from '@/types/models/form-field';

export interface Form extends Model {
    title: string;
    description: string;
    active: boolean;
    user_id?: string | null;
    user?: User;
    fields?: FormField[];
}
