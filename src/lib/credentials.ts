import type { User } from '@/types/models/user';

/**
 * Mirrors the API backfill: the shared host allows 200 outgoing emails per
 * hour, so credential emails are rate-limited to two a minute. The queue
 * worker starts every 5 minutes and runs for 4 of them.
 */
export const CREDENTIAL_EMAILS_PER_MINUTE = 2;
export const QUEUE_START_MINUTES = 5;
export const QUEUE_RUN_MINUTES = 4;

/** Members who have never received a username and password. */
export function membersWithoutAccount(users: User[]): User[] {
    return users.filter((user) => user.has_password === false);
}

/**
 * Rough time until the last credential email of a backfill is sent, e.g.
 * "about 1 hour 59 minutes".
 */
export function credentialEmailsEta(count: number): string {
    const minutes =
        QUEUE_START_MINUTES +
        Math.ceil(
            (count / CREDENTIAL_EMAILS_PER_MINUTE) *
                (QUEUE_START_MINUTES / QUEUE_RUN_MINUTES),
        );
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    const parts = [
        hours > 0 && `${hours} ${hours === 1 ? 'hour' : 'hours'}`,
        rest > 0 && `${rest} ${rest === 1 ? 'minute' : 'minutes'}`,
    ].filter(Boolean);

    return `about ${parts.join(' ')}`;
}
