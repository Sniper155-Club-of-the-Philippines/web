'use client';

import { Controller, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { auth, role } from '@/api';
import { useHttp } from '@/hooks/http';
import { useEffect } from 'react';
import Select from '@/components/base/inputs/Select';
import MultiSelect from '@/components/base/inputs/MultiSelect';
import { UserFormInputs } from '@/types/form';
import { useChapterQuery } from '@/hooks/queries';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import SelectSearch from '@/components/base/inputs/SelectSearch';
import { BLOOD_TYPES } from '@/constants';

type Props = {
    defaultValues?: Partial<UserFormInputs>;
    onSubmit: (data: UserFormInputs) => void | Promise<void>;
    onCancel?: () => void;
    className?: string;
    // Region and role assignment are admin-only. The self-service settings
    // screen hides them so members cannot edit their own access.
    hideAccess?: boolean;
};

const UserForm = ({
    defaultValues,
    onSubmit,
    onCancel,
    className,
    hideAccess = false,
}: Props) => {
    const http = useHttp();
    const { register, handleSubmit, watch, setValue, reset, control } =
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

    const { data: regions } = useQuery({
        queryKey: ['regions'],
        queryFn: () => auth.regions(http),
    });

    const { data: roles } = useQuery({
        queryKey: ['roles'],
        queryFn: () => role.all(http),
    });

    const { data: chapters } = useChapterQuery(false);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div
                className={cn(
                    'space-y-2 py-6 max-h-[60vh] overflow-y-auto',
                    className,
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

                {/* Section: Access */}
                {!hideAccess && (
                    <div className='rounded-2xl border p-6 shadow-sm'>
                        <h3 className='text-lg font-semibold mb-4'>Access</h3>
                        <p className='text-sm text-muted-foreground mb-4'>
                            A temporary password is generated and shown once on
                            creation; write it down and hand it to the member
                            with their physical ID. They set their own on first
                            login.
                        </p>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                            <div className='flex flex-col gap-2'>
                                <Label htmlFor='region'>Region</Label>
                                <Controller
                                    name='region'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            width='w-full'
                                            onChange={(value) =>
                                                field.onChange(value)
                                            }
                                            value={field.value ?? undefined}
                                            options={regions ?? []}
                                        />
                                    )}
                                />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Label htmlFor='roles'>Roles</Label>
                                <Controller
                                    name='roles'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            value={field.value ?? []}
                                            onChange={(e) =>
                                                field.onChange(e.target.value)
                                            }
                                            options={
                                                roles?.map((r) => ({
                                                    value: r.name,
                                                    label: r.name,
                                                })) ?? []
                                            }
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                )}

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
                            <Label htmlFor='yclub_number'>YClub Number</Label>
                            <Input
                                {...register('yclub_number')}
                                id='yclub_number'
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='designation'>Designation</Label>
                            <Controller
                                name='designation'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        width='w-full'
                                        onChange={(value) =>
                                            field.onChange(value)
                                        }
                                        value={field.value ?? undefined}
                                        options={designations ?? []}
                                    />
                                )}
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='chapter_id'>Chapter</Label>
                            <Controller
                                name='chapter_id'
                                control={control}
                                render={({ field }) => (
                                    <SelectSearch
                                        onChange={(value) =>
                                            field.onChange(value)
                                        }
                                        value={field.value ?? undefined}
                                        options={
                                            chapters?.map((c) => ({
                                                value: c.id,
                                                label: c.name,
                                            })) ?? []
                                        }
                                    />
                                )}
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

                {/* Section: Club Info */}
                <div className='rounded-2xl border p-6 shadow-sm'>
                    <h3 className='text-lg font-semibold mb-4'>
                        Emergency Info
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                        {/* Blood Type */}
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='blood_type'>Blood Type</Label>
                            <Controller
                                name='blood_type'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        width='w-full'
                                        onChange={(value) =>
                                            field.onChange(value)
                                        }
                                        value={field.value ?? undefined}
                                        options={Object.values(BLOOD_TYPES).map(
                                            (type) => ({
                                                label: type,
                                                value: type,
                                            }),
                                        )}
                                    />
                                )}
                            />
                        </div>

                        {/* Allergy */}
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='allergy'>Allergy</Label>
                            <Input {...register('allergy')} id='allergy' />
                        </div>

                        {/* Emergency Contact Name */}
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='emergency_contact_name'>
                                Emergency Contact Name
                            </Label>
                            <Input
                                {...register('emergency_contact_name')}
                                id='emergency_contact_name'
                            />
                        </div>

                        {/* Emergency Contact Phone */}
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='emergency_contact_phone'>
                                Emergency Contact Phone
                            </Label>
                            <Input
                                {...register('emergency_contact_phone')}
                                id='emergency_contact_phone'
                                type='tel'
                            />
                        </div>
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
