import type { User } from '@/types/models/user';

export type MemberInfoRow = { label: string; value: string };

/**
 * Read-only account information shown to a member. These details are managed by
 * club administrators; this presents them in a stable order and fills in a
 * placeholder for anything not yet set.
 */
export function memberInfoRows(user: User | null): MemberInfoRow[] {
    const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
    const rows: [string, string | null | undefined][] = [
        ['Name', name],
        ['Club number', user?.club_number],
        ['Email', user?.email],
        ['Chapter', user?.chapter?.name],
        ['Designation', user?.designation],
        ['Region', user?.region],
    ];

    return rows.map(([label, value]) => ({ label, value: value || 'Not set' }));
}
