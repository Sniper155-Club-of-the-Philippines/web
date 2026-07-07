import { isValid } from 'ulid';

export function randomString(length: number = 10): string {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charsLength = chars.length;

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }

    return result;
}

/**
 * Turn a machine role name into a human label:
 * "content-manager" -> "Content Manager", "order_manager" -> "Order Manager".
 */
export function prettifyRole(role: string): string {
    return role
        .trim()
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
}

export function isValidULID(ulid: string) {
    return isValid(ulid);
}
