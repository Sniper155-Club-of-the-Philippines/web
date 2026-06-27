import { afterEach, describe, expect, it, vi } from 'vitest';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
    cn,
    createVcard,
    exportToExcel,
    searchArray,
    urlToFile,
} from './utils';
import type { Profile } from '@/types/models/profile';

vi.mock('file-saver', () => ({ saveAs: vi.fn() }));

afterEach(() => vi.restoreAllMocks());

describe('cn', () => {
    it('merges and dedupes tailwind classes', () => {
        expect(cn('px-2', 'px-4')).toBe('px-4');
        expect(cn('text-sm', false && 'hidden', 'font-bold')).toBe(
            'text-sm font-bold',
        );
    });
});

describe('searchArray', () => {
    const items = [
        { name: 'Alice', city: 'Manila' },
        { name: 'Bob', city: 'Cebu' },
        { name: 'Carol', city: null },
    ];

    it('returns [] for undefined input', () => {
        expect(searchArray(undefined, 'x', ['name'])).toEqual([]);
    });

    it('returns all items when search is empty', () => {
        expect(searchArray(items, '', ['name'])).toBe(items);
    });

    it('matches case-insensitively across keys', () => {
        expect(searchArray(items, 'man', ['city'])).toHaveLength(1);
        expect(searchArray(items, 'bob', ['name'])).toEqual([items[1]]);
    });

    it('skips null values without throwing', () => {
        expect(searchArray(items, 'manila', ['name', 'city'])).toEqual([
            items[0],
        ]);
    });
});

describe('createVcard', () => {
    const profile = {
        url: 'https://example.com/profile/1',
        user: {
            first_name: 'Juan',
            last_name: 'Dela Cruz',
            email: 'juan@example.com',
            designation: 'Official Member',
            phone: '09171234567',
        },
    } as unknown as Profile;

    it('returns null without a user', () => {
        expect(createVcard(null)).toBeNull();
        expect(createVcard({ url: 'x' } as unknown as Profile)).toBeNull();
    });

    it('builds a vcard containing the user details', () => {
        const card = createVcard(profile);
        expect(card).not.toBeNull();
        const text = card!.toString();
        expect(text).toContain('Juan');
        expect(text).toContain('Dela Cruz');
        expect(text).toContain('juan@example.com');
    });

    it('omits optional job title and phone when absent', () => {
        const card = createVcard({
            url: 'https://example.com/p/2',
            user: {
                first_name: 'No',
                last_name: 'Extras',
                email: 'no@example.com',
            },
        } as unknown as Profile);
        expect(card).not.toBeNull();
    });
});

describe('exportToExcel', () => {
    it('maps rows by header using accessorKey and accessorFn, then saves', () => {
        const sheetSpy = vi.spyOn(XLSX.utils, 'json_to_sheet');

        const columns = [
            { header: 'Name', accessorKey: 'name' as const },
            {
                header: 'Upper',
                accessorKey: 'name' as const,
                accessorFn: (row: { name: string }) => row.name.toUpperCase(),
            },
            { header: 'NoKey' } as never, // filtered out (no key/fn)
        ];
        const data = [{ name: 'juan' }, { name: 'pedro' }];

        exportToExcel(columns as never, data, 'members.xlsx');

        expect(sheetSpy).toHaveBeenCalledWith([
            { Name: 'juan', Upper: 'JUAN' },
            { Name: 'pedro', Upper: 'PEDRO' },
        ]);
        expect(saveAs).toHaveBeenCalledOnce();
        expect(vi.mocked(saveAs).mock.calls[0][1]).toBe('members.xlsx');
    });

    it('defaults the file name', () => {
        exportToExcel(
            [{ header: 'Name', accessorKey: 'name' as const }] as never,
            [{ name: 'x' }],
        );
        expect(vi.mocked(saveAs).mock.calls.at(-1)?.[1]).toBe('data.xlsx');
    });
});

describe('urlToFile', () => {
    it('infers the filename from Content-Disposition', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            headers: {
                get: () => 'attachment; filename="report.pdf"',
            },
            blob: async () => new Blob(['x'], { type: 'application/pdf' }),
        }) as never;

        const file = await urlToFile('https://x/y');
        expect(file).toBeInstanceOf(File);
        expect(file.name).toBe('report.pdf');
    });

    it('falls back to the URL path segment', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            headers: { get: () => null },
            blob: async () => new Blob(['x'], { type: 'image/png' }),
        }) as never;

        const file = await urlToFile('https://x/path/avatar.png');
        expect(file.name).toBe('avatar.png');
        expect(file.type).toBe('image/png');
    });

    it('defaults to "download" when the URL has no trailing segment', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            headers: { get: () => null },
            blob: async () => new Blob(['x'], { type: 'image/png' }),
        }) as never;

        const file = await urlToFile('https://x/path/');
        expect(file.name).toBe('download');
    });

    it('uses an explicit filename and mime type', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            headers: { get: () => null },
            blob: async () => new Blob(['x'], { type: 'image/png' }),
        }) as never;

        const file = await urlToFile(
            'https://x/y',
            'custom.bin',
            'application/x-bin',
        );
        expect(file.name).toBe('custom.bin');
        expect(file.type).toBe('application/x-bin');
    });
});
