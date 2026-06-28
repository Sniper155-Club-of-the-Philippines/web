'use client';

import { order } from '@/api';
import MemberPageHeader from '@/components/member/MemberPageHeader';
import ProofForm from '@/components/member/ProofForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useHttp } from '@/hooks/http';
import { formatPesos } from '@/lib/money';
import {
    canSubmitProof,
    canVoid,
    orderStatusLabel,
    paymentStatusLabel,
    paymentStatusVariant,
} from '@/lib/order';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function MemberOrderDetailPage() {
    const http = useHttp();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();

    const orderQuery = useQuery({
        queryKey: ['order', id],
        queryFn: () => order.get(http, id),
    });

    const voidOrder = useMutation({
        mutationFn: () => order.voidOrder(http, id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['order', id] });
            await queryClient.invalidateQueries({ queryKey: ['orders'] });
            await queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('Order returned to your cart');
        },
        onError: () => toast.error('Could not void this order'),
    });

    const current = orderQuery.data;

    return (
        <>
            <MemberPageHeader
                title={current ? current.order_number : 'Order'}
                description='Review items, settle payment, and track fulfillment.'
            />

            {orderQuery.isLoading || !current ? (
                <Skeleton className='h-64 w-full' />
            ) : (
                <div className='flex flex-col gap-6'>
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

                    {current.payment_status === 'rejected' && current.reject_reason && (
                        <Alert variant='destructive'>
                            <TriangleAlert />
                            <AlertTitle>Payment rejected</AlertTitle>
                            <AlertDescription>
                                {current.reject_reason} Submit a new proof below.
                            </AlertDescription>
                        </Alert>
                    )}

                    <section className='bg-card rounded-lg border'>
                        <div className='divide-border divide-y'>
                            {(current.items ?? []).map((item) => (
                                <div
                                    key={item.id}
                                    className='flex items-center justify-between gap-4 p-4'
                                >
                                    <div className='flex flex-col gap-1'>
                                        <span className='font-medium'>
                                            {item.product_name}
                                        </span>
                                        <span className='text-muted-foreground text-sm'>
                                            {item.recipient_nickname} · {item.size} ·
                                            ×{item.quantity}
                                        </span>
                                    </div>
                                    <span className='font-medium'>
                                        {formatPesos(item.line_total)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {current.histories && current.histories.length > 0 && (
                        <section className='flex flex-col gap-3'>
                            <h2 className='text-lg font-semibold'>Timeline</h2>
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
                                                    {new Date(
                                                        entry.created_at,
                                                    ).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    )}

                    {canSubmitProof(current) && (
                        <>
                            <Separator />
                            <ProofForm
                                orderId={current.id}
                                total={current.subtotal}
                            />
                        </>
                    )}

                    <div className='flex flex-wrap gap-3'>
                        {canVoid(current) && (
                            <Button
                                variant='outline'
                                onClick={() => voidOrder.mutate()}
                                disabled={voidOrder.isPending}
                            >
                                Void and return to cart
                            </Button>
                        )}
                        <Button asChild variant='ghost'>
                            <Link href='/member/orders'>Back to orders</Link>
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
