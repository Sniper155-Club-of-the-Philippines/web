'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export default function SortableField({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className='relative'>
            {/* Drag handle */}
            <div
                {...attributes}
                {...listeners}
                className='absolute z-50 left-1 top-2 cursor-grab text-gray-400 hover:text-gray-600'
            >
                <GripVertical className='w-5 h-5' />
            </div>
            {children}
        </div>
    );
}
