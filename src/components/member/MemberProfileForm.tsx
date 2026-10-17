'use client';

import { auth } from '@/api';
import { userAtom } from '@/atoms/auth';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useHttp } from '@/hooks/http';
import {
    formatUnlockDate,
    OBR_LOCK_MONTHS,
    profileLock,
    ProfileLockState,
    RIDER_LOCK_MONTHS,
} from '@/lib/profile';
import { SIZES } from '@/lib/sizes';
import type { User } from '@/types/models/user';
import { isAxiosError } from 'axios';
import { useAtom } from 'jotai';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

type ProfileInputs = {
    rider_nickname: string;
    rider_size: string;
    obr_full_name: string;
    obr_nickname: string;
    obr_size: string;
};

type ValidationResponse = {
    message?: string;
    errors?: Partial<Record<keyof ProfileInputs, string[]>>;
};

function toInputs(user: User | null): ProfileInputs {
    return {
        rider_nickname: user?.rider_nickname ?? '',
        rider_size: user?.rider_size ?? '',
        obr_full_name: user?.obr_full_name ?? '',
        obr_nickname: user?.obr_nickname ?? '',
        obr_size: user?.obr_size ?? '',
    };
}

/**
 * Helper text for a locked group. Filled-in fields are locked; empty ones can
 * still be filled in.
 */
function lockDescription(
    lock: ProfileLockState,
    months: number,
    hasValue: boolean,
    lockedSubject = 'Locked',
): string {
    if (lock.locked && lock.unlockAt) {
        return `${lockedSubject} until ${formatUnlockDate(lock.unlockAt)}.`;
    }

    return hasValue
        ? `Available to change now. Saving a change locks it for ${months} months.`
        : `Locks for ${months} months once saved.`;
}

