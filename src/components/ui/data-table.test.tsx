import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ColumnDef } from '@tanstack/react-table';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataTable } from './data-table';

interface RowData {
    id: string;
    name: string;
}

const columns: ColumnDef<RowData>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
];

const rows = Array.from({ length: 100 }, (_, index) => ({
    id: String(index),
    name: `Row ${index + 1}`,
}));

describe('DataTable', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('virtualizes rows against the ScrollArea viewport', async () => {
        vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(
            800,
        );
        vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(
            240,
        );

        const { container } = render(
            <DataTable columns={columns} data={rows} />,
        );

        const viewport = container.querySelector<HTMLElement>(
            '[data-slot="scroll-area-viewport"]',
        );

        expect(viewport).toBeInTheDocument();
        expect(await screen.findByText('Row 1')).toBeInTheDocument();
        expect(screen.queryByText('Row 100')).not.toBeInTheDocument();
        expect(screen.getAllByRole('row').length).toBeLessThan(rows.length);

        if (!viewport) {
            throw new Error('ScrollArea viewport not found.');
        }

        viewport.scrollTop = 48 * 50;
        fireEvent.scroll(viewport);

        await waitFor(() => {
            expect(screen.getByText('Row 51')).toBeInTheDocument();
        });
        expect(screen.queryByText('Row 1')).not.toBeInTheDocument();
    });
});
