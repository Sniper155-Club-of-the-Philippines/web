'use client';

import { Button } from '@/components/ui/button';
import { formatPesos } from '@/lib/money';
import type { CartLine } from '@/types/models/cart';
import { ImageOff, Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

/**
 * A single cart line. The recipient identity is the organising idea: the
 * snapshot nickname is shown as a name print — the very text that goes on the
 * garment — so the cart previews what the member is ordering, for whom.
 */
export default function CartLineRow({
    line,
    disabled,
    onChangeQuantity,
    onRemove,
}: {
    line: CartLine;
    disabled: boolean;
    onChangeQuantity: (id: string, quantity: number) => Promise<void>;
    onRemove: (id: string) => Promise<void>;
}) {
    const [busy, setBusy] = useState(false);
    const thumb = line.images[0];
    const recipient = line.recipient_type === 'obr' ? 'OBR' : 'Rider';

    const run = async (action: () => Promise<void>) => {
        setBusy(true);
        try {
            await action();
        } finally {
            setBusy(false);
        }
    };

    const locked = disabled || busy;

    return (
        <div className='flex gap-4 py-5'>
            <div className='bg-muted relative size-20 shrink-0 overflow-hidden rounded-md'>
                {thumb ? (
                    <Image
                        src={thumb.image_url}
                        alt={line.name}
                        fill
                        sizes='80px'
                        className='object-cover'
                        unoptimized
                    />
                ) : (
                    <div className='text-muted-foreground flex size-full items-center justify-center'>
                        <ImageOff className='size-6' />
                    </div>
                )}
            </div>

            <div className='flex min-w-0 flex-1 flex-col gap-3'>
                <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                        <p className='truncate font-medium'>{line.name}</p>
                        <p className='text-muted-foreground text-sm'>
                            Size {line.size} · {formatPesos(line.price)} each
                        </p>
                    </div>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='text-muted-foreground hover:text-destructive -mr-2 -mt-1 shrink-0'
                        aria-label={`Remove ${line.name}`}
                        disabled={locked}
                        onClick={() => run(() => onRemove(line.id))}
                    >
                        <Trash2 />
                    </Button>
                </div>

                {/* Name print — what will be printed on the garment. */}
                <div className='border-border/70 inline-flex w-fit flex-col rounded-sm border border-dashed px-3 py-1.5'>
                    <span className='text-muted-foreground text-[0.625rem] font-semibold tracking-[0.2em] uppercase'>
                        {recipient}
                    </span>
                    <span className='font-mono text-sm font-semibold tracking-[0.18em] uppercase'>
                        {line.recipient_nickname}
                    </span>
                </div>

                <div className='mt-auto flex items-center justify-between gap-3'>
                    <div className='flex items-center'>
                        <Button
                            variant='outline'
                            size='icon'
                            className='size-8 rounded-r-none'
                            aria-label='Decrease quantity'
                            disabled={locked || line.quantity <= 1}
                            onClick={() =>
                                run(() =>
                                    onChangeQuantity(
                                        line.id,
                                        line.quantity - 1,
                                    ),
                                )
                            }
                        >
                            <Minus />
                        </Button>
                        <div className='border-input flex h-8 w-10 items-center justify-center border-y text-sm tabular-nums'>
                            {busy ? (
                                <Loader2 className='size-3.5 animate-spin motion-reduce:animate-none' />
                            ) : (
                                line.quantity
                            )}
                        </div>
                        <Button
                            variant='outline'
                            size='icon'
                            className='size-8 rounded-l-none'
                            aria-label='Increase quantity'
                            disabled={locked}
                            onClick={() =>
                                run(() =>
                                    onChangeQuantity(
                                        line.id,
                                        line.quantity + 1,
                                    ),
                                )
                            }
                        >
                            <Plus />
                        </Button>
                    </div>

                    <p className='font-semibold tabular-nums'>
                        {formatPesos(line.subtotal)}
                    </p>
                </div>
            </div>
        </div>
    );
}
