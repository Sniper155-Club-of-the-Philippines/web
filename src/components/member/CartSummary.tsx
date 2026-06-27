'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPesos } from '@/lib/money';
import { LockKeyhole } from 'lucide-react';

export default function CartSummary({
    itemCount,
    total,
    storeClosed,
    onCheckout,
}: {
    itemCount: number;
    total: number;
    storeClosed: boolean;
    onCheckout: () => void;
}) {
    const empty = itemCount === 0;
    const blocked = empty || storeClosed;

    return (
        <div className='bg-card rounded-lg border p-5 lg:sticky lg:top-20'>
            <h2 className='font-semibold'>Order summary</h2>

            <dl className='mt-4 flex flex-col gap-2 text-sm'>
                <div className='flex justify-between'>
                    <dt className='text-muted-foreground'>
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </dt>
                    <dd className='tabular-nums'>{formatPesos(total)}</dd>
                </div>
            </dl>

            <Separator className='my-4' />

            <div className='flex items-baseline justify-between'>
                <span className='font-semibold'>Total</span>
                <span className='text-lg font-semibold tabular-nums'>
                    {formatPesos(total)}
                </span>
            </div>

            <Button
                className='mt-5 w-full'
                disabled={blocked}
                onClick={onCheckout}
            >
                Proceed to checkout
            </Button>

            {storeClosed && (
                <p className='text-muted-foreground mt-3 flex items-center justify-center gap-1.5 text-xs'>
                    <LockKeyhole className='size-3.5' />
                    Checkout opens during the next ordering period.
                </p>
            )}
        </div>
    );
}
