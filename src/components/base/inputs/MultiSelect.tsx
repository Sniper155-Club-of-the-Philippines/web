'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

type Option = {
    label: string;
    value: string;
};

interface MultiSelectProps
    extends Omit<
        React.SelectHTMLAttributes<HTMLSelectElement>,
        'value' | 'onChange'
    > {
    options?: Option[];
    placeholder?: string;
    triggerWidth?: string;
    value?: string[];
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const MultiSelect = React.forwardRef<HTMLSelectElement, MultiSelectProps>(
    (
        {
            options = [],
            placeholder = 'Select…',
            value = [],
            onChange,
            triggerWidth,
            ...props
        },
        ref
    ) => {
        const [open, setOpen] = React.useState(false);
        const [isMobile, setIsMobile] = React.useState(false);

        // detect screen size
        React.useEffect(() => {
            const update = () => setIsMobile(window.innerWidth < 640);
            update();
            window.addEventListener('resize', update);
            return () => window.removeEventListener('resize', update);
        }, []);

        const handleToggle = (val: string) => {
            const newValues = value.includes(val)
                ? value.filter((v) => v !== val)
                : [...value, val];

            onChange?.({
                target: { value: newValues, name: props.name },
            } as unknown as React.ChangeEvent<HTMLSelectElement>);
        };

        const trigger = (
            <Button
                variant='outline'
                role='combobox'
                aria-expanded={open}
                className={cn('justify-between', triggerWidth ?? 'w-full')}
                onClick={() => setOpen(true)}
            >
                {value.length > 0
                    ? options
                          .filter((o) => value.includes(o.value))
                          .map((o) => o.label)
                          .join(', ')
                    : placeholder}
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
        );

        const list = (
            <Command>
                <CommandInput placeholder={placeholder} />
                <CommandList>
                    <CommandEmpty>No results.</CommandEmpty>
                    <CommandGroup>
                        {options.map((opt) => (
                            <CommandItem
                                key={opt.value}
                                value={opt.label}
                                keywords={[opt.value]}
                                onSelect={() => {
                                    handleToggle(opt.value);
                                }}
                            >
                                {opt.label}
                                {value.includes(opt.value) && (
                                    <Check className='ml-auto h-4 w-4' />
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </Command>
        );

        return (
            <>
                {/* hidden real select for form compatibility */}
                <select
                    ref={ref}
                    multiple
                    value={value}
                    onChange={onChange ?? (() => {})}
                    {...props}
                    className='hidden'
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {isMobile ? (
                    <Drawer open={open} onOpenChange={setOpen}>
                        <DrawerHeader className='hidden'>
                            <DrawerTitle>{placeholder}</DrawerTitle>
                        </DrawerHeader>
                        {trigger}
                        <DrawerContent>{list}</DrawerContent>
                    </Drawer>
                ) : (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
                        <PopoverContent
                            className='w-[--radix-popover-trigger-width] p-0'
                            align='start'
                            side='bottom'
                        >
                            {list}
                        </PopoverContent>
                    </Popover>
                )}
            </>
        );
    }
);

MultiSelect.displayName = 'MultiSelect';

export default MultiSelect;
