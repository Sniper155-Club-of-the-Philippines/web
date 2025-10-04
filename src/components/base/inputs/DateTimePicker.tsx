'use client';

import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import dayjs from 'dayjs';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export interface DateTimePickerProps {
    value?: Date; // Controlled value
    defaultValue?: Date; // Uncontrolled initial value
    onChange?: (date: Date | undefined) => void; // Change callback
    placeholder?: string;
    formatString?: string; // e.g. "MM/DD/YYYY hh:mm A"
    className?: string; // for custom styling
    disabled?: boolean;
}

export default function DateTimePicker({
    value,
    defaultValue,
    onChange,
    placeholder = 'Select Date and Time',
    formatString = 'MM/DD/YYYY hh:mm A',
    className,
    disabled = false,
}: DateTimePickerProps) {
    const [internalDate, setInternalDate] = useState<Date | undefined>(
        defaultValue
    );
    const [isOpen, setIsOpen] = useState(false);

    const date = value ?? internalDate; // controlled if value provided

    const updateDate = (newDate: Date | undefined) => {
        if (disabled) return;
        if (!value) {
            setInternalDate(newDate);
        }
        onChange?.(newDate);
    };

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (disabled) return;
        if (selectedDate) {
            // keep time when changing date
            if (date) {
                selectedDate.setHours(date.getHours());
                selectedDate.setMinutes(date.getMinutes());
            }
            updateDate(selectedDate);
        }
    };

    const handleTimeChange = (
        type: 'hour' | 'minute' | 'ampm',
        value: string
    ) => {
        if (disabled || !date) return;

        const newDate = new Date(date);

        if (type === 'hour') {
            newDate.setHours(
                (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
            );
        } else if (type === 'minute') {
            newDate.setMinutes(parseInt(value));
        } else if (type === 'ampm') {
            const currentHours = newDate.getHours();
            if (value === 'PM' && currentHours < 12) {
                newDate.setHours(currentHours + 12);
            }
            if (value === 'AM' && currentHours >= 12) {
                newDate.setHours(currentHours - 12);
            }
        }

        updateDate(newDate);
    };

    const displayDate = useMemo(() => {
        const instance = dayjs(date);

        if (!instance.isValid()) {
            return null;
        }

        return instance.format(formatString);
    }, [date, formatString]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    disabled={disabled}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                        className
                    )}
                >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {date ? displayDate : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>

            {!disabled && (
                <PopoverContent className='w-auto p-0'>
                    <div className='sm:flex'>
                        <Calendar
                            mode='single'
                            selected={date}
                            onSelect={handleDateSelect}
                        />
                        <div className='flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x'>
                            {/* Hours */}
                            <ScrollArea className='w-64 sm:w-auto'>
                                <div className='flex sm:flex-col p-2'>
                                    {hours
                                        .slice()
                                        .reverse()
                                        .map((hour) => (
                                            <Button
                                                key={hour}
                                                size='icon'
                                                disabled={disabled}
                                                variant={
                                                    date &&
                                                    date.getHours() % 12 ===
                                                        hour % 12
                                                        ? 'default'
                                                        : 'ghost'
                                                }
                                                className='sm:w-full shrink-0 aspect-square'
                                                onClick={() =>
                                                    handleTimeChange(
                                                        'hour',
                                                        hour.toString()
                                                    )
                                                }
                                            >
                                                {hour}
                                            </Button>
                                        ))}
                                </div>
                                <ScrollBar
                                    orientation='horizontal'
                                    className='sm:hidden'
                                />
                            </ScrollArea>

                            {/* Minutes */}
                            <ScrollArea className='w-64 sm:w-auto'>
                                <div className='flex sm:flex-col p-2'>
                                    {Array.from(
                                        { length: 12 },
                                        (_, i) => i * 5
                                    ).map((minute) => (
                                        <Button
                                            key={minute}
                                            size='icon'
                                            disabled={disabled}
                                            variant={
                                                date &&
                                                date.getMinutes() === minute
                                                    ? 'default'
                                                    : 'ghost'
                                            }
                                            className='sm:w-full shrink-0 aspect-square'
                                            onClick={() =>
                                                handleTimeChange(
                                                    'minute',
                                                    minute.toString()
                                                )
                                            }
                                        >
                                            {minute.toString().padStart(2, '0')}
                                        </Button>
                                    ))}
                                </div>
                                <ScrollBar
                                    orientation='horizontal'
                                    className='sm:hidden'
                                />
                            </ScrollArea>

                            {/* AM/PM */}
                            <ScrollArea>
                                <div className='flex sm:flex-col p-2'>
                                    {['AM', 'PM'].map((ampm) => (
                                        <Button
                                            key={ampm}
                                            size='icon'
                                            disabled={disabled}
                                            variant={
                                                date &&
                                                ((ampm === 'AM' &&
                                                    date.getHours() < 12) ||
                                                    (ampm === 'PM' &&
                                                        date.getHours() >= 12))
                                                    ? 'default'
                                                    : 'ghost'
                                            }
                                            className='sm:w-full shrink-0 aspect-square'
                                            onClick={() =>
                                                handleTimeChange('ampm', ampm)
                                            }
                                        >
                                            {ampm}
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </PopoverContent>
            )}
        </Popover>
    );
}
