'use client';

import { Controller, useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { EventFormInputs } from '@/types/form';
import { Textarea } from '@/components/ui/textarea';
import DatePicker from '@/components/ui/date-picker';

type Props = {
    defaultValues?: Partial<EventFormInputs>;
    onSubmit: (data: EventFormInputs) => void | Promise<void>;
    onCancel?: () => void;
};

const EventForm = ({ defaultValues, onSubmit, onCancel }: Props) => {
    const { register, handleSubmit, reset, control } = useForm<EventFormInputs>(
        {
            defaultValues,
        }
    );

    // reset when editing a different event
    useEffect(() => {
        if (defaultValues) reset(defaultValues);
    }, [defaultValues, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='h-full'>
            <div className='grid gap-4 p-4 max-h-[600px] overflow-x-auto'>
                {/* Title */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label htmlFor='title' className='text-right'>
                        Name
                    </Label>
                    <Input
                        {...register('title')}
                        id='title'
                        name='title'
                        className='md:col-span-3'
                    />
                </div>

                {/* Description */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-start gap-4'>
                    <Label htmlFor='description' className='text-right'>
                        Description
                    </Label>
                    <Textarea
                        {...register('description')}
                        id='description'
                        name='description'
                        className='md:col-span-3'
                    />
                </div>

                {/* Start */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label htmlFor='start' className='text-right'>
                        Start Date
                    </Label>
                    <div className='md:col-span-3'>
                        <Controller
                            name='start'
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    id='start'
                                    placeholder='Start Date'
                                    value={field.value}
                                    onChange={(e) =>
                                        field.onChange(e.target.value)
                                    }
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                />
                            )}
                        />
                    </div>
                </div>

                {/* End */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label htmlFor='end' className='text-right'>
                        End Date
                    </Label>
                    <div className='md:col-span-3'>
                        <Controller
                            name='end'
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    id='end'
                                    placeholder='End Date'
                                    value={field.value}
                                    onChange={(e) =>
                                        field.onChange(e.target.value)
                                    }
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className='flex justify-end gap-2 mt-6'>
                {onCancel && (
                    <Button type='button' variant='outline' onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type='submit'>Save</Button>
            </div>
        </form>
    );
};

export default EventForm;
