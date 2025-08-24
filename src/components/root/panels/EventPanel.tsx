'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Event } from '@/types/models/event';
import dayjs from 'dayjs';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    data: Event[];
    className?: string;
};

export default function EventPanel({ data, className }: Props) {
    const formatDate = (event: Event) => {
        const start = dayjs(event.start);
        const end = dayjs(event.end);
        const format = 'MMM DD, YYYY';

        if (start.isSame(end, 'day')) {
            return start.format(format);
        }

        return (
            <div className='flex flex-row md:flex-col gap-2 md:gap-0'>
                <span>{start.format(format)}</span>
                <span>to</span>
                <span>{end.format(format)}</span>
            </div>
        );
    };

    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: data.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 200, // fallback estimate
        overscan: 5,
        measureElement: (el) => el.getBoundingClientRect().height, // dynamic height
    });

    const virtualItems = rowVirtualizer.getVirtualItems();
    const totalSize = rowVirtualizer.getTotalSize();

    return (
        <section
            ref={parentRef}
            className={cn(
                'bg-background py-8 md:py-20 w-full h-full overflow-x-auto max-h-[760px] flex justify-center',
                className
            )}
        >
            <div className='container pb-14'>
                <h1 className='text-foreground mb-10 text-center text-3xl font-bold tracking-tighter sm:text-6xl'>
                    Events
                </h1>

                <div className='relative mx-auto max-w-4xl'>
                    <div
                        style={{
                            height: totalSize,
                            position: 'relative',
                        }}
                    >
                        <Separator
                            orientation='vertical'
                            className='bg-muted absolute left-2 top-4'
                        />
                        {virtualItems.map((virtualRow) => {
                            const event = data[virtualRow.index];
                            return (
                                <div
                                    ref={rowVirtualizer.measureElement}
                                    key={event.id}
                                    data-index={virtualRow.index}
                                    id={event.id}
                                    className='relative mb-10 pl-8'
                                    style={{
                                        position: 'absolute',
                                        top: virtualRow.start,
                                        width: '100%',
                                    }}
                                >
                                    <div className='bg-foreground absolute left-0 top-3.5 flex size-4 items-center justify-center rounded-full' />
                                    <h4 className='rounded-xl py-2 text-xl font-bold tracking-tight xl:mb-4 xl:px-3'>
                                        {event.title}
                                    </h4>

                                    <h5 className='text-md -left-34 text-muted-foreground top-3 rounded-xl tracking-tight xl:absolute'>
                                        {formatDate(event)}
                                    </h5>

                                    <Card className='my-5 border-none shadow-none'>
                                        <CardContent className='px-0 xl:px-2'>
                                            <div className='prose dark:prose-invert text-foreground px-4 whitespace-pre-wrap break-all'>
                                                {event.description}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
