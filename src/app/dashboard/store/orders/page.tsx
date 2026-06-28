'use client';

import { adminOrder } from '@/api';
import { AdminPage, TableEmpty, TableLoading } from '@/components/admin/AdminPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useHttp } from '@/hooks/http';
import { apiError } from '@/lib/api-error';
import { formatPesos } from '@/lib/money';
import {
    orderStatusLabel,
    orderStatuses,
    paymentStatusLabel,
    paymentStatusVariant,
} from '@/lib/order';
import type { OrderStatus, PaymentStatus } from '@/types/models/order';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

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
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<string[]>([]);
    const [bulkStatus, setBulkStatus] = useState<string>('');

    const params = useMemo(
        () => ({
            page,
            search: search || undefined,
            payment_status:
                paymentStatus === ALL ? undefined : (paymentStatus as PaymentStatus),
            order_status:
                orderStatus === ALL ? undefined : (orderStatus as OrderStatus),
        }),
        [page, search, paymentStatus, orderStatus],
    );

    const query = useQuery({
        queryKey: ['admin-orders', params],
        queryFn: () => adminOrder.list(http, params),
    });

    const orders = query.data?.data ?? [];

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] });

    const bulk = useMutation({
        mutationFn: () =>
            adminOrder.bulkStatus(http, selected, bulkStatus as OrderStatus),
        onSuccess: async (changed) => {
            await invalidate();
            setSelected([]);
            toast.success(`Updated ${changed} order${changed === 1 ? '' : 's'}`);
        },
        onError: (error) => toast.error(apiError(error, 'Could not update orders')),
    });

    const voidOrder = useMutation({
        mutationFn: (id: string) => adminOrder.voidOrder(http, id),
        onSuccess: async () => {
            await invalidate();
            toast.success('Order voided');
        },
        onError: (error) => toast.error(apiError(error, 'Could not void order')),
    });

    const allChecked = orders.length > 0 && selected.length === orders.length;
    const toggleAll = () =>
        setSelected(allChecked ? [] : orders.map((order) => order.id));
    const toggleOne = (id: string) =>
        setSelected((current) =>
            current.includes(id)
                ? current.filter((value) => value !== id)
                : [...current, id],
        );

    return (
        <AdminPage
            title='Orders'
            description='Filter, review, and progress member orders through fulfillment.'
        >
            <div className='flex flex-wrap items-center gap-3'>
                <Input
                    placeholder='Search order, member, or nickname'
                    value={search}
                    onChange={(event) => {
                        setPage(1);
                        setSearch(event.target.value);
                    }}
                    className='max-w-xs'
                />
                <Select
                    value={paymentStatus}
                    onValueChange={(value) => {
                        setPage(1);
                        setPaymentStatus(value);
                    }}
                >
                    <SelectTrigger className='w-52'>
                        <SelectValue placeholder='Payment status' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>All payments</SelectItem>
                        {paymentFilters.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={orderStatus}
                    onValueChange={(value) => {
                        setPage(1);
                        setOrderStatus(value);
                    }}
                >
                    <SelectTrigger className='w-52'>
                        <SelectValue placeholder='Fulfillment status' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>All statuses</SelectItem>
                        {orderStatuses.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selected.length > 0 && (
                <div className='bg-muted flex flex-wrap items-center gap-3 rounded-lg border p-3'>
                    <span className='text-sm font-medium'>
                        {selected.length} selected
                    </span>
                    <Select value={bulkStatus} onValueChange={setBulkStatus}>
                        <SelectTrigger className='w-52'>
                            <SelectValue placeholder='Set status to…' />
                        </SelectTrigger>
                        <SelectContent>
                            {orderStatuses.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        size='sm'
                        disabled={!bulkStatus || bulk.isPending}
                        onClick={() => bulk.mutate()}
                    >
                        Apply
                    </Button>
                </div>
            )}

            <div className='overflow-x-auto rounded-lg border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-10'>
                                <Checkbox
                                    checked={allChecked}
                                    onCheckedChange={toggleAll}
                                    aria-label='Select all'
                                />
                            </TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Member</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Fulfillment</TableHead>
                            <TableHead className='text-right'>Total</TableHead>
                            <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {query.isLoading ? (
                            <TableLoading columns={7} />
                        ) : orders.length === 0 ? (
                            <TableEmpty columns={7} message='No orders match your filters.' />
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selected.includes(order.id)}
                                            onCheckedChange={() => toggleOne(order.id)}
                                            aria-label={`Select ${order.order_number}`}
                                        />
                                    </TableCell>
                                    <TableCell className='font-medium'>
                                        {order.order_number}
                                    </TableCell>
                                    <TableCell className='text-muted-foreground'>
                                        {order.user
                                            ? `${order.user.first_name} ${order.user.last_name}`
                                            : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={paymentStatusVariant(
                                                order.payment_status,
                                            )}
                                        >
                                            {paymentStatusLabel(order.payment_status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className='text-muted-foreground'>
                                        {orderStatusLabel(order.order_status)}
                                    </TableCell>
                                    <TableCell className='text-right font-medium'>
                                        {formatPesos(order.subtotal)}
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <div className='flex justify-end gap-2'>
                                            <Button asChild size='sm' variant='outline'>
                                                <Link
                                                    href={`/dashboard/store/orders/${order.id}`}
                                                >
                                                    Review
                                                </Link>
                                            </Button>
                                            {!order.voided_at && (
                                                <Button
                                                    size='sm'
                                                    variant='ghost'
                                                    onClick={() =>
                                                        voidOrder.mutate(order.id)
                                                    }
                                                    disabled={voidOrder.isPending}
                                                >
                                                    Void
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className='flex items-center justify-between'>
                <span className='text-muted-foreground text-sm'>
                    {query.data?.total ?? 0} orders
                </span>
                <div className='flex items-center gap-2'>
                    <Button
                        size='sm'
                        variant='outline'
                        disabled={page <= 1}
                        onClick={() => setPage((value) => value - 1)}
                    >
                        Previous
                    </Button>
                    <span className='text-sm'>
                        Page {query.data?.current_page ?? 1} of{' '}
                        {query.data?.last_page ?? 1}
                    </span>
                    <Button
                        size='sm'
                        variant='outline'
                        disabled={page >= (query.data?.last_page ?? 1)}
                        onClick={() => setPage((value) => value + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </AdminPage>
    );
}
