import { Model } from '@/types/model';

export interface Chapter extends Model {
    name: string;
    photo_url: string | null;
}
