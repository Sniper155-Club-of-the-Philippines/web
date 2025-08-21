import React from 'react';
import {
    Select as BaseSelect,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface Option {
    value: string;
    label: string;
}

interface Props {
    options: Option[];
    placeholder?: string;
    label?: string;
    width?: string;
    value?: string;
    onChange?: (value: string) => void;
}

export default function Select({
    options,
    placeholder = 'Select an option',
    label = 'Options',
    width = 'w-[180px]',
    value,
    onChange,
}: Props) {
    return (
        <BaseSelect value={value} onValueChange={onChange}>
            <SelectTrigger className={width}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{label}</SelectLabel>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </BaseSelect>
    );
}
