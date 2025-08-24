import type { Model } from '@/types/models/model';

export interface Chapter extends Model {
    name: string;
    photo_url: string | null;
    page_url: string | null;
}
