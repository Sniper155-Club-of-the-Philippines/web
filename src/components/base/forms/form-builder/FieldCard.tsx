'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import DatePicker from '@/components/ui/date-picker';
import TimePicker from '@/components/base/inputs/TimePicker';
import DateTimePicker from '@/components/base/inputs/DateTimePicker';
import { Trash2, Plus } from 'lucide-react';
import dayjs from 'dayjs';
import { CheckedState } from '@radix-ui/react-checkbox';
import SortableField from '@/components/base/forms/form-builder/SortableField';
import type { FormFieldType } from '@/types/models/form-field';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { parseTime } from '@/lib/date';

interface FieldOption {
    id: string;
    value: string;
    label: string;
}

interface Field {
    id: string;
    label: string;
    type: FormFieldType;
    options?: FieldOption[];
}

export default function FieldCard({
    field,
    value,
    setValue,
    handleCheckboxChange,
    onDelete,
    onUpdateField,
    disabled = false,
    readonly = false,
    answer = false,
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
    disabled?: boolean;
    readonly?: boolean;
    answer?: boolean;
}) {
    // Add option
    const addOption = () => {
        const id = `option-${Date.now()}`;
        const newOpt: FieldOption = {
            value: id,
            label: `Option ${field.options ? field.options.length + 1 : 1}`,
            id,
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

    // Render option fields for builder mode
    const renderOptionBuilder = () => {
        if (
            !['multiple_choice', 'checkboxes', 'dropdown'].includes(field.type)
        ) {
            return null;
        }

        return (
            <div className='space-y-2 mt-2'>
                {field.options?.map((opt, idx) => (
                    <div key={opt.value} className='flex items-center gap-2'>
                        {field.type === 'multiple_choice' && (
                            <div className='w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center'>
                                <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                            </div>
                        )}

                        {field.type === 'checkboxes' && (
                            <div className='w-4 h-4 border border-gray-300 rounded flex items-center justify-center'>
                                <div className='w-2 h-2 bg-gray-300'></div>
                            </div>
                        )}

                        {field.type === 'dropdown' && (
                            <span className='text-sm text-gray-500 ml-1'>
                                •
                            </span>
                        )}

                        {/* Editable option label */}
                        <Input
                            value={opt.label ?? ''}
                            onChange={(e) => updateOption(idx, e.target.value)}
                            className='flex-1'
                            disabled={readonly}
                            placeholder='Option text'
                        />
                        {!readonly && (
                            <Button
                                size='icon'
                                variant='ghost'
                                onClick={() => deleteOption(idx)}
                                type='button'
                            >
                                <Trash2 className='w-4 h-4 text-gray-500' />
                            </Button>
                        )}
                    </div>
                ))}

                {!readonly && (
                    <Button
                        size='sm'
                        variant='outline'
                        className='mt-2'
                        onClick={addOption}
                        type='button'
                    >
                        <Plus className='w-4 h-4 mr-1' /> Add option
                    </Button>
                )}
            </div>
        );
    };

    // Render interactive fields for answer mode
    const renderAnswerField = () => {
        switch (field.type) {
            case 'text':
                return (
                    <Input
                        value={value ?? ''}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder='Your answer'
                        className='border-0 border-b border-gray-300 rounded-none focus:border-blue-600 focus:ring-0'
                        disabled={disabled || readonly}
                    />
                );

            case 'paragraph':
                return (
                    <Textarea
                        value={value ?? ''}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder='Your answer'
                        className='min-h-[100px] resize-none border-0 border-b border-gray-300 rounded-none focus:border-blue-600 focus:ring-0'
                        disabled={disabled || readonly}
                    />
                );

            case 'multiple_choice':
                return (
                    <>
                        <RadioGroup
                            value={value ?? ''}
                            onValueChange={(val) => setValue(val)}
                            disabled={disabled || readonly}
                            className='space-y-2'
                        >
                            {field.options?.map((opt) => (
                                <div
                                    key={opt.value}
                                    className='flex items-center space-x-2'
                                >
                                    <RadioGroupItem
                                        value={answer ? opt.id : opt.value}
                                        id={
                                            answer
                                                ? opt.id
                                                : `${field.id}-${opt.value}`
                                        }
                                        disabled={disabled || readonly}
                                    />
                                    <Label
                                        htmlFor={
                                            answer
                                                ? opt.id
                                                : `${field.id}-${opt.value}`
                                        }
                                        className={cn(
                                            'cursor-pointer',
                                            disabled || readonly
                                                ? 'cursor-not-allowed opacity-50'
                                                : ''
                                        )}
                                    >
                                        {opt.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </>
                );

            case 'checkboxes':
                return (
                    <div className='space-y-2'>
                        {field.options?.map((opt) => (
                            <div
                                key={opt.id}
                                className='flex items-center space-x-2'
                            >
                                <Checkbox
                                    id={`${field.id}-${opt.value}`}
                                    checked={
                                        value?.includes(
                                            answer ? opt.id : opt.value
                                        ) || false
                                    }
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange(
                                            field.id,
                                            answer ? opt.id : opt.value,
                                            checked
                                        )
                                    }
                                    disabled={disabled || readonly}
                                />
                                <Label
                                    htmlFor={`${field.id}-${opt.value}`}
                                    className='cursor-pointer'
                                >
                                    {opt.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                );

            case 'dropdown':
                return (
                    <Select
                        value={value ?? ''}
                        onValueChange={(val) => setValue(val)}
                        disabled={disabled || readonly}
                    >
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Choose an option' />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map((opt) => (
                                <SelectItem
                                    key={opt.value}
                                    value={answer ? opt.id : opt.value}
                                >
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'date':
                return (
                    <DatePicker
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        className='w-full'
                        disabled={disabled || readonly}
                    />
                );

            case 'time':
                return (
                    <TimePicker
                        value={parseTime(value)}
                        onChange={(e) => setValue(dayjs(e).toJSON())}
                        placeholder='Select Time'
                        disabled={disabled || readonly}
                    />
                );

            case 'datetime':
                return (
                    <DateTimePicker
                        value={
                            value && dayjs(value).isValid()
                                ? dayjs(value).toDate()
                                : undefined
                        }
                        onChange={(e) => setValue(dayjs(e).toJSON())}
                        disabled={disabled || readonly}
                    />
                );

            default:
                return null;
        }
    };

    const cardContent = (
        <Card key={field.id} className='mb-4 relative'>
            {!readonly && !answer && (
                <button
                    onClick={onDelete}
                    className='absolute top-2 right-2 text-gray-400 hover:text-red-600 hover:cursor-pointer z-10'
                    type='button'
                >
                    <Trash2 className='w-4 h-4' />
                </button>
            )}

            <CardContent className='pt-6'>
                {/* Field label */}
                {answer ? (
                    <Label className='block mb-3 text-sm font-medium'>
                        {field.label}
                    </Label>
                ) : (
                    <Input
                        value={field.label ?? ''}
                        onChange={(e) =>
                            onUpdateField(field.id, {
                                label: e.target.value,
                            })
                        }
                        className='mb-3 font-medium border-0 border-b border-gray-300 rounded-none px-0 focus:border-blue-600 focus:ring-0'
                        disabled={readonly}
                        placeholder='Question'
                    />
                )}

                {/* Render fields based on mode */}
                {answer ? renderAnswerField() : renderOptionBuilder()}
            </CardContent>
        </Card>
    );

    // Only wrap with SortableField if not in answer mode or readonly mode
    if (answer || readonly) {
        return cardContent;
    }

    return <SortableField id={field.id}>{cardContent}</SortableField>;
}
