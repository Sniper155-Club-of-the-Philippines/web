'use client';

import { cart, store } from '@/api';
import CartLineRow from '@/components/member/CartLineRow';
import CartSummary from '@/components/member/CartSummary';
import MemberPageHeader from '@/components/member/MemberPageHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHttp } from '@/hooks/http';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Store } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

type ValidationResponse = {
    message?: string;
    errors?: Record<string, string[]>;
};

/** Prefer the most specific field message, falling back to the summary. */
function errorMessage(error: unknown, fallback: string): string {
    if (isAxiosError<ValidationResponse>(error)) {
        const data = error.response?.data;
        const first = Object.values(data?.errors ?? {})[0]?.[0];
        return first ?? data?.message ?? fallback;
    }
    return fallback;
}

export default function MemberCartPage() {
    const http = useHttp();
    const queryClient = useQueryClient();

    const cartQuery = useQuery({
        queryKey: ['cart'],
        queryFn: () => cart.list(http),
    });
    const statusQuery = useQuery({
        queryKey: ['store', 'status'],
        queryFn: () => store.status(http),
    });

    const lines = cartQuery.data?.cart ?? [];
    const total = cartQuery.data?.total ?? 0;
    const storeClosed = statusQuery.data ? !statusQuery.data.open : false;

    const changeQuantity = async (id: string, quantity: number) => {
        try {
            await cart.update(http, id, { quantity });
            await queryClient.invalidateQueries({ queryKey: ['cart'] });
        } catch (error) {
            toast.error(errorMessage(error, 'Could not update quantity'));
        }
    };

    const remove = async (id: string) => {
        try {
            await cart.remove(http, id);
            await queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('Removed from cart');
        } catch (error) {
            toast.error(errorMessage(error, 'Could not remove item'));
        }
    };

    const checkout = () => {
        toast.info('Checkout opens with the next update.');
    };

    return (
        <>
            <MemberPageHeader
                title='Cart'
                description='Review your merchandise and recipient names before checkout.'
            />

            {cartQuery.isLoading ? (
                <div className='flex flex-col gap-3'>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className='h-28 w-full' />
                    ))}
                </div>
            ) : lines.length === 0 ? (
                <Alert>
                    <Store />
                    <AlertTitle>Your cart is empty</AlertTitle>
                    <AlertDescription>
                        <span>Browse the store to add merchandise.</span>
                        <Button asChild size='sm' className='mt-2 w-fit'>
                            <Link href='/member'>Go to store</Link>
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : (
                <div className='grid items-start gap-6 lg:grid-cols-[1fr_20rem]'>
                    <div className='bg-card rounded-lg border px-5'>
                        <div className='divide-border divide-y'>
                            {lines.map((line) => (
                                <CartLineRow
                                    key={line.id}
                                    line={line}
                                    disabled={storeClosed}
                                    onChangeQuantity={changeQuantity}
                                    onRemove={remove}
                                />
                            ))}
                        </div>
                    </div>

                    <CartSummary
                        itemCount={lines.length}
                        total={total}
                        storeClosed={storeClosed}
                        onCheckout={checkout}
                    />
                </div>
            )}
        </>
    );
}
