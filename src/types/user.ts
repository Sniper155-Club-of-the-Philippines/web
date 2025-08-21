import { Model } from '@/types/model';
import { Chapter } from '@/types/chapter';

export interface User extends Model {
    first_name: string;
    last_name: string;
    email: string;
    photo_url: string | null;
    designation: string | null;
    google_id: string | null;
    club_number: string | null;
    chapter_id: string | null;
    chapter?: Chapter | null;
}
