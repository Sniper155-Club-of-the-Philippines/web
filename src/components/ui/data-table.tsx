'use client';

import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer, Virtualizer } from '@tanstack/react-virtual';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    search?: string;
}

// The ref will expose the DOM scroll element and the virtualizer
export interface DataTableRef {
    scrollElement: HTMLDivElement | null;
    virtualizer: Virtualizer<HTMLDivElement, Element> | null;
}

const ROW_HEIGHT = 48;

export const DataTable = React.forwardRef<
    DataTableRef,
    DataTableProps<any, any>
>(({ columns, data, search = '' }, ref) => {
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: 'includesString',
        getRowId: (row, index) => (typeof row.id === 'string' ? row.id : index),
    });

    useEffect(() => setGlobalFilter(search), [search]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Virtualizer
    const virtualizer = useVirtualizer({
        count: table.getRowModel().rows.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => ROW_HEIGHT,
        overscan: 10,
    });

    // Expose scroll element + virtualizer to parent
    useImperativeHandle(ref, () => ({
        scrollElement: scrollRef.current,
        virtualizer,
    }));

    const virtualRows = virtualizer.getVirtualItems();
    const totalSize = virtualizer.getTotalSize();
    const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
    const paddingBottom =
        virtualRows.length > 0
            ? totalSize - virtualRows[virtualRows.length - 1].end
            : 0;

    return (
        <div
            ref={scrollRef}
            className='relative w-full h-full max-h-[calc(100vh-320px)] md:max-h-[calc(100vh-160px)] px-5 overflow-auto'
        >
            <Table className='relative min-w-full'>
                {/* Sticky Header */}
                <TableHeader className='sticky top-0 z-20 bg-background w-full'>
                    {table.getHeaderGroups().map((hg) => (
                        <TableRow key={hg.id}>
                            {hg.headers.map((header) => (
                                <TableHead key={header.id}>
                                    <div className='px-3'>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>

                {/* Virtualized Body */}
                <TableBody>
                    {paddingTop > 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                style={{ height: paddingTop }}
                            />
                        </TableRow>
                    )}

                    {virtualRows.map((vr) => {
                        const row = table.getRowModel().rows[vr.index];
                        return (
                            <TableRow
                                key={row.id}
                                style={{ height: ROW_HEIGHT }}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        );
                    })}

                    {paddingBottom > 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                style={{ height: paddingBottom }}
                            />
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
});

DataTable.displayName = 'DataTable';
