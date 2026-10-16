import { describe, expect, it } from 'vitest';
import { credentialEmailsEta, membersWithoutAccount } from './credentials';
import type { User } from '@/types/models/user';

describe('membersWithoutAccount', () => {
    it('keeps only members explicitly flagged without a password', () => {
        const users = [
            { id: 'a', has_password: false },
            { id: 'b', has_password: true },
            { id: 'c' },
        ] as User[];

        expect(membersWithoutAccount(users).map((user) => user.id)).toEqual([
            'a',
        ]);
    });
});

describe('credentialEmailsEta', () => {
    it.each([
        [1, 'about 6 minutes'],
        [2, 'about 7 minutes'],
        [88, 'about 1 hour'],
        [181, 'about 1 hour 59 minutes'],
        [241, 'about 2 hours 36 minutes'],
    ])('estimates %i email(s) as %s', (count, expected) => {
        expect(credentialEmailsEta(count)).toBe(expected);
    });
});
