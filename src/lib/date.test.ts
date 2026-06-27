import { describe, expect, it } from 'vitest';
import { parseTime } from './date';

describe('parseTime', () => {
    it('parses a full ISO datetime', () => {
        const result = parseTime('2025-05-01T14:30:00');
        expect(result).toBeInstanceOf(Date);
        expect(result?.getFullYear()).toBe(2025);
    });

    it('parses an HH:mm time string', () => {
        const result = parseTime('09:45');
        expect(result).toBeInstanceOf(Date);
        expect(result?.getHours()).toBe(9);
        expect(result?.getMinutes()).toBe(45);
    });

    it('returns undefined for an unparseable value', () => {
        expect(parseTime('not-a-time')).toBeUndefined();
    });
});
