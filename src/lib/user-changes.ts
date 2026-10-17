import dayjs from 'dayjs';
import type { UserChange } from '@/types/models/user';

/** Labels for the personal-info fields the API records changes for. */
export const USER_CHANGE_FIELD_LABELS: Record<string, string> = {
    first_name: 'First name',
    last_name: 'Last name',
    email: 'Email',
    address: 'Address',
    phone: 'Contact',
    chapter: 'Chapter',
    designation: 'Designation',
    region: 'Region',
    photo_url: 'Profile photo',
    club_number: 'Club number',
    yclub_number: 'YClub number',
    blood_type: 'Blood type',
    allergy: 'Allergy',
    emergency_contact_name: 'Emergency contact name',
    emergency_contact_phone: 'Emergency contact phone',
    rider_nickname: 'Rider nickname',
    rider_size: 'Rider size',
    obr_full_name: 'OBR full name',
    obr_nickname: 'OBR nickname',
    obr_size: 'OBR size',
};

export type UserChangeRow = {
    id: string;
    when: string;
    field: string;
    from: string;
    to: string;
    by: string;
};

/** A change log entry formatted for the admin change history table. */
export function userChangeRow(change: UserChange): UserChangeRow {
    const by = change.changer
        ? `${change.changer.first_name} ${change.changer.last_name}`.trim()
        : change.changed_by
          ? 'Deleted user'
          : 'System';

    return {
        id: change.id,
        when: dayjs(change.created_at).format('MMM D, YYYY h:mm A'),
        field: USER_CHANGE_FIELD_LABELS[change.field] ?? change.field,
        from: change.old_value || 'Not set',
        to: change.new_value || 'Not set',
        by,
    };
}
