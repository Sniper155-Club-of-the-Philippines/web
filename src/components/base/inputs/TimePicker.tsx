'use client';

import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function TimePicker({
    value,
    defaultValue,
    onChange,
    placeholder = 'hh:mm AM',
    formatString = 'hh:mm A',
    className,
    disabled = false, // ✅ new prop
}: {
    value?: Date;
    defaultValue?: Date;
    onChange?: (d: Date | undefined) => void;
    placeholder?: string;
    formatString?: string;
    className?: string;
    disabled?: boolean; // ✅ new prop type
}) {
    const isControlled = value !== undefined;
    const [internalDate, setInternalDate] = useState<Date | undefined>(
        defaultValue
    );
    const date = isControlled ? value : internalDate;
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);

    const updateDate = (d?: Date) => {
        if (!isControlled) setInternalDate(d);
        onChange?.(d);
    };

    const handleTimeChange = (
        type: 'hour' | 'minute' | 'ampm',
        val: string
    ) => {
        if (disabled) return; // ✅ prevent updates when disabled
        const base = date ? new Date(date) : new Date();
        const n = new Date(base);
        if (type === 'hour') {
            const h12 = parseInt(val, 10);
            const pm = n.getHours() >= 12;
            n.setHours((h12 % 12) + (pm ? 12 : 0));
        } else if (type === 'minute') {
            n.setMinutes(parseInt(val, 10));
        } else {
            const targetPM = val === 'PM';
            const cur = n.getHours();
            if (targetPM && cur < 12) n.setHours(cur + 12);
            if (!targetPM && cur >= 12) n.setHours(cur - 12);
        }
        n.setSeconds(0);
        n.setMilliseconds(0);
        updateDate(n);
    };

    const display = useMemo(() => {
        if (!date) return null;
        const inst = dayjs(date);
        return inst.isValid() ? inst.format(formatString) : null;
    }, [date, formatString]);

    // Highlight helpers
    const to12 = (h: number) => {
        const r = h % 12;
        return r === 0 ? 12 : r;
    };
    const isHourSel = (h: number) =>
        date ? to12(date.getHours()) === h : false;
    const isMinSel = (m: number) => (date ? date.getMinutes() === m : false);
    const isAm = () => (date ? date.getHours() < 12 : true);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    disabled={disabled} // ✅ disable trigger button
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                        className
                    )}
                >
                    {display ?? <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            {!disabled && ( // ✅ only render picker if not disabled
                <PopoverContent className='w-auto p-0'>
                    <div className='flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x'>
                        <ScrollArea className='w-64 sm:w-auto'>
                            <div className='flex sm:flex-col p-2'>
                                {hours
                                    .slice()
                                    .reverse()
                                    .map((h) => (
                                        <Button
                                            key={h}
                                            size='icon'
                                            disabled={disabled} // ✅ inner disabled
                                            variant={
                                                isHourSel(h)
                                                    ? 'default'
                                                    : 'ghost'
                                            }
                                            className='sm:w-full shrink-0 aspect-square'
                                            onClick={() =>
                                                handleTimeChange(
                                                    'hour',
                                                    String(h)
                                                )
                                            }
                                        >
                                            {h}
                                        </Button>
                                    ))}
                            </div>
                            <ScrollBar
                                orientation='horizontal'
                                className='sm:hidden'
                            />
                        </ScrollArea>

                        <ScrollArea className='w-64 sm:w-auto'>
                            <div className='flex sm:flex-col p-2'>
                                {Array.from(
                                    { length: 12 },
                                    (_, i) => i * 5
                                ).map((min) => (
                                    <Button
                                        key={min}
                                        size='icon'
                                        disabled={disabled}
                                        variant={
                                            isMinSel(min) ? 'default' : 'ghost'
                                        }
                                        className='sm:w-full shrink-0 aspect-square'
                                        onClick={() =>
                                            handleTimeChange(
                                                'minute',
                                                String(min)
                                            )
                                        }
                                    >
                                        {String(min).padStart(2, '0')}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar
                                orientation='horizontal'
                                className='sm:hidden'
                            />
                        </ScrollArea>

                        <ScrollArea>
                            <div className='flex sm:flex-col p-2'>
                                {['AM', 'PM'].map((a) => (
                                    <Button
                                        key={a}
                                        size='icon'
                                        disabled={disabled}
                                        variant={
                                            (a === 'AM' ? isAm() : !isAm())
                                                ? 'default'
                                                : 'ghost'
                                        }
                                        className='sm:w-full shrink-0 aspect-square'
                                        onClick={() =>
                                            handleTimeChange('ampm', a)
                                        }
                                    >
                                        {a}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </PopoverContent>
            )}
        </Popover>
    );
}
