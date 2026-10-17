import { describe, expect, it } from 'vitest';
import {
    formatUnlockDate,
    OBR_LOCK_MONTHS,
    profileLock,
    RIDER_LOCK_MONTHS,
} from './profile';

describe('profileLock', () => {
    it('is unlocked when the group was never changed', () => {
        expect(profileLock(null, OBR_LOCK_MONTHS)).toEqual({
            locked: false,
            unlockAt: null,
        });
        expect(profileLock(undefined, RIDER_LOCK_MONTHS).locked).toBe(false);
    });

    it('locks the rider nickname for two calendar months', () => {
        const changedAt = '2026-09-30T09:00:00';

        expect(
            profileLock(
                changedAt,
                RIDER_LOCK_MONTHS,
                new Date('2026-11-29T09:00:00'),
            ),
        ).toEqual({ locked: true, unlockAt: new Date('2026-11-30T09:00:00') });
        expect(
            profileLock(
                changedAt,
                RIDER_LOCK_MONTHS,
                new Date('2026-11-30T09:00:00'),
            ).locked,
        ).toBe(false);
    });

    it('clamps to the end of a shorter month like the API', () => {
        const state = profileLock(
            '2026-08-31T09:00:00',
            OBR_LOCK_MONTHS,
            new Date('2026-10-17T09:00:00'),
        );

        expect(state.unlockAt).toEqual(new Date('2026-11-30T09:00:00'));
        expect(state.locked).toBe(true);
    });
});

describe('formatUnlockDate', () => {
    it('formats the unlock date for members', () => {
        expect(formatUnlockDate(new Date('2026-11-30T09:00:00'))).toBe(
            'Nov 30, 2026',
        );
    });
});
