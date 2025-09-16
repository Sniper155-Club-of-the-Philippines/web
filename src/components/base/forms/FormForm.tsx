'use client';

import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';

import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckedState } from '@radix-ui/react-checkbox';
import FieldCard from './form-builder/FieldCard';
import FabMenu from './form-builder/FabMenu';
import type { FormFieldType } from '@/types/models/form-field';

interface Field {
    id: string;
    label: string;
    type: FormFieldType | string;
    options?: { value: string; label: string }[];
}

interface FormValue {
    id: string;
    value: any;
}

export default function FormForm() {
    const [title, setTitle] = useState('Untitled Form');
    const [description, setDescription] = useState('Form description');
    const [fields, setFields] = useState<Field[]>([
        { id: 'textField', label: 'Short Answer Question', type: 'text' },
    ]);
    const [formData, setFormData] = useState<FormValue[]>([
        { id: 'textField', value: '' },
    ]);

    const handleCheckboxChange = (
        fieldId: string,
        value: string,
        checked: CheckedState
    ) => {
        setFormData((prev) =>
            prev.map((f) =>
                f.id === fieldId
                    ? {
                          ...f,
                          value: checked
                              ? [...(f.value || []), value]
                              : (f.value || []).filter(
                                    (item: string) => item !== value
                                ),
                      }
                    : f
            )
        );
    };

    const addField = (type: FormFieldType) => {
        const id = type;

        const newField: Field = {
            id,
            label:
                type === 'text'
                    ? 'Short Answer Question'
                    : type === 'paragraph'
                    ? 'Long Answer Question'
                    : type === 'multiple_choice'
                    ? 'Multiple Choice Question'
                    : type === 'checkboxes'
                    ? 'Checkbox Question'
                    : type === 'dropdown'
                    ? 'Dropdown Question'
                    : type === 'date'
                    ? 'Date Question'
                    : type === 'time'
                    ? 'Time Question'
                    : 'Date and Time Question',
            type,
            options: ['radio', 'checkbox', 'dropdown'].includes(type)
                ? []
                : undefined,
        };

        setFields((prev) => [...prev, newField]);
        setFormData((prev) => [
            ...prev,
            { id, value: type === 'checkboxes' ? [] : '' },
        ]);
    };

    const removeField = (id: string) => {
        setFields((prev) => prev.filter((f) => f.id !== id));
        setFormData((prev) => prev.filter((f) => f.id !== id));
    };

    const updateField = (id: string, updated: Partial<Field>) => {
        setFields((prev) =>
            prev.map((f) => (f.id === id ? { ...f, ...updated } : f))
        );
    };

    const updateFieldValue = (id: string, value: any) => {
        setFormData((prev) =>
            prev.map((f) => (f.id === id ? { ...f, value } : f))
        );
    };

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setFields((prev) => {
                const oldIndex = prev.findIndex((f) => f.id === active.id);
                const newIndex = prev.findIndex((f) => f.id === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
            setFormData((prev) => {
                const oldIndex = prev.findIndex((f) => f.id === active.id);
                const newIndex = prev.findIndex((f) => f.id === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };

    return (
        <div className='max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen relative'>
            {/* Header */}
            <Card className='mb-6 border-t-4 border-t-blue-600'>
                <CardHeader>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='Form title'
                        className='md:text-3xl font-normal text-gray-800 px-0 border-0 focus:ring-0 focus:border-0'
                    />
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder='Form description'
                        className='mt-2 text-gray-600 border-0 focus:ring-0 px-0 focus:border-0 resize-none'
                    />
                </CardHeader>
            </Card>

            {/* Fields */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={fields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {fields.map((field) => {
                        const value = formData.find(
                            (f) => f.id === field.id
                        )?.value;
                        return (
                            <FieldCard
                                key={field.id}
                                field={field}
                                value={value}
                                setValue={(val) =>
                                    updateFieldValue(field.id, val)
                                }
                                handleCheckboxChange={handleCheckboxChange}
                                onDelete={() => removeField(field.id)}
                                onUpdateField={updateField}
                            />
                        );
                    })}
                </SortableContext>
            </DndContext>

            {/* Submit */}
            <div className='flex justify-end mt-8'>
                <Button
                    className='bg-blue-600 hover:bg-blue-700 text-white px-8'
                    onClick={() =>
                        console.log('Form submitted:', {
                            title,
                            description,
                            fields,
                            formData,
                        })
                    }
                >
                    Submit
                </Button>
            </div>

            {/* Floating Action Menu */}
            <FabMenu addField={addField} />
        </div>
    );
}
