import dayjs from 'dayjs';

/**
 * Months a member's rider nickname, and their OBR details, stay locked after a
 * change. Mirrors the server-side rule (the API is the source of truth; this
 * is for UX messaging).
 */
export const RIDER_LOCK_MONTHS = 2;
export const OBR_LOCK_MONTHS = 3;

export type ProfileLockState = {
    /** Whether filled-in fields of the group are currently locked. */
    locked: boolean;
    /** When the lock runs out, or null if the group was never changed. */
    unlockAt: Date | null;
};

/**
 * Compute a lock group's state from its last change timestamp.
 *
 * Never changed (null/undefined) means unlocked. Otherwise it unlocks the
 * given number of calendar months after the last change. Empty fields can be
 * filled in either way; the lock only stops changing a value already set.
 */
export function profileLock(
    changedAt: string | Date | null | undefined,
    months: number,
    now: Date = new Date(),
): ProfileLockState {
    if (!changedAt) {
        return { locked: false, unlockAt: null };
    }

    const unlockAt = dayjs(changedAt).add(months, 'month').toDate();

    return { locked: now < unlockAt, unlockAt };
}

/** The date a lock runs out, as shown to members, e.g. "Nov 30, 2026". */
export function formatUnlockDate(unlockAt: Date): string {
    return dayjs(unlockAt).format('MMM D, YYYY');
}
