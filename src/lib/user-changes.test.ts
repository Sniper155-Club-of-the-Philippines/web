import { describe, expect, it } from 'vitest';
import type { UserChange } from '@/types/models/user';
import { userChangeRow } from './user-changes';

const change = (overrides: Partial<UserChange>): UserChange => ({
    id: 'c1',
    field: 'obr_size',
    old_value: 'S',
    new_value: 'M',
    created_at: '2026-10-17T09:05:00',
    changed_by: 'u1',
    changer: { id: 'u1', first_name: 'Maria', last_name: 'Santos' },
    ...overrides,
});

describe('userChangeRow', () => {
    it('labels the field and names who changed it', () => {
        expect(userChangeRow(change({}))).toEqual({
            id: 'c1',
            when: 'Oct 17, 2026 9:05 AM',
            field: 'OBR size',
            from: 'S',
            to: 'M',
            by: 'Maria Santos',
        });
    });

    it('shows empty values as not set', () => {
        const row = userChangeRow(change({ old_value: null, new_value: '' }));

        expect([row.from, row.to]).toEqual(['Not set', 'Not set']);
    });

    it('tells system changes apart from changes by a deleted user', () => {
        expect(
            userChangeRow(change({ changed_by: null, changer: null })).by,
        ).toBe('System');
        expect(userChangeRow(change({ changer: null })).by).toBe(
            'Deleted user',
        );
    });

    it('falls back to the raw field name for unknown fields', () => {
        expect(userChangeRow(change({ field: 'nickname' })).field).toBe(
            'nickname',
        );
    });
});
