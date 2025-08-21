'use client';

import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { auth, chapter } from '@/api';
import { useHttp } from '@/hooks/http';
import { useEffect } from 'react';
import Select from '@/components/base/inputs/Select';
import { UserFormInputs } from '@/types/form';

type Props = {
    defaultValues?: Partial<UserFormInputs>;
    onSubmit: (data: UserFormInputs) => void | Promise<void>;
    onCancel?: () => void;
};

const UserForm = ({ defaultValues, onSubmit, onCancel }: Props) => {
    const http = useHttp();
    const { register, handleSubmit, watch, setValue, reset } =
        useForm<UserFormInputs>({
            defaultValues,
        });

    // refetch when defaultValues change (edit case)
    useEffect(() => {
        if (defaultValues) reset(defaultValues);
    }, [defaultValues, reset]);

    const { data: designations } = useQuery({
        queryKey: ['designations'],
        queryFn: () => auth.designations(http),
    });

    const { data: chapters } = useQuery({
        queryKey: ['chapters'],
        queryFn: () => chapter.all(http),
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className='grid gap-4 py-10 md:py-4 max-h-[500px] overflow-x-auto md:max-h-none md:overflow-x-hidden'>
                {/* First Name */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label htmlFor='first_name' className='text-right'>
                        First Name
                    </Label>
                    <Input
                        {...register('first_name')}
                        id='first_name'
                        name='first_name'
                        className='md:col-span-3'
                    />
                </div>

                {/* Last Name */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label htmlFor='last_name' className='text-right'>
                        Last Name
                    </Label>
                    <Input
                        {...register('last_name')}
                        id='last_name'
                        name='last_name'
                        className='md:col-span-3'
                    />
                </div>

                {/* Email */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label htmlFor='email' className='text-right'>
                        Email
                    </Label>
                    <Input
                        {...register('email')}
                        id='email'
                        name='email'
                        type='email'
                        className='md:col-span-3'
                    />
                </div>

                {/* Password */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label htmlFor='password' className='text-right'>
                        Password
                    </Label>
                    <Input
                        {...register('password')}
                        id='password'
                        name='password'
                        type='password'
                        className='md:col-span-3'
                    />
                </div>

                {/* Confirm Password */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label
                        htmlFor='password_confirmation'
                        className='text-right'
                    >
                        Confirm Password
                    </Label>
                    <Input
                        {...register('password_confirmation')}
                        id='password_confirmation'
                        name='password_confirmation'
                        type='password'
                        className='md:col-span-3'
                    />
                </div>

                {/* Club Number */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label htmlFor='club_number' className='text-right'>
                        Club Number
                    </Label>
                    <Input
                        {...register('club_number')}
                        id='club_number'
                        name='club_number'
                        type='text'
                        className='md:col-span-3'
                    />
                </div>

                {/* Designation */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label htmlFor='designation' className='text-right'>
                        Designation
                    </Label>
                    <div className='md:col-span-3'>
                        <Select
                            width='w-full'
                            onChange={(value) =>
                                setValue('designation', value ?? null)
                            }
                            value={watch('designation') ?? undefined}
                            options={designations ?? []}
                        />
                    </div>
                </div>

                {/* Chapter */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label htmlFor='chapter_id' className='text-right'>
                        Chapter
                    </Label>
                    <div className='md:col-span-3'>
                        <Select
                            width='w-full'
                            onChange={(value) =>
                                setValue('chapter_id', value ?? null)
                            }
                            value={watch('chapter_id') ?? undefined}
                            options={
                                chapters?.map((c) => ({
                                    value: c.id,
                                    label: c.name,
                                })) ?? []
                            }
                        />
                    </div>
                </div>

                {/* Photo */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 max-h-[36px]'>
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
            </div>

            <div className='flex justify-end gap-2 mt-10 md:mt-0'>
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

export default UserForm;
