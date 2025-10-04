import { decodeTime } from 'ulid';

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

export function isValidULID(ulid: string) {
    try {
        decodeTime(ulid);
        return true;
    } catch {
        return false;
    }
}
