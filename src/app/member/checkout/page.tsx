'use client';

import { order } from '@/api';
import MemberPageHeader from '@/components/member/MemberPageHeader';
import ProofForm from '@/components/member/ProofForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHttp } from '@/hooks/http';
import { canSubmitProof } from '@/lib/order';
import { useQuery } from '@tanstack/react-query';
import { ReceiptText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MemberCheckoutPage() {
    const http = useHttp();
    const router = useRouter();

    const ordersQuery = useQuery({
        queryKey: ['orders'],
        queryFn: () => order.list(http),
    });

    // The order awaiting payment: unpaid, or rejected and open for a new proof.
    const openOrder = ordersQuery.data?.find(canSubmitProof);

    return (
        <>
            <MemberPageHeader
                title='Checkout'
                description='Pay through any method below, then upload your proof for verification.'
            />

            {ordersQuery.isLoading ? (
                <div className='flex flex-col gap-3'>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className='h-28 w-full' />
                    ))}
                </div>
            ) : !openOrder ? (
                <Alert>
                    <ReceiptText />
                    <AlertTitle>No order to pay</AlertTitle>
                    <AlertDescription>
                        <span>Place an order before submitting a payment.</span>
                        <Button asChild size='sm' className='mt-2 w-fit'>
                            <Link href='/member/cart'>Go to cart</Link>
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : (
                <div className='flex flex-col gap-4'>
                    <p className='text-muted-foreground text-sm'>
                        Paying for order {openOrder.order_number}
                    </p>
                    <ProofForm
                        orderId={openOrder.id}
                        total={openOrder.subtotal}
                        onSubmitted={() => {
                            router.push('/member/orders');
                        }}
                    />
                </div>
            )}
        </>
    );
}
