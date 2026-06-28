'use client';

import { order } from '@/api';
import MemberPageHeader from '@/components/member/MemberPageHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHttp } from '@/hooks/http';
import { formatPesos } from '@/lib/money';
import {
    orderStatusLabel,
    orderTab,
    orderTabs,
    paymentStatusLabel,
    paymentStatusVariant,
    type OrderTab,
} from '@/lib/order';
import type { Order } from '@/types/models/order';
import { useQuery } from '@tanstack/react-query';
import { ReceiptText } from 'lucide-react';
import Link from 'next/link';

export default function MemberOrdersPage() {
    const http = useHttp();

    const ordersQuery = useQuery({
        queryKey: ['orders'],
        queryFn: () => order.list(http),
    });

    const orders = ordersQuery.data ?? [];

    return (
        <>
            <MemberPageHeader
                title='Orders'
                description='Track payment and fulfillment for every order you place.'
            />

            {ordersQuery.isLoading ? (
                <div className='flex flex-col gap-3'>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className='h-24 w-full' />
                    ))}
                </div>
            ) : (
                <Tabs defaultValue='to-pay'>
                    <TabsList>
                        {orderTabs.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value}>
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {orderTabs.map((tab) => (
                        <TabsContent key={tab.value} value={tab.value}>
                            <OrderList
                                tab={tab.value}
                                orders={orders.filter(
                                    (item) => orderTab(item) === tab.value,
                                )}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            )}
        </>
    );
}

function OrderList({ tab, orders }: { tab: OrderTab; orders: Order[] }) {
    if (orders.length === 0) {
        return (
            <Alert>
                <ReceiptText />
                <AlertTitle>Nothing here yet</AlertTitle>
                <AlertDescription>
                    {tab === 'to-pay'
                        ? 'Orders awaiting payment will show up here.'
                        : tab === 'to-receive'
                          ? 'Approved orders in production will show up here.'
                          : 'Completed orders will show up here.'}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className='flex flex-col gap-3'>
            {orders.map((item) => (
                <Link
                    key={item.id}
                    href={`/member/orders/${item.id}`}
                    className='bg-card hover:border-primary flex items-center justify-between gap-4 rounded-lg border p-4 transition'
                >
                    <div className='flex flex-col gap-1'>
                        <span className='font-medium'>{item.order_number}</span>
                        <span className='text-muted-foreground text-sm'>
                            {orderStatusLabel(item.order_status)}
                        </span>
                    </div>
                    <div className='flex flex-col items-end gap-1'>
                        <span className='font-semibold'>
                            {formatPesos(item.subtotal)}
                        </span>
                        <Badge variant={paymentStatusVariant(item.payment_status)}>
                            {paymentStatusLabel(item.payment_status)}
                        </Badge>
                    </div>
                </Link>
            ))}
        </div>
    );
}
