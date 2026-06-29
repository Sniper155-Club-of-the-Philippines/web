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
import { cn } from '@/lib/utils';

interface DataTableProps<TData extends { id?: unknown }, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    search?: string;
    tableRef?: React.Ref<DataTableRef>;
    isLoading?: boolean;
    emptyMessage?: string;
    className?: string;
    rowHeight?: number;
}

// The ref will expose the DOM scroll element and the virtualizer
export interface DataTableRef {
    scrollElement: HTMLDivElement | null;
    virtualizer: Virtualizer<HTMLDivElement, Element> | null;
}

const DEFAULT_ROW_HEIGHT = 48;
const BORDER_HEIGHT = 2;
const OVERSCAN = 4;

function VirtualizedTableRow<TData>({
    row,
    rowHeight,
    renderVersion: _renderVersion,
}: {
    row: Row<TData>;
    rowHeight: number;
    renderVersion: object;
}) {
    return (
        <TableRow style={{ height: rowHeight }}>
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
    isLoading = false,
    emptyMessage = 'No results.',
    className,
    rowHeight = DEFAULT_ROW_HEIGHT,
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
        count: isLoading ? 0 : rows.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => rowHeight,
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
    const contentRows = isLoading || rows.length === 0 ? 2 : rows.length;
    const contentHeight = BORDER_HEIGHT + 40 + contentRows * rowHeight;

    return (
        <ScrollArea
            viewportRef={scrollRef}
            className={cn(
                'relative w-full max-h-[calc(100svh-20rem)] rounded-lg border md:max-h-[calc(100svh-11rem)]',
                className,
            )}
            viewportClassName='[contain:strict]'
            style={{ height: contentHeight }}
        >
            <Table className='relative min-w-full' aria-busy={isLoading}>
                {/* Sticky Header */}
                <TableHeader className='sticky top-0 z-20 bg-background w-full'>
                    {table.getHeaderGroups().map((hg) => (
                        <TableRow key={hg.id}>
                            {hg.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext(),
                                          )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>

                {/* Virtualized Body */}
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell
                                className='h-24 text-center text-muted-foreground'
                                colSpan={columns.length}
                            >
                                Loading…
                            </TableCell>
                        </TableRow>
                    ) : rows.length === 0 ? (
                        <TableRow>
                            <TableCell
                                className='h-24 text-center text-muted-foreground'
                                colSpan={columns.length}
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    ) : null}
                    {!isLoading && paddingTop > 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                style={{ height: paddingTop }}
                            />
                        </TableRow>
                    )}

                    {!isLoading &&
                        virtualRows.map((vr) => {
                            const row = rows[vr.index];
                            return (
                                <MemoizedTableRow
                                    key={row.id}
                                    row={row}
                                    rowHeight={rowHeight}
                                    renderVersion={columns}
                                />
                            );
                        })}

                    {!isLoading && paddingBottom > 0 && (
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
