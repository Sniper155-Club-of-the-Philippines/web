'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import DatePicker from '@/components/ui/date-picker';
import TimePicker from '@/components/base/inputs/TimePicker';
import DateTimePicker from '@/components/base/inputs/DateTimePicker';
import { Trash2, Plus } from 'lucide-react';
import dayjs from 'dayjs';
import { CheckedState } from '@radix-ui/react-checkbox';
import SortableField from '@/components/base/forms/form-builder/SortableField';

interface FieldOption {
    value: string;
    label: string;
}

interface Field {
    id: string;
    label: string;
    type: string;
    options?: FieldOption[];
}

export default function FieldCard({
    field,
    value,
    setValue,
    handleCheckboxChange,
    onDelete,
    onUpdateField,
}: {
    field: Field;
    value: any;
    setValue: (val: any) => void;
    handleCheckboxChange: (
        fieldId: string,
        value: string,
        checked: CheckedState
    ) => void;
    onDelete: () => void;
    onUpdateField: (id: string, updated: Partial<Field>) => void;
}) {
    // Add option
    const addOption = () => {
        const newOpt: FieldOption = {
            value: `option-${Date.now()}`,
            label: `Option ${field.options ? field.options.length + 1 : 1}`,
        };
        onUpdateField(field.id, {
            options: [...(field.options || []), newOpt],
        });
    };

    // Update option label
    const updateOption = (idx: number, newLabel: string) => {
        if (!field.options) return;
        const newOpts = [...field.options];
        newOpts[idx] = { ...newOpts[idx], label: newLabel };
        onUpdateField(field.id, { options: newOpts });
    };

    // Delete option
    const deleteOption = (idx: number) => {
        if (!field.options) return;
        const newOpts = field.options.filter((_, i) => i !== idx);
        onUpdateField(field.id, { options: newOpts });
    };

    return (
        <SortableField id={field.id}>
            <Card key={field.id} className='mb-4 relative'>
                {/* Delete field button */}
                <button
                    onClick={onDelete}
                    className='absolute top-2 right-2 text-gray-400 hover:text-red-600 hover:cursor-pointer'
                >
                    <Trash2 className='w-4 h-4' />
                </button>

                <CardContent className='pt-6'>
                    {/* Field label */}
                    <Input
                        value={field.label}
                        onChange={(e) =>
                            onUpdateField(field.id, { label: e.target.value })
                        }
                        className='mb-3 font-medium'
                    />

                    {/* Render field types */}
                    {field.type === 'text' && (
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder='Your answer'
                            className='border-0 border-b border-gray-300 rounded-none px-0 focus:border-blue-600 focus:ring-0'
                        />
                    )}

                    {field.type === 'paragraph' && (
                        <Textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder='Your answer'
                            className='min-h-[100px] resize-none border-0 border-b border-gray-300 rounded-none px-0 focus:border-blue-600 focus:ring-0'
                        />
                    )}

                    {['multiple_choice', 'checkboxes', 'dropdown'].includes(
                        field.type
                    ) && (
                        <div className='space-y-2 mt-2'>
                            {field.options?.map((opt, idx) => (
                                <div
                                    key={opt.value}
                                    className='flex items-center gap-2'
                                >
                                    {field.type === 'multiple_choice' && (
                                        <RadioGroup
                                            value={value}
                                            onValueChange={(val) =>
                                                setValue(val)
                                            }
                                        >
                                            <RadioGroupItem
                                                value={opt.value}
                                                id={opt.value}
                                            />
                                        </RadioGroup>
                                    )}

                                    {field.type === 'checkboxes' && (
                                        <Checkbox
                                            id={opt.value}
                                            checked={value?.includes(opt.value)}
                                            onCheckedChange={(checked) =>
                                                handleCheckboxChange(
                                                    field.id,
                                                    opt.value,
                                                    checked
                                                )
                                            }
                                        />
                                    )}

                                    {field.type === 'dropdown' && (
                                        <span className='text-sm text-gray-500'>
                                            •
                                        </span>
                                    )}

                                    {/* Editable option label */}
                                    <Input
                                        value={opt.label}
                                        onChange={(e) =>
                                            updateOption(idx, e.target.value)
                                        }
                                        className='flex-1'
                                    />
                                    <Button
                                        size='icon'
                                        variant='ghost'
                                        onClick={() => deleteOption(idx)}
                                    >
                                        <Trash2 className='w-4 h-4 text-gray-500' />
                                    </Button>
                                </div>
                            ))}

                            {/* Add option button */}
                            <Button
                                size='sm'
                                variant='outline'
                                className='mt-2'
                                onClick={addOption}
                            >
                                <Plus className='w-4 h-4 mr-1' /> Add option
                            </Button>
                        </div>
                    )}

                    {field.type === 'date' && (
                        <DatePicker
                            value={value}
                            onChange={(val) => setValue(val)}
                            className='w-full'
                        />
                    )}

                    {field.type === 'time' && (
                        <TimePicker
                            value={
                                dayjs(value).isValid()
                                    ? dayjs(value).toDate()
                                    : undefined
                            }
                            onChange={(e) => setValue(dayjs(e).toJSON())}
                            placeholder='Select Time'
                        />
                    )}

                    {field.type === 'datetime' && (
                        <DateTimePicker
                            value={
                                dayjs(value).isValid()
                                    ? dayjs(value).toDate()
                                    : undefined
                            }
                            onChange={(e) => setValue(dayjs(e).toJSON())}
                        />
                    )}
                </CardContent>
            </Card>
        </SortableField>
    );
}
