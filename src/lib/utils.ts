import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { AccessorKeyColumnDefBase } from '@tanstack/react-table';
import { KeyOf } from '@/types/object';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Type for a column with string header and accessorKey pointing to a key of T
type ColumnWithStringHeader<
    T,
    K extends keyof T
> = AccessorKeyColumnDefBase<T> & {
    header: string;
    accessorKey: K;
    accessorFn?: (row: T, index: number) => T[K];
};

export function exportToExcel<T, K extends keyof T>(
    columnDefs: ColumnWithStringHeader<T, K>[],
    data: T[],
    fileName = 'data.xlsx'
) {
    const columns = columnDefs.filter(
        (item) => item.accessorKey || item.accessorFn
    );

    // Map data to use headers as keys
    const processed: Record<string, T[K]>[] = data.map((item, index) => {
        const row: Record<string, T[K]> = {};
        columns.forEach((col) => {
            if (col.accessorFn) {
                row[col.header] = col.accessorFn(item, index);
            } else {
                row[col.header] = item[col.accessorKey];
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
    const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
    });

    // Save the file
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
}

export async function urlToFile(
    url: string,
    filename?: string,
    mimeType?: string
): Promise<File> {
    const response = await fetch(url);

    // Try to infer filename from Content-Disposition header
    if (!filename) {
        const contentDisposition = response.headers.get('Content-Disposition');
        const match = contentDisposition?.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i
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
    keys: KeyOf<T>[]
) {
    if (!items) return [];
    if (!search) return items;

    const lower = search.toLowerCase();

    return items.filter((item) =>
        keys.some((key) => {
            const value = item[key];
            if (value === null) return false;
            return String(value).toLowerCase().includes(lower);
        })
    );
}
