import type { User } from '@/types/models/user';

/**
 * Mirrors the API backfill: the shared host allows 200 outgoing emails per
 * hour, so credential emails go out one every 30 seconds, and the queue
 * worker only starts every 5 minutes.
 */
export const CREDENTIAL_EMAIL_SPACING_SECONDS = 30;
export const QUEUE_START_MINUTES = 5;

/** Members who have never received a username and password. */
export function membersWithoutAccount(users: User[]): User[] {
    return users.filter((user) => user.has_password === false);
}

/**
 * Rough time until the last credential email of a backfill is sent, e.g.
 * "about 1 hour 35 minutes".
 */
export function credentialEmailsEta(count: number): string {
    const minutes =
        QUEUE_START_MINUTES +
        Math.ceil(
            (Math.max(count - 1, 0) * CREDENTIAL_EMAIL_SPACING_SECONDS) / 60,
        );
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    const parts = [
        hours > 0 && `${hours} ${hours === 1 ? 'hour' : 'hours'}`,
        rest > 0 && `${rest} ${rest === 1 ? 'minute' : 'minutes'}`,
    ].filter(Boolean);

    return `about ${parts.join(' ')}`;
}
