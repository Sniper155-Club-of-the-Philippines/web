'use client';

import { Button } from '@/components/ui/button';
import {
    Type,
    AlignLeft,
    CircleDot,
    CheckSquare,
    ListFilter,
    Calendar,
    Clock,
    CalendarClock,
} from 'lucide-react';
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from '@/components/ui/tooltip';
import { FormFieldType } from '@/types/models/form-field';

export default function FabMenu({
    addField,
}: {
    addField: (type: FormFieldType) => void;
}) {
    const items = [
        {
            type: 'text',
            icon: <Type className='w-5 h-5' />,
            label: 'Short',
        },
        {
            type: 'paragraph',
            icon: <AlignLeft className='w-5 h-5' />,
            label: 'Paragraph',
        },
        {
            type: 'multiple_choice',
            icon: <CircleDot className='w-5 h-5' />,
            label: 'Multiple Choice',
        },
        {
            type: 'checkboxes',
            icon: <CheckSquare className='w-5 h-5' />,
            label: 'Checkboxes',
        },
        {
            type: 'dropdown',
            icon: <ListFilter className='w-5 h-5' />,
            label: 'Dropdown',
        },
        {
            type: 'date',
            icon: <Calendar className='w-5 h-5' />,
            label: 'Date',
        },
        {
            type: 'time',
            icon: <Clock className='w-5 h-5' />,
            label: 'Time',
        },
        {
            type: 'datetime',
            icon: <CalendarClock className='w-5 h-5' />,
            label: 'Date & Time',
        },
    ] as const;

    return (
        <TooltipProvider>
            <div className='fixed right-8 bottom-8 flex flex-col space-y-2'>
                {items.map((btn) => (
                    <Tooltip key={btn.type}>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => addField(btn.type)}
                                className='rounded-full w-12 h-12 p-0 shadow-md bg-blue-600 hover:bg-blue-700'
                            >
                                {btn.icon}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side='left'>{btn.label}</TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
}
