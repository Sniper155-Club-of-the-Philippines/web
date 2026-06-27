/**
 * Number of days an OBR nickname is locked after a change. Mirrors the
 * server-side rule (the API is the source of truth; this is for UX messaging).
 */
export const OBR_LOCK_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

export type ObrLockState = {
    /** Whether the OBR nickname is currently locked from changes. */
    locked: boolean;
    /** Whole days until it unlocks (0 when not locked). */
    daysRemaining: number;
    /** When it unlocks, or null if it has never been set. */
    unlockAt: Date | null;
};

/**
 * Compute the OBR-nickname lock state from the last change timestamp.
 *
 * Never set (null/undefined) → unlocked and free to set. Otherwise it unlocks
 * 90 days after the last change; before then it is locked with the whole number
 * of days remaining (rounded up).
 */
export function obrNicknameLock(
    changedAt: string | Date | null | undefined,
    now: Date = new Date(),
): ObrLockState {
    if (!changedAt) {
        return { locked: false, daysRemaining: 0, unlockAt: null };
    }

    const changed = changedAt instanceof Date ? changedAt : new Date(changedAt);
    const unlockAt = new Date(changed.getTime() + OBR_LOCK_DAYS * DAY_MS);
    const remainingMs = unlockAt.getTime() - now.getTime();

    if (remainingMs <= 0) {
        return { locked: false, daysRemaining: 0, unlockAt };
    }

    return {
        locked: true,
        daysRemaining: Math.ceil(remainingMs / DAY_MS),
        unlockAt,
    };
}
