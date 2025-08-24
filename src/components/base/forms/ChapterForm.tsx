'use client';

import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { ChapterFormInputs } from '@/types/form';

type Props = {
    defaultValues?: Partial<ChapterFormInputs>;
    onSubmit: (data: ChapterFormInputs) => void | Promise<void>;
    onCancel?: () => void;
};

const ChapterForm = ({ defaultValues, onSubmit, onCancel }: Props) => {
    const { register, handleSubmit, setValue, reset } =
        useForm<ChapterFormInputs>({
            defaultValues,
        });

    // reset when editing a different chapter
    useEffect(() => {
        if (defaultValues) reset(defaultValues);
    }, [defaultValues, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className='grid gap-4 py-4'>
                {/* Name */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label htmlFor='name' className='text-right'>
                        Name
                    </Label>
                    <Input
                        {...register('name')}
                        id='name'
                        name='name'
                        className='md:col-span-3'
                    />
                </div>

                {/* Photo */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label htmlFor='photo' className='text-right'>
                        Photo
                    </Label>
                    <div className='md:col-span-3'>
                        <Input
                            id='photo'
                            type='file'
                            accept='image/*'
                            name='photo'
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                setValue('photo', file);
                            }}
                        />
                    </div>
                </div>

                {/* Page URL */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label htmlFor='page_url' className='text-right'>
                        Page URL
                    </Label>
                    <Input
                        {...register('page_url')}
                        id='page_url'
                        type='url'
                        name='page_url'
                        className='md:col-span-3'
                    />
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

export default ChapterForm;
