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

type Option = {
    label: string;
    value: string;
};

interface SelectSearchProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options?: Option[];
    placeholder?: string;
}

const SelectSearch = React.forwardRef<HTMLSelectElement, SelectSearchProps>(
    (
        { options = [], placeholder = 'Select…', value, onChange, ...props },
        ref
    ) => {
        const [open, setOpen] = React.useState(false);
        const [isMobile, setIsMobile] = React.useState(false);

        // detect screen size for Drawer vs Popover
        React.useEffect(() => {
            const update = () => setIsMobile(window.innerWidth < 640);
            update();
            window.addEventListener('resize', update);
            return () => window.removeEventListener('resize', update);
        }, []);

        const selected = options.find((o) => o.value === value);

        const handleSelect = (val: string) => {
            const event = {
                target: { value: val, name: props.name },
            } as unknown as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(event);
            setOpen(false);
        };

        const trigger = (
            <Button
                variant='outline'
                role='combobox'
                aria-expanded={open}
                className='w-full justify-between'
                onClick={() => setOpen(true)}
            >
                {selected ? selected.label : placeholder}
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
                                // IMPORTANT: search uses this string; use label here
                                value={opt.label}
                                // Also allow searching by the ID via keywords
                                keywords={[opt.value]}
                                onSelect={() => handleSelect(opt.value)}
                            >
                                {opt.label}
                                {opt.value === value && (
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
                <select ref={ref} value={value} {...props} className='hidden'>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {isMobile ? (
                    <Drawer open={open} onOpenChange={setOpen}>
                        <DrawerHeader>
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

SelectSearch.displayName = 'SelectSearch';

export default SelectSearch;
