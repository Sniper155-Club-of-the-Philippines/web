import type { Model } from '@/types/models/model';
import type { Chapter } from '@/types/models/chapter';

export interface User extends Model {
    first_name: string;
    last_name: string;
    email: string;
    address: string | null;
    phone: string | null;
    photo_url: string | null;
    designation: string | null;
    google_id: string | null;
    club_number: string | null;
    yclub_number: string | null;
    chapter_id: string | null;
    chapter?: Chapter | null;
    blood_type?: string | null;
    allergy?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
}
