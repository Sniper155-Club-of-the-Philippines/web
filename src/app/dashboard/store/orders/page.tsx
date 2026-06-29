'use client';

import { adminOrder, batch } from '@/api';
import { AdminPage } from '@/components/admin/AdminPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MultiSelect from '@/components/base/inputs/MultiSelect';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { useHttp } from '@/hooks/http';
import { apiError } from '@/lib/api-error';
import { formatPesos } from '@/lib/money';
import { saveAs } from 'file-saver';
import {
    areAllVisibleOrdersSelected,
    isOrderStatus,
    orderStatusLabel,
    orderStatuses,
    paymentStatusLabel,
    paymentStatusVariant,
    retainVisibleOrderSelection,
    toggleVisibleOrderSelection,
} from '@/lib/order';
import type { Order, OrderStatus, PaymentStatus } from '@/types/models/order';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

const paymentFilters: { value: PaymentStatus; label: string }[] = [
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'proof_submitted', label: 'Awaiting verification' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

const ALL = 'all';

export default function AdminOrdersPage() {
    const http = useHttp();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<string>(ALL);
    const [orderStatus, setOrderStatus] = useState<string>(ALL);
    const [batchId, setBatchId] = useState<string>(ALL);
    const [chapterIds, setChapterIds] = useState<string[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [bulkStatus, setBulkStatus] = useState<OrderStatus | ''>('');

    const ordersQuery = useQuery({
        queryKey: ['admin-orders'],
        queryFn: () => adminOrder.list(http),
    });
    const batchesQuery = useQuery({
        queryKey: ['batches'],
        queryFn: () => batch.all(http),
    });

    const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
    // Only active batches in the filter so it does not get cluttered with
    // long-closed ordering periods.
    const activeBatches = (batchesQuery.data ?? []).filter((b) => b.is_active);

    // Chapters are derived from the loaded orders so managers can bulk-update a
    // chapter or group of chapters without another request.
    const chapterOptions = useMemo(() => {
        const seen = new Map<string, string>();
        for (const order of orders) {
            const chapter = order.user?.chapter;
            if (chapter) seen.set(chapter.id, chapter.name);
        }
        return [...seen.entries()]
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [orders]);

    // Client-side fuzzy search keeps the order list to a single API request.
    const fuse = useMemo(
        () =>
            new Fuse(orders, {
                keys: [
                    'order_number',
                    'user.first_name',
                    'user.last_name',
                    'user.club_number',
                    'items.recipient_nickname',
                ],
                threshold: 0.3,
                ignoreLocation: true,
            }),
        [orders],
    );

    const visible = useMemo(() => {
        const matched = search.trim()
            ? fuse.search(search).map((result) => result.item)
            : orders;

        return matched.filter(
            (order) =>
                (paymentStatus === ALL ||
                    order.payment_status === paymentStatus) &&
                (orderStatus === ALL || order.order_status === orderStatus) &&
                (batchId === ALL || order.batch_id === batchId) &&
                (chapterIds.length === 0 ||
                    (typeof order.user?.chapter_id === 'string' &&
                        chapterIds.includes(order.user.chapter_id))),
        );
    }, [orders, fuse, search, paymentStatus, orderStatus, batchId, chapterIds]);

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] });

    const visibleIds = useMemo(
        () => visible.map((order) => order.id),
        [visible],
    );

    useEffect(() => {
        setSelected((current) =>
            retainVisibleOrderSelection(visibleIds, current),
        );
    }, [visibleIds]);

    const bulk = useMutation({
        mutationFn: (status: OrderStatus) =>
            adminOrder.bulkStatus(http, selected, status),
        onSuccess: async (changed) => {
            await invalidate();
            setSelected([]);
            toast.success(
                `Updated ${changed} order${changed === 1 ? '' : 's'}`,
            );
        },
        onError: (error) =>
            toast.error(apiError(error, 'Could not update orders')),
    });

    const voidOrder = useMutation({
        mutationFn: (id: string) => adminOrder.voidOrder(http, id),
        onSuccess: async () => {
            await invalidate();
            toast.success('Order voided');
        },
        onError: (error) =>
            toast.error(apiError(error, 'Could not void order')),
    });

    const allChecked = areAllVisibleOrdersSelected(visibleIds, selected);
    const toggleAll = () => {
        setSelected((current) =>
            toggleVisibleOrderSelection(visibleIds, current),
        );
    };
    const toggleOne = (id: string) => {
        setSelected((current) =>
            current.includes(id)
                ? current.filter((value) => value !== id)
                : [...current, id],
        );
    };
    const columns: ColumnDef<Order>[] = [
        {
            id: 'selected',
            header: () => (
                <Checkbox
                    checked={allChecked}
                    onCheckedChange={toggleAll}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selected.includes(row.original.id)}
                    onCheckedChange={() => {
                        toggleOne(row.original.id);
                    }}
                    aria-label={`Select ${row.original.order_number}`}
                />
            ),
        },
        {
            header: 'Order',
            accessorKey: 'order_number',
            cell: ({ row }) => (
                <div className='font-medium'>
                    {row.original.order_number}
                    <span className='block text-xs font-normal text-muted-foreground'>
                        {orderStatusLabel(row.original.order_status)}
                    </span>
                </div>
            ),
        },
        {
            header: 'Member',
            accessorFn: (order) =>
                order.user
                    ? `${order.user.first_name} ${order.user.last_name}`
                    : '—',
            cell: ({ row }) => (
                <div>
                    {row.original.user
                        ? `${row.original.user.first_name} ${row.original.user.last_name}`
                        : '—'}
                    {row.original.user?.club_number && (
                        <span className='block text-xs text-muted-foreground'>
                            {row.original.user.club_number}
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Total',
            accessorKey: 'subtotal',
            cell: ({ row }) => formatPesos(row.original.subtotal),
        },
        {
            header: 'Payment',
            accessorKey: 'payment_status',
            cell: ({ row }) => (
                <Badge
                    variant={paymentStatusVariant(row.original.payment_status)}
                >
                    {paymentStatusLabel(row.original.payment_status)}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => <div className='text-right'>Actions</div>,
            cell: ({ row }) => (
                <div className='flex justify-end gap-2'>
                    <Button asChild size='sm' variant='outline'>
                        <Link
                            href={`/dashboard/store/orders/${row.original.id}`}
                        >
                            Review
                        </Link>
                    </Button>
                    <Button
                        size='sm'
                        variant='ghost'
                        disabled={Boolean(row.original.voided_at)}
                        onClick={() => {
                            voidOrder.mutate(row.original.id);
                        }}
                    >
                        Void
                    </Button>
                </div>
            ),
        },
    ];

    // The spreadsheet is built server-side so it matches the batch export
    // exactly (Summary + one sheet per product). We send the ids currently in
    // view so the export honours the active filters; the backend further limits
    // it to approved, non-voided orders.
    const exportOrders = useMutation({
        mutationFn: () =>
            adminOrder.exportOrders(
                http,
                visible.map((order) => order.id),
            ),
        onSuccess: (blob) => {
            saveAs(blob, 'orders.xlsx');
        },
        onError: (error) =>
            toast.error(apiError(error, 'Could not export orders')),
    });

    return (
        <AdminPage
            title='Orders'
            description='Search, review, and update member orders.'
            action={
                <Button
                    variant='outline'
                    disabled={visible.length === 0 || exportOrders.isPending}
                    onClick={() => {
                        exportOrders.mutate();
                    }}
                >
                    {exportOrders.isPending ? 'Exporting…' : 'Export Excel'}
                </Button>
            }
        >
            <div className='flex flex-col gap-3'>
                <div className='grid gap-2 grid-cols-2 lg:grid-cols-4 md:flex'>
                    <Input
                        placeholder='Search order #, member, nickname…'
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                        }}
                        className='w-full md:w-96'
                    />
                    <Select
                        value={paymentStatus}
                        onValueChange={setPaymentStatus}
                    >
                        <SelectTrigger className='w-full md:w-48'>
                            <SelectValue placeholder='Payment' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All payments</SelectItem>
                            {paymentFilters.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={orderStatus} onValueChange={setOrderStatus}>
                        <SelectTrigger className='w-full md:w-48'>
                            <SelectValue placeholder='Status' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All statuses</SelectItem>
                            {orderStatuses.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={batchId} onValueChange={setBatchId}>
                        <SelectTrigger className='w-full md:w-48'>
                            <SelectValue placeholder='Batch' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>
                                All active batches
                            </SelectItem>
                            {activeBatches.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {chapterOptions.length > 0 && (
                        <div className='w-full md:w-56'>
                            <MultiSelect
                                value={chapterIds}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setChapterIds(
                                        Array.isArray(value) ? value : [value],
                                    );
                                }}
                                options={chapterOptions}
                                placeholder='All chapters'
                            />
                        </div>
                    )}
                </div>

                {selected.length > 0 && (
                    <div className='flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 p-2'>
                        <span className='text-sm text-muted-foreground'>
                            {selected.length} selected
                        </span>
                        <Select
                            value={bulkStatus}
                            onValueChange={(value) => {
                                if (isOrderStatus(value)) {
                                    setBulkStatus(value);
                                }
                            }}
                        >
                            <SelectTrigger className='w-56'>
                                <SelectValue placeholder='Set status to…' />
                            </SelectTrigger>
                            <SelectContent>
                                {orderStatuses.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            size='sm'
                            disabled={!bulkStatus || bulk.isPending}
                            onClick={() => {
                                if (bulkStatus) {
                                    bulk.mutate(bulkStatus);
                                }
                            }}
                        >
                            Apply
                        </Button>
                        <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => {
                                setSelected([]);
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                )}

                <DataTable
                    columns={columns}
                    data={visible}
                    isLoading={ordersQuery.isLoading}
                    emptyMessage='No orders match these filters.'
                    rowHeight={64}
                />
            </div>
        </AdminPage>
    );
}
