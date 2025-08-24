'use client';

import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

type Props = {
    id?: string;
    name?: string;
    className?: string;
    placeholder?: string;
    /** Controlled value */
    value?: Date | string;
    /** Uncontrolled initial value */
    defaultValue?: Date | string;
    onChange?: (event: {
        target: { name?: string; value: string | Date | undefined };
    }) => void;
    onBlur?: (event: { target: { name?: string } }) => void;
    disabled?: boolean;
};

const parseDate = (d?: Date | string): Date | undefined => {
    if (!d) return undefined;
    if (d instanceof Date) return isNaN(d.getTime()) ? undefined : d;
    const parsed = dayjs(d);
    return parsed.isValid() ? parsed.toDate() : undefined;
};

const DatePicker = forwardRef<HTMLButtonElement, Props>(
    (
        {
            id,
            name,
            className,
            placeholder = 'Pick a date',
            value,
            defaultValue,
            onChange,
            onBlur,
            disabled,
        },
        ref
    ) => {
        const isControlled = value !== undefined;

        // Internal state for uncontrolled usage; initialize from defaultValue (or value if provided)
        const [internalDate, setInternalDate] = useState<Date | undefined>(() =>
            parseDate(value ?? defaultValue)
        );

        // Keep internal state in sync when controlled `value` changes
        useEffect(() => {
            if (isControlled) {
                setInternalDate(parseDate(value));
            }
        }, [isControlled, value]);

        const selectedDate = internalDate;

        const handleSelect = (date?: Date) => {
            // Only update local state in uncontrolled mode
            if (!isControlled) setInternalDate(date);

            onChange?.({
                target: {
                    name,
                    value: date ? dayjs(date).toJSON() : undefined,
                },
            });
        };

        const formattedLabel = useMemo(
            () =>
                selectedDate
                    ? dayjs(selectedDate).format('MMM DD, YYYY')
                    : placeholder,
            [selectedDate, placeholder]
        );

        return (
            <>
                {/* Optional hidden input for native form post / RHF fallback */}
                {name && (
                    <input
                        type='hidden'
                        name={name}
                        value={selectedDate ? dayjs(selectedDate).toJSON() : ''}
                    />
                )}

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id={id}
                            ref={ref}
                            name={name}
                            type='button'
                            variant='outline'
                            disabled={disabled}
                            data-empty={!selectedDate}
                            className={cn(
                                'data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal',
                                className
                            )}
                            onBlur={() => onBlur?.({ target: { name } })}
                        >
                            <CalendarIcon />
                            {formattedLabel}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                        <Calendar
                            mode='single'
                            selected={selectedDate}
                            defaultMonth={selectedDate}
                            onSelect={handleSelect}
                        />
                    </PopoverContent>
                </Popover>
            </>
        );
    }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
