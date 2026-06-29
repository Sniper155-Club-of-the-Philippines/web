'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/models/store';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

export default function ProductImageGallery({
    images,
    name,
    showThumbnails = false,
    className,
}: {
    images: readonly ProductImage[];
    name: string;
    showThumbnails?: boolean;
    className?: string;
}) {
    const ordered = useMemo(
        () => [...images].sort((a, b) => a.sort_order - b.sort_order),
        [images],
    );
    const [index, setIndex] = useState(0);

    useEffect(() => {
        setIndex(0);
    }, [images]);

    const selected = ordered[index];
    const multiple = ordered.length > 1;

    const selectRelative = (offset: number) => {
        setIndex(
            (current) => (current + offset + ordered.length) % ordered.length,
        );
    };

    return (
        <div className={cn('min-w-0 space-y-3', className)}>
            <div className='bg-muted relative flex aspect-square items-center justify-center overflow-hidden'>
                {selected ? (
                    <Image
                        src={selected.image_url}
                        alt={`${name} image ${index + 1} of ${ordered.length}`}
                        fill
                        sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                        className='object-cover'
                        unoptimized
                    />
                ) : (
                    <ImageOff className='text-muted-foreground size-10' />
                )}

                {multiple && (
                    <>
                        <Button
                            type='button'
                            size='icon'
                            variant='secondary'
                            className='absolute left-2 size-8 rounded-full shadow-sm'
                            aria-label='Show previous product image'
                            onClick={() => {
                                selectRelative(-1);
                            }}
                        >
                            <ChevronLeft />
                        </Button>
                        <Button
                            type='button'
                            size='icon'
                            variant='secondary'
                            className='absolute right-2 size-8 rounded-full shadow-sm'
                            aria-label='Show next product image'
                            onClick={() => {
                                selectRelative(1);
                            }}
                        >
                            <ChevronRight />
                        </Button>
                        <span className='bg-background/85 absolute right-2 bottom-2 rounded-full px-2 py-1 text-xs font-medium backdrop-blur-sm'>
                            {index + 1} / {ordered.length}
                        </span>
                    </>
                )}
            </div>

            {showThumbnails && multiple && (
                <ScrollArea className='w-full'>
                    <div className='flex gap-2 pb-3'>
                        {ordered.map((image, imageIndex) => (
                            <button
                                key={image.id}
                                type='button'
                                className={cn(
                                    'ring-offset-background relative size-16 shrink-0 overflow-hidden rounded-md border transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                                    imageIndex === index
                                        ? 'border-primary opacity-100'
                                        : 'opacity-60 hover:opacity-100',
                                )}
                                aria-label={`Show product image ${imageIndex + 1}`}
                                aria-pressed={imageIndex === index}
                                onClick={() => {
                                    setIndex(imageIndex);
                                }}
                            >
                                <Image
                                    src={image.image_url}
                                    alt=''
                                    fill
                                    sizes='64px'
                                    className='object-cover'
                                    unoptimized
                                />
                            </button>
                        ))}
                    </div>
                    <ScrollBar orientation='horizontal' />
                </ScrollArea>
            )}
        </div>
    );
}
