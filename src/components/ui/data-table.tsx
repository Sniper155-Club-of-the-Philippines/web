'use client';

import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import {
    ColumnDef,
    Row,
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface DataTableProps<TData extends { id?: unknown }, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    search?: string;
    tableRef?: React.Ref<DataTableRef>;
}

// The ref will expose the DOM scroll element and the virtualizer
export interface DataTableRef {
    scrollElement: HTMLDivElement | null;
    virtualizer: Virtualizer<HTMLDivElement, Element> | null;
}

const ROW_HEIGHT = 48;
const OVERSCAN = 4;

function VirtualizedTableRow<TData>({ row }: { row: Row<TData> }) {
    return (
        <TableRow style={{ height: ROW_HEIGHT }}>
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    );
}

const MemoizedTableRow = React.memo(VirtualizedTableRow);

export function DataTable<TData extends { id?: unknown }, TValue>({
    columns,
    data,
    search = '',
    tableRef,
}: DataTableProps<TData, TValue>) {
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: 'includesString',
        getRowId: (row, index) =>
            typeof row.id === 'string' ? row.id : String(index),
    });

    useEffect(() => {
        setGlobalFilter(search);
    }, [search]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Virtualizer
    const rows = table.getRowModel().rows;
    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => ROW_HEIGHT,
        getItemKey: (index) => rows[index].id,
        overscan: OVERSCAN,
    });

    // Expose scroll element + virtualizer to parent
    useImperativeHandle(tableRef, () => ({
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
        <ScrollArea
            viewportRef={scrollRef}
            className='relative h-[calc(100svh-20rem)] min-h-64 w-full md:h-[calc(100svh-11rem)]'
            viewportClassName='[contain:strict] px-5'
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
                                                  header.getContext(),
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
                        const row = rows[vr.index];
                        return <MemoizedTableRow key={row.id} row={row} />;
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
            <ScrollBar orientation='horizontal' />
        </ScrollArea>
    );
}
