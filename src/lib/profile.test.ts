import { describe, expect, it } from 'vitest';
import { OBR_LOCK_DAYS, obrNicknameLock } from './profile';

const DAY = 24 * 60 * 60 * 1000;

describe('obrNicknameLock', () => {
    it('is unlocked and free when never set', () => {
        expect(obrNicknameLock(null)).toEqual({
            locked: false,
            daysRemaining: 0,
            unlockAt: null,
        });
        expect(obrNicknameLock(undefined).locked).toBe(false);
    });

    it('is locked within the 90-day window with days remaining rounded up', () => {
        const now = new Date('2026-06-27T00:00:00Z');
        const changedAt = new Date(now.getTime() - 10 * DAY).toISOString();

        const state = obrNicknameLock(changedAt, now);

        expect(state.locked).toBe(true);
        expect(state.daysRemaining).toBe(OBR_LOCK_DAYS - 10);
        expect(state.unlockAt).toBeInstanceOf(Date);
    });

    it('rounds partial days up', () => {
        const now = new Date('2026-06-27T00:00:00Z');
        // 89.5 days ago -> 0.5 days remaining -> rounds to 1
        const changedAt = new Date(now.getTime() - 89.5 * DAY);

        expect(obrNicknameLock(changedAt, now).daysRemaining).toBe(1);
    });

    it('unlocks exactly at and after the window', () => {
        const now = new Date('2026-06-27T00:00:00Z');
        const changedAt = new Date(now.getTime() - OBR_LOCK_DAYS * DAY);

        const state = obrNicknameLock(changedAt, now);
        expect(state.locked).toBe(false);
        expect(state.daysRemaining).toBe(0);
        expect(state.unlockAt).toBeInstanceOf(Date);
    });

    it('accepts a Date instance as well as a string', () => {
        const now = new Date('2026-06-27T00:00:00Z');
        const changedAt = new Date(now.getTime() - 5 * DAY);

        expect(obrNicknameLock(changedAt, now).daysRemaining).toBe(85);
    });
});
