import type { Model } from '@/types/models/model';
import type { User } from '@/types/models/user';

export interface Profile extends Model {
    user_id: string;
    url: string;
    shortened_url: string | null;
    user?: User;
}
