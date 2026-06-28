import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Profile } from '@/types/models/profile';
import { VCard } from '@scr2em/vcard';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ExportColumn<T> {
    header?: unknown;
    accessorKey?: PropertyKey;
    accessorFn?: (row: T, index: number) => unknown;
}

export function exportToExcel<T>(
    columnDefs: readonly ExportColumn<T>[],
    data: T[],
    fileName = 'data.xlsx',
) {
    const columns = columnDefs.filter(
        (item) =>
            typeof item.header === 'string' &&
            (item.accessorKey !== undefined || item.accessorFn !== undefined),
    );

    // Map data to use headers as keys
    const processed: Record<string, unknown>[] = data.map((item, index) => {
        const row: Record<string, unknown> = {};
        columns.forEach((col) => {
            const header = String(col.header);
            if (col.accessorFn) {
                row[header] = col.accessorFn(item, index);
            } else if (col.accessorKey !== undefined) {
                row[header] = Reflect.get(Object(item), col.accessorKey);
            }
        });
        return row;
    });

    // Convert JSON data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(processed);

    // Create a new workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate Excel buffer
    const excelBuffer: unknown = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
    });

    if (!(excelBuffer instanceof ArrayBuffer)) {
        throw new TypeError('Excel export did not produce an ArrayBuffer.');
    }

    // Save the file
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
}

export async function urlToFile(
    url: string,
    filename?: string,
    mimeType?: string,
): Promise<File> {
    const response = await fetch(url);

    // Try to infer filename from Content-Disposition header
    if (!filename) {
        const contentDisposition = response.headers.get('Content-Disposition');
        const match = contentDisposition?.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i,
        );
        if (match?.[1]) {
            filename = match[1].replace(/['"]/g, ''); // strip quotes
        } else {
            // fallback: take from URL path
            filename = url.split('/').pop() || 'download';
        }
    }

    const blob = await response.blob();
    return new File([blob], filename, { type: mimeType ?? blob.type });
}

export function searchArray<T>(
    items: T[] | undefined,
    search: string,
    keys: readonly (keyof T)[],
) {
    if (!items) return [];
    if (!search) return items;

    const lower = search.toLowerCase();

    return items.filter((item) =>
        keys.some((key) => {
            const value = item[key];
            if (value === null) return false;
            return String(value).toLowerCase().includes(lower);
        }),
    );
}

export function createVcard(profile?: Profile | null) {
    if (!profile?.user) {
        return null;
    }

    const user = profile.user;

    const card = new VCard()
        .setName(user.first_name, user.last_name)
        .setOrganization('Sniper 155 Club of the Philippines Inc.')
        .addUrl({
            label: 'Profile',
            value: profile.url,
            type: 'home',
        })
        .addEmail({
            label: 'Email',
            value: user.email,
            type: 'home',
        });

    if (user.designation) {
        card.setJobTitle(user.designation);
    }

    if (user.phone) {
        card.addPhone({
            label: 'Phone',
            type: 'cell',
            value: user.phone,
        });
    }

    return card;
}
