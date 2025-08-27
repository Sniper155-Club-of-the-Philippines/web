'use client';

import { useState, ReactNode, PropsWithChildren, useRef } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

type HoverPopoverProps = PropsWithChildren<{
    trigger: ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    className?: string;
    openDelay?: number;
    closeDelay?: number;
}>;

export function HoverPopover({
    trigger,
    side = 'top',
    align = 'center',
    className,
    children,
    openDelay = 0,
    closeDelay = 150,
}: HoverPopoverProps) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleOpen = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (openDelay > 0) {
            timeoutRef.current = setTimeout(() => setOpen(true), openDelay);
        } else {
            setOpen(true);
        }
    };

    const handleClose = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (closeDelay > 0) {
            timeoutRef.current = setTimeout(() => setOpen(false), closeDelay);
        } else {
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                asChild
                onMouseEnter={handleOpen}
                onMouseLeave={handleClose}
            >
                <div className='inline-block cursor-pointer'>{trigger}</div>
            </PopoverTrigger>
            <PopoverContent
                side={side}
                align={align}
                className={className}
                onMouseEnter={handleOpen}
                onMouseLeave={handleClose}
            >
                {children}
            </PopoverContent>
        </Popover>
    );
}
