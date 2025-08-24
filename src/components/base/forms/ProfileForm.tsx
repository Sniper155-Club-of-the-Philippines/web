'use client';

import { Controller, useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { ProfileFormInputs } from '@/types/form';
import SelectSearch from '@/components/base/inputs/SelectSearch';
import { useProfileQuery, useUserQuery } from '@/hooks/queries';

type Props = {
    defaultValues?: Partial<ProfileFormInputs>;
    onSubmit: (data: ProfileFormInputs) => void | Promise<void>;
    onCancel?: () => void;
};

const ProfileForm = ({ defaultValues, onSubmit, onCancel }: Props) => {
    const { handleSubmit, reset, control } = useForm<ProfileFormInputs>({
        defaultValues,
    });
    const { data: profiles } = useProfileQuery();
    const { data: users } = useUserQuery();
    const profileData = profiles?.map((profile) => profile.user_id);
    const options =
        users
            ?.filter((user) => !profileData?.includes(user.id))
            .map((user) => ({
                label: `${user.last_name}, ${user.first_name}`,
                value: user.id,
            })) ?? [];

    // reset when editing a different profile
    useEffect(() => {
        if (defaultValues) reset(defaultValues);
    }, [defaultValues, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className='grid gap-4 py-4'>
                {/* Member */}
                <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                    <Label htmlFor='name' className='text-right'>
                        Member
                    </Label>
                    <div className='md:col-span-3'>
                        <Controller
                            name='user_id'
                            control={control}
                            render={({ field }) => (
                                <SelectSearch
                                    id='name'
                                    onChange={(e) =>
                                        field.onChange(e.target.value)
                                    }
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                    value={field.value}
                                    options={options}
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

export default ProfileForm;
