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
    region?: string | null;
    rider_nickname?: string | null;
    rider_nickname_changed_at?: string | null;
    rider_size?: string | null;
    obr_full_name?: string | null;
    obr_nickname?: string | null;
    obr_size?: string | null;
    /** When the OBR full name, nickname or size last changed. */
    obr_changed_at?: string | null;
    google_id: string | null;
    club_number: string | null;
    yclub_number: string | null;
    chapter_id: string | null;
    chapter?: Chapter | null;
    blood_type?: string | null;
    allergy?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    roles?: string[];
    permissions?: string[];
    force_password_change?: boolean;
    /** Admin user list only: false until the member receives credentials. */
    has_password?: boolean;
}

/** One field of a member's personal info changing (admin change log). */
export interface UserChange {
    id: string;
    field: string;
    old_value: string | null;
    new_value: string | null;
    created_at: string;
    changed_by: string | null;
    changer: Pick<User, 'id' | 'first_name' | 'last_name'> | null;
}
