import type { Model } from '@/types/models/model';

export interface Event extends Model {
    title: string;
    description: string;
    start: string;
    end: string;
}
