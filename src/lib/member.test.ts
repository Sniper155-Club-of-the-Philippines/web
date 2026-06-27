import { describe, expect, it } from 'vitest';
import type { User } from '@/types/models/user';
import { memberInfoRows } from './member';

function user(overrides: Partial<User> = {}): User {
    return {
        id: 'u1',
        first_name: 'Dale',
        last_name: 'Reyes',
        email: 'dale@example.com',
        address: null,
        phone: null,
        photo_url: null,
        designation: 'Road Captain',
        region: 'NCR',
        google_id: null,
        club_number: 'C-0155',
        yclub_number: null,
        chapter_id: 'ch1',
        chapter: { id: 'ch1', name: 'Manila' } as User['chapter'],
        ...overrides,
    } as User;
}

describe('memberInfoRows', () => {
    it('presents the expected labels in a stable order', () => {
        const labels = memberInfoRows(user()).map((row) => row.label);

        expect(labels).toEqual([
            'Name',
            'Club number',
            'Email',
            'Chapter',
            'Designation',
            'Region',
        ]);
    });

    it('joins the first and last name', () => {
        const rows = memberInfoRows(user());

        expect(rows[0]).toEqual({ label: 'Name', value: 'Dale Reyes' });
    });

    it('flattens the chapter to its name', () => {
        const chapter = memberInfoRows(user()).find(
            (row) => row.label === 'Chapter',
        );

        expect(chapter?.value).toBe('Manila');
    });

    it('falls back to "Not set" for missing values', () => {
        const rows = memberInfoRows(
            user({
                designation: null,
                region: null,
                club_number: null,
                chapter: null,
            }),
        );
        const byLabel = Object.fromEntries(
            rows.map((row) => [row.label, row.value]),
        );

        expect(byLabel['Designation']).toBe('Not set');
        expect(byLabel['Region']).toBe('Not set');
        expect(byLabel['Club number']).toBe('Not set');
        expect(byLabel['Chapter']).toBe('Not set');
    });

    it('handles a null user entirely', () => {
        const rows = memberInfoRows(null);

        expect(rows).toHaveLength(6);
        expect(rows.every((row) => row.value === 'Not set')).toBe(true);
    });
});