export default function MemberProfileForm() {
    const http = useHttp();
    const [user, setUser] = useAtom(userAtom);
    const {
        register,
        control,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ProfileInputs>({ defaultValues: toInputs(user) });
    const riderLock = useMemo(
        () => profileLock(user?.rider_nickname_changed_at, RIDER_LOCK_MONTHS),
        [user?.rider_nickname_changed_at],
    );
    const obrLock = useMemo(
        () => profileLock(user?.obr_changed_at, OBR_LOCK_MONTHS),
        [user?.obr_changed_at],
    );
    const riderNicknameLocked = riderLock.locked && !!user?.rider_nickname;
    const obrLocked = {
        obr_full_name: obrLock.locked && !!user?.obr_full_name,
        obr_nickname: obrLock.locked && !!user?.obr_nickname,
        obr_size: obrLock.locked && !!user?.obr_size,
    };
    const hasObrDetails = Boolean(
        user?.obr_full_name || user?.obr_nickname || user?.obr_size,
    );

    useEffect(() => {
        reset(toInputs(user));
    }, [reset, user]);

    const submit = handleSubmit(async (values) => {
        try {
            const { user: updatedUser } = await auth.updateProfile(http, {
                rider_nickname: values.rider_nickname.trim() || null,
                rider_size: values.rider_size || null,
                obr_full_name: values.obr_full_name.trim() || null,
                obr_nickname: values.obr_nickname.trim() || null,
                obr_size: values.obr_size || null,
            });
            setUser(updatedUser);
            toast.success('Profile updated');
        } catch (error) {
            if (isAxiosError<ValidationResponse>(error)) {
                const response = error.response?.data;

                for (const [field, messages] of Object.entries(
                    response?.errors ?? {},
                )) {
                    const message = messages?.[0];
                    if (message) {
                        setError(field as keyof ProfileInputs, { message });
                    }
                }

                toast.error(response?.message ?? 'Unable to update profile');
                return;
            }

            console.error(error);
            toast.error('Unable to update profile');
        }
    });

    return (
        <form onSubmit={submit} noValidate>
            <FieldGroup>
                <FieldSet>
                    <FieldLegend>Rider</FieldLegend>
                    <FieldGroup>
                        <Field
                            data-invalid={Boolean(errors.rider_nickname)}
                            data-disabled={riderNicknameLocked}
                        >
                            <FieldLabel htmlFor='rider-nickname'>
                                Nickname
                            </FieldLabel>
                            <Input
                                id='rider-nickname'
                                maxLength={255}
                                disabled={riderNicknameLocked}
                                aria-invalid={Boolean(errors.rider_nickname)}
                                {...register('rider_nickname')}
                            />
                            <FieldDescription>
                                {lockDescription(
                                    riderLock,
                                    RIDER_LOCK_MONTHS,
                                    !!user?.rider_nickname,
                                )}
                            </FieldDescription>
                            <FieldError errors={[errors.rider_nickname]} />
                        </Field>

                        <Field data-invalid={Boolean(errors.rider_size)}>
                            <FieldLabel htmlFor='rider-size'>Size</FieldLabel>
                            <Controller
                                control={control}
                                name='rider_size'
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger
                                            id='rider-size'
                                            className='w-full'
                                            aria-invalid={Boolean(
                                                errors.rider_size,
                                            )}
                                        >
                                            <SelectValue placeholder='Select size' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SIZES.map((size) => (
                                                <SelectItem
                                                    key={size}
                                                    value={size}
                                                >
                                                    {size}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FieldDescription>
                                You can update your size at any time.
                            </FieldDescription>
                            <FieldError errors={[errors.rider_size]} />
                        </Field>
                    </FieldGroup>
                </FieldSet>

                <FieldSeparator />

                <FieldSet>
                    <FieldLegend>OBR</FieldLegend>
                    <FieldDescription>
                        {lockDescription(
                            obrLock,
                            OBR_LOCK_MONTHS,
                            hasObrDetails,
                            'Filled-in details are locked',
                        )}
                    </FieldDescription>
                    <FieldGroup>
                        <Field
                            data-invalid={Boolean(errors.obr_full_name)}
                            data-disabled={obrLocked.obr_full_name}
                        >
                            <FieldLabel htmlFor='obr-full-name'>
                                Full name
                            </FieldLabel>
                            <Input
                                id='obr-full-name'
                                maxLength={255}
                                disabled={obrLocked.obr_full_name}
                                aria-invalid={Boolean(errors.obr_full_name)}
                                {...register('obr_full_name')}
                            />
                            <FieldError errors={[errors.obr_full_name]} />
                        </Field>

                        <Field
                            data-invalid={Boolean(errors.obr_nickname)}
                            data-disabled={obrLocked.obr_nickname}
                        >
                            <FieldLabel htmlFor='obr-nickname'>
                                Nickname
                            </FieldLabel>
                            <Input
                                id='obr-nickname'
                                maxLength={255}
                                disabled={obrLocked.obr_nickname}
                                aria-invalid={Boolean(errors.obr_nickname)}
                                {...register('obr_nickname')}
                            />
                            <FieldError errors={[errors.obr_nickname]} />
                        </Field>

                        <Field
                            data-invalid={Boolean(errors.obr_size)}
                            data-disabled={obrLocked.obr_size}
                        >
                            <FieldLabel htmlFor='obr-size'>Size</FieldLabel>
                            <Controller
                                control={control}
                                name='obr_size'
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={obrLocked.obr_size}
                                    >
                                        <SelectTrigger
                                            id='obr-size'
                                            className='w-full'
                                            aria-invalid={Boolean(
                                                errors.obr_size,
                                            )}
                                        >
                                            <SelectValue placeholder='Select size' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SIZES.map((size) => (
                                                <SelectItem
                                                    key={size}
                                                    value={size}
                                                >
                                                    {size}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FieldError errors={[errors.obr_size]} />
                        </Field>
                    </FieldGroup>
                </FieldSet>

                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting && (
                        <LoaderCircle
                            data-icon='inline-start'
                            className='animate-spin motion-reduce:animate-none'
                        />
                    )}
                    Save details
                </Button>
            </FieldGroup>
        </form>
    );
}
