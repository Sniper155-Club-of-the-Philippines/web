import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ColumnDef } from '@tanstack/react-table';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataTable } from './data-table';

interface RowData {
    id: string;
    name: string;
}

const rows = Array.from({ length: 100 }, (_, index) => ({
    id: String(index),
    name: `Row ${index + 1}`,
}));

function mockViewportSize() {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(240);
}

describe('DataTable', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('virtualizes rows against the ScrollArea viewport', async () => {
        const renderCell = vi.fn(
            ({ row }: { row: { original: RowData } }) => row.original.name,
        );
        const columns: ColumnDef<RowData>[] = [
            {
                accessorKey: 'name',
                header: 'Name',
                cell: renderCell,
            },
        ];
        mockViewportSize();

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

        const initialCellRenders = renderCell.mock.calls.length;

        viewport.scrollTop = 48;
        fireEvent.scroll(viewport);

        await waitFor(() => {
            expect(renderCell.mock.calls.length).toBeGreaterThan(
                initialCellRenders,
            );
        });
        expect(renderCell.mock.calls.length - initialCellRenders).toBeLessThan(
            3,
        );

        viewport.scrollTop = 48 * 50;
        fireEvent.scroll(viewport);

        await waitFor(() => {
            expect(screen.getByText('Row 51')).toBeInTheDocument();
        });
        expect(screen.queryByText('Row 1')).not.toBeInTheDocument();
    });

    it('refreshes memoized cells when column closures change', async () => {
        mockViewportSize();
        const firstColumns: ColumnDef<RowData>[] = [
            { header: 'Name', cell: () => 'First value' },
        ];
        const secondColumns: ColumnDef<RowData>[] = [
            { header: 'Name', cell: () => 'Updated value' },
        ];
        const { rerender } = render(
            <DataTable columns={firstColumns} data={[rows[0]]} />,
        );

        expect(await screen.findByText('First value')).toBeInTheDocument();

        rerender(<DataTable columns={secondColumns} data={[rows[0]]} />);

        expect(await screen.findByText('Updated value')).toBeInTheDocument();
    });

    it('owns loading and empty table states', () => {
        mockViewportSize();
        const columns: ColumnDef<RowData>[] = [
            { accessorKey: 'name', header: 'Name' },
        ];
        const { rerender } = render(
            <DataTable columns={columns} data={[]} isLoading />,
        );

        expect(screen.getByText('Loading…')).toBeInTheDocument();

        rerender(
            <DataTable
                columns={columns}
                data={[]}
                emptyMessage='Nothing here.'
            />,
        );

        expect(screen.getByText('Nothing here.')).toBeInTheDocument();
    });

    it('keeps table edges flush and header controls column-aligned', async () => {
        mockViewportSize();
        const columns: ColumnDef<RowData>[] = [
            {
                id: 'selected',
                header: () => (
                    <button type='button' aria-label='Select all rows' />
                ),
                cell: () => (
                    <button type='button' aria-label='Select this row' />
                ),
            },
            { accessorKey: 'name', header: 'Name' },
        ];
        const { container } = render(
            <DataTable columns={columns} data={[rows[0]]} />,
        );

        const viewport = container.querySelector(
            '[data-slot="scroll-area-viewport"]',
        );
        const root = container.querySelector('[data-slot="scroll-area"]');
        const headerControl = screen.getByRole('button', {
            name: 'Select all rows',
        });
        const rowControl = await screen.findByRole('button', {
            name: 'Select this row',
        });

        expect(viewport).not.toHaveClass('px-5');
        expect(root).toHaveStyle({ height: '90px' });
        expect(headerControl.parentElement).toHaveAttribute(
            'data-slot',
            'table-head',
        );
        expect(rowControl.parentElement).toHaveAttribute(
            'data-slot',
            'table-cell',
        );
    });

    it('does not mount a vertical scrollbar for rounding-only overflow', async () => {
        mockViewportSize();
        vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(
            184,
        );
        vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(
            185,
        );
        const columns: ColumnDef<RowData>[] = [
            { accessorKey: 'name', header: 'Name' },
        ];
        const { container } = render(
            <DataTable columns={columns} data={rows.slice(0, 3)} />,
        );

        await screen.findByText('Row 1');

        expect(
            container.querySelector(
                '[data-slot="scroll-area-scrollbar"][data-orientation="vertical"]',
            ),
        ).not.toBeInTheDocument();
    });
});
