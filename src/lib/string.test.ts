import { describe, expect, it } from 'vitest';
import { ulid } from 'ulid';
import { isValidULID, randomString } from './string';

describe('randomString', () => {
    it('defaults to length 10', () => {
        expect(randomString()).toHaveLength(10);
    });

    it('honours the requested length', () => {
        expect(randomString(20)).toHaveLength(20);
        expect(randomString(0)).toHaveLength(0);
    });

    it('only uses the alphanumeric alphabet', () => {
        expect(randomString(200)).toMatch(/^[A-Za-z0-9]+$/);
    });
});

describe('isValidULID', () => {
    it('accepts a real ulid', () => {
        expect(isValidULID(ulid())).toBe(true);
    });

    it('rejects garbage', () => {
        expect(isValidULID('not-a-ulid')).toBe(false);
        expect(isValidULID('')).toBe(false);
    });
});
