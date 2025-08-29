'use client';

import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { auth } from '@/api';
import { useHttp } from '@/hooks/http';
import { useEffect } from 'react';
import Select from '@/components/base/inputs/Select';
import { UserFormInputs } from '@/types/form';
import { useChapterQuery } from '@/hooks/queries';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type Props = {
    defaultValues?: Partial<UserFormInputs>;
    onSubmit: (data: UserFormInputs) => void | Promise<void>;
    onCancel?: () => void;
    className?: string;
};

const UserForm = ({ defaultValues, onSubmit, onCancel, className }: Props) => {
    const http = useHttp();
    const { register, handleSubmit, watch, setValue, reset } =
        useForm<UserFormInputs>({
            defaultValues,
        });

    useEffect(() => {
        if (defaultValues) reset(defaultValues);
    }, [defaultValues, reset]);

    const { data: designations } = useQuery({
        queryKey: ['designations'],
        queryFn: () => auth.designations(http),
    });

    const { data: chapters } = useChapterQuery(false);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div
                className={cn(
                    'space-y-2 py-6 max-h-[60vh] overflow-y-auto',
                    className
                )}
            >
                {/* Section: Basic Info */}
                <div className='rounded-2xl border p-6 shadow-sm'>
                    <h3 className='text-lg font-semibold mb-4'>
                        Basic Information
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='first_name'>First Name</Label>
                            <Input
                                {...register('first_name')}
                                id='first_name'
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='last_name'>Last Name</Label>
                            <Input {...register('last_name')} id='last_name' />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='email'>Email</Label>
                            <Input
                                {...register('email')}
                                id='email'
                                type='email'
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='phone'>Contact</Label>
                            <Input
                                {...register('phone')}
                                id='phone'
                                type='tel'
                            />
                        </div>
                        <div className='md:col-span-2 flex flex-col gap-2'>
                            <Label htmlFor='address'>Address</Label>
                            <Input
                                {...register('address')}
                                id='address'
                                type='text'
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Credentials */}
                <div className='rounded-2xl border p-6 shadow-sm'>
                    <h3 className='text-lg font-semibold mb-4'>Credentials</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='password'>Password</Label>
                            <Input
                                {...register('password')}
                                id='password'
                                type='password'
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='password_confirmation'>
                                Confirm Password
                            </Label>
                            <Input
                                {...register('password_confirmation')}
                                id='password_confirmation'
                                type='password'
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Club Info */}
                <div className='rounded-2xl border p-6 shadow-sm'>
                    <h3 className='text-lg font-semibold mb-4'>Club Info</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='club_number'>Club Number</Label>
                            <Input
                                {...register('club_number')}
                                id='club_number'
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='designation'>Designation</Label>
                            <Select
                                width='w-full'
                                onChange={(value) =>
                                    setValue('designation', value ?? null)
                                }
                                value={watch('designation') ?? undefined}
                                options={designations ?? []}
                            />
                        </div>
                        <div className='md:col-span-2 flex flex-col gap-2'>
                            <Label htmlFor='chapter_id'>Chapter</Label>
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
                </div>

                {/* Section: Profile Photo */}
                <div className='rounded-2xl border p-6 shadow-sm'>
                    <h3 className='text-lg font-semibold mb-4'>
                        Profile Photo
                    </h3>
                    <div className='flex items-center gap-2'>
                        <Input
                            id='photo'
                            type='file'
                            accept='image/*'
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                setValue('photo', file);
                            }}
                        />
                        {watch('photo') && (
                            <Avatar className='w-16 h-16'>
                                <AvatarImage
                                    src={URL.createObjectURL(watch('photo')!)}
                                    alt='Preview'
                                />
                            </Avatar>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
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

export default UserForm;
