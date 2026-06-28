'use client';

import { adminOrder, order as orderApi } from '@/api';
import { AdminPage } from '@/components/admin/AdminPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useHttp } from '@/hooks/http';
import { apiError } from '@/lib/api-error';
import { formatPesos } from '@/lib/money';
import {
    orderStatusLabel,
    orderStatuses,
    paymentStatusLabel,
    paymentStatusVariant,
} from '@/lib/order';
import type { OrderItemEdit } from '@/api/admin-order';
import type { OrderStatus } from '@/types/models/order';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import dayjs from 'dayjs';

export default function AdminOrderDetailPage() {
    const http = useHttp();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();

    const [rejectReason, setRejectReason] = useState('');
    const [status, setStatus] = useState<string>('');
    const [edits, setEdits] = useState<Record<string, OrderItemEdit>>({});
    const [proofUrl, setProofUrl] = useState<string | null>(null);

    const query = useQuery({
        queryKey: ['admin-order', id],
        queryFn: () => adminOrder.get(http, id),
    });
    const current = query.data;

    const refresh = async () => {
        await queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
        await queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    };

    const approve = useMutation({
        mutationFn: () => orderApi.approvePayment(http, id),
        onSuccess: async () => {
            await refresh();
            toast.success('Payment approved');
        },
        onError: (error) => toast.error(apiError(error, 'Could not approve')),
    });

    const reject = useMutation({
        mutationFn: () =>
            orderApi.rejectPayment(http, id, rejectReason || undefined),
        onSuccess: async () => {
            await refresh();
            setRejectReason('');
            toast.success('Payment rejected');
        },
        onError: (error) => toast.error(apiError(error, 'Could not reject')),
    });

    const setOrderStatus = useMutation({
        mutationFn: () =>
            adminOrder.updateStatus(http, id, status as OrderStatus),
        onSuccess: async () => {
            await refresh();
            toast.success('Status updated');
        },
        onError: (error) =>
            toast.error(apiError(error, 'Could not update status')),
    });

    const voidOrder = useMutation({
        mutationFn: () => adminOrder.voidOrder(http, id),
        onSuccess: async () => {
            await refresh();
            toast.success('Order voided');
        },
        onError: (error) => toast.error(apiError(error, 'Could not void')),
    });

    const saveLines = useMutation({
        mutationFn: () =>
            adminOrder.updateItems(http, id, Object.values(edits)),
        onSuccess: async () => {
            await refresh();
            setEdits({});
            toast.success('Lines updated');
        },
        onError: (error) =>
            toast.error(apiError(error, 'Could not update lines')),
    });

    const viewProof = async () => {
        try {
            const url = await orderApi.proofUrl(http, id);
            setProofUrl(url);
        } catch (error) {
            toast.error(apiError(error, 'No proof to view'));
        }
    };

    const editItem = (itemId: string, patch: Partial<OrderItemEdit>) =>
        setEdits((current) => ({
            ...current,
            [itemId]: { ...current[itemId], ...patch, id: itemId },
        }));

    if (query.isLoading || !current) {
        return (
            <AdminPage
                title='Order'
                description='Review and manage this order.'
            >
                <Skeleton className='h-64 w-full' />
            </AdminPage>
        );
    }

    const isRejectable =
        current.payment_status === 'proof_submitted' ||
        current.payment_status === 'approved';

    return (
        <AdminPage
            title={current.order_number}
            description={
                current.user
                    ? `${current.user.first_name} ${current.user.last_name}`
                    : 'Order detail'
            }
            action={
                <Button asChild variant='outline'>
                    <Link href='/dashboard/store/orders'>Back to orders</Link>
                </Button>
            }
        >
            <section className='flex flex-wrap items-center gap-3'>
                <Badge variant={paymentStatusVariant(current.payment_status)}>
                    {paymentStatusLabel(current.payment_status)}
                </Badge>
                <span className='text-muted-foreground text-sm'>
                    {orderStatusLabel(current.order_status)}
                </span>
                <span className='ml-auto text-lg font-semibold'>
                    {formatPesos(current.subtotal)}
                </span>
            </section>

            {/* Payment review */}
            <section className='bg-card flex flex-col gap-4 rounded-lg border p-5'>
                <h2 className='font-semibold'>Payment review</h2>
                <div className='flex flex-wrap items-center gap-3 text-sm'>
                    {current.payment_ref_no && (
                        <span>Ref: {current.payment_ref_no}</span>
                    )}
                    {current.paid_amount !== null && (
                        <span>Paid: {formatPesos(current.paid_amount)}</span>
                    )}
                    {current.proof_submitted_at && (
                        <Button size='sm' variant='outline' onClick={viewProof}>
                            View proof
                        </Button>
                    )}
                </div>
                <div className='flex flex-wrap gap-3'>
                    <Button
                        onClick={() => approve.mutate()}
                        disabled={
                            approve.isPending ||
                            current.payment_status === 'approved'
                        }
                    >
                        Approve payment
                    </Button>
                </div>
                {isRejectable && (
                    <div className='flex flex-col gap-2'>
                        <Textarea
                            placeholder='Reason (optional) shown to the member'
                            value={rejectReason}
                            onChange={(event) =>
                                setRejectReason(event.target.value)
                            }
                        />
                        <Button
                            variant='destructive'
                            className='w-fit'
                            onClick={() => reject.mutate()}
                            disabled={reject.isPending}
                        >
                            {current.payment_status === 'approved'
                                ? 'Revert and reject'
                                : 'Reject payment'}
                        </Button>
                    </div>
                )}
            </section>

            {/* Line items, editable */}
            <section className='bg-card flex flex-col gap-3 rounded-lg border p-5'>
                <h2 className='font-semibold'>Items</h2>
                <div className='flex flex-col gap-3'>
                    {(current.items ?? []).map((item) => (
                        <div
                            key={item.id}
                            className='grid items-center gap-2 sm:grid-cols-[1fr_5rem_6rem_auto]'
                        >
                            <span className='font-medium'>
                                {item.product_name}
                            </span>
                            <Input
                                defaultValue={item.size}
                                aria-label='Size'
                                onChange={(event) =>
                                    editItem(item.id, {
                                        size: event.target.value,
                                    })
                                }
                            />
                            <Input
                                type='number'
                                min={1}
                                defaultValue={item.quantity}
                                aria-label='Quantity'
                                onChange={(event) =>
                                    editItem(item.id, {
                                        quantity: Number(event.target.value),
                                    })
                                }
                            />
                            <Input
                                defaultValue={item.recipient_nickname}
                                aria-label='Recipient nickname'
                                onChange={(event) =>
                                    editItem(item.id, {
                                        recipient_nickname: event.target.value,
                                    })
                                }
                            />
                        </div>
                    ))}
                </div>
                <Button
                    className='w-fit'
                    variant='outline'
                    disabled={
                        Object.keys(edits).length === 0 || saveLines.isPending
                    }
                    onClick={() => saveLines.mutate()}
                >
                    Save line changes
                </Button>
            </section>

            {/* Status + void */}
            <section className='bg-card flex flex-wrap items-end gap-3 rounded-lg border p-5'>
                <div className='flex flex-col gap-2'>
                    <span className='text-sm font-medium'>
                        Fulfillment status
                    </span>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className='w-56'>
                            <SelectValue placeholder='Set status…' />
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
                </div>
                <Button
                    disabled={!status || setOrderStatus.isPending}
                    onClick={() => setOrderStatus.mutate()}
                >
                    Update status
                </Button>
                {!current.voided_at && (
                    <Button
                        variant='ghost'
                        className='ml-auto'
                        onClick={() => voidOrder.mutate()}
                        disabled={voidOrder.isPending}
                    >
                        Void order
                    </Button>
                )}
            </section>

            {current.histories && current.histories.length > 0 && (
                <section className='flex flex-col gap-3'>
                    <Separator />
                    <h2 className='font-semibold'>Timeline</h2>
                    <ol className='flex flex-col gap-3'>
                        {current.histories.map((entry) => (
                            <li key={entry.id} className='flex gap-3'>
                                <div className='bg-primary mt-1.5 size-2 shrink-0 rounded-full' />
                                <div className='flex flex-col'>
                                    <span className='text-sm'>
                                        {entry.remarks ?? entry.new_value}
                                    </span>
                                    {entry.created_at && (
                                        <span className='text-muted-foreground text-xs'>
                                            {dayjs(entry.created_at).format(
                                                'MM/DD/YYYY hh:mm A',
                                            )}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            <Dialog
                open={proofUrl !== null}
                onOpenChange={(open) => !open && setProofUrl(null)}
            >
                <DialogContent className='sm:max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle>Payment proof</DialogTitle>
                    </DialogHeader>
                    {proofUrl && (
                        // Signed, short-lived URL from a private disk; a plain
                        // img avoids next/image remote-host configuration.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={proofUrl}
                            alt='Payment proof'
                            className='max-h-[70vh] w-full rounded-md object-contain'
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AdminPage>
    );
}
