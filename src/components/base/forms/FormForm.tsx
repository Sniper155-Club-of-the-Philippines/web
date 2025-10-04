'use client';

import { Fragment, useMemo, useState } from 'react';
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

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CheckedState } from '@radix-ui/react-checkbox';
import FieldCard from '@/components/base/forms/form-builder/FieldCard';
import FabMenu from '@/components/base/forms/form-builder/FabMenu';
import type { FormFieldType } from '@/types/models/form-field';
import { randomString } from '@/lib/string';
import { FORM_FIELD_TYPES } from '@/constants';

interface Field {
    id: string;
    label: string;
    type: FormFieldType;
    options?: { value: string; label: string; id: string }[];
}

interface FormValue {
    id: string;
    value: any;
    type: FormFieldType;
}

export type FormSubmitPayload = {
    title: string;
    description: string;
    fields: Field[];
    formData: FormValue[];
};

type Props = {
    onSubmit?: (data: FormSubmitPayload) => void | Promise<void>;
    initialFields?: Field[];
    initialData?: FormValue[];
    initialTitle?: string;
    initialDescription?: string | null;
    readonly?: boolean;
    answer?: boolean;
};

export default function FormForm({
    onSubmit,
    initialFields = [],
    initialData = [],
    initialTitle,
    initialDescription,
    readonly = false,
    answer = false,
}: Props) {
    const [title, setTitle] = useState(initialTitle ?? 'Untitled Form');
    const [description, setDescription] = useState(
        initialDescription ?? 'Form description'
    );
    const [fields, setFields] = useState<Field[]>(initialFields);
    const [formData, setFormData] = useState<FormValue[]>(initialData);

    const formDataMap = useMemo(() => {
        const map = new Map();
        formData.forEach((f) => {
            if (f && f.id !== undefined) {
                map.set(f.id, f.value);
            }
        });
        return map;
    }, [formData]);

    const handleCheckboxChange = (
        fieldId: string,
        value: string,
        checked: CheckedState
    ) => {
        setFormData((prev) => {
            const existing = prev.find((f) => f.id === fieldId);

            if (existing) {
                const updated = prev.map((f) =>
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
                );

                return updated;
            } else {
                // Create new entry if it doesn't exist
                const newEntry = {
                    id: fieldId,
                    value: checked ? [value] : [],
                    type: FORM_FIELD_TYPES.CHECKBOXES,
                };
                const newFormData = [...prev, newEntry];
                return newFormData;
            }
        });
    };

    const addField = (type: FormFieldType) => {
        if (answer) {
            return;
        }

        const newField: Field = {
            id: randomString(),
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
            options: ['multiple_choice', 'checkboxes', 'dropdown'].includes(
                type
            )
                ? []
                : undefined,
        };

        setFields((prev) => [...prev, newField]);
        setFormData((prev) => [
            ...prev,
            { id: newField.id, value: type === 'checkboxes' ? [] : '', type },
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

    const updateFieldValue = (id: string, value: any, type: FormFieldType) => {
        setFormData((prev) => {
            const existing = prev.find((f) => f.id === id);
            if (existing) {
                return prev.map((f) => (f.id === id ? { ...f, value } : f));
            } else {
                return [...prev, { id, value, type }];
            }
        });
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

    // Render fields with or without drag and drop
    const renderFields = () => {
        const fieldElements = fields.map((field, index) => {
            const value = formDataMap.get(field.id);
            return (
                <FieldCard
                    key={field.id ?? index}
                    field={field}
                    value={value}
                    setValue={(val) =>
                        updateFieldValue(field.id, val, field.type)
                    }
                    handleCheckboxChange={handleCheckboxChange}
                    onDelete={() => removeField(field.id)}
                    onUpdateField={updateField}
                    readonly={readonly}
                    answer={answer}
                />
            );
        });

        // If in answer mode or readonly, render without drag and drop
        if (answer || readonly) {
            return <div>{fieldElements}</div>;
        }

        // Otherwise, render with drag and drop functionality
        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={fields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {fieldElements}
                </SortableContext>
            </DndContext>
        );
    };

    return (
        <div className='max-w-2xl mx-auto p-6 bg-gray-50 dark:bg-background shadow-lg border-2 border-bg-primary min-h-screen relative rounded-lg'>
            {/* Header */}
            <Card className='mb-6 border-t-4 border-t-blue-600'>
                <CardHeader>
                    {answer ? (
                        <CardTitle>{title}</CardTitle>
                    ) : (
                        <Input
                            value={title ?? ''}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder='Form title'
                            className='md:text-3xl font-normal px-0 border-0 focus:ring-0 focus:border-0'
                            disabled={readonly}
                        />
                    )}
                    {answer ? (
                        <CardDescription>{description}</CardDescription>
                    ) : (
                        <Textarea
                            value={description ?? ''}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder='Form description'
                            className='mt-2 border-0 focus:ring-0 px-0 focus:border-0 resize-none'
                            disabled={readonly}
                        />
                    )}
                </CardHeader>
            </Card>

            {/* Fields */}
            {renderFields()}

            {!readonly && (
                <Fragment>
                    {/* Submit */}
                    <div className='flex justify-end mt-8'>
                        <Button
                            className='bg-blue-600 hover:bg-blue-700 text-white px-8'
                            onClick={() => {
                                onSubmit?.({
                                    title,
                                    description,
                                    fields,
                                    formData,
                                });
                            }}
                        >
                            Submit
                        </Button>
                    </div>

                    {/* Floating Action Menu */}
                    {!answer && <FabMenu addField={addField} />}
                </Fragment>
            )}
        </div>
    );
}
