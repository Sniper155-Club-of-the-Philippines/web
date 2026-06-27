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
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useHttp } from '@/hooks/http';
import { obrNicknameLock } from '@/lib/profile';
import { isAxiosError } from 'axios';
import { useAtom } from 'jotai';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type ProfileInputs = {
    rider_nickname: string;
    obr_nickname: string;
};

type ValidationResponse = {
    message?: string;
    errors?: Partial<Record<keyof ProfileInputs, string[]>>;
};

export default function MemberProfileForm() {
    const http = useHttp();
    const [user, setUser] = useAtom(userAtom);
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ProfileInputs>({
        defaultValues: {
            rider_nickname: user?.rider_nickname ?? '',
            obr_nickname: user?.obr_nickname ?? '',
        },
    });
    const obrLock = useMemo(
        () => obrNicknameLock(user?.obr_nickname_changed_at),
        [user?.obr_nickname_changed_at],
    );

    useEffect(() => {
        reset({
            rider_nickname: user?.rider_nickname ?? '',
            obr_nickname: user?.obr_nickname ?? '',
        });
    }, [reset, user?.obr_nickname, user?.rider_nickname]);

    const submit = handleSubmit(async (values) => {
        try {
            const { user: updatedUser } = await auth.updateProfile(http, {
                rider_nickname: values.rider_nickname.trim() || null,
                obr_nickname: values.obr_nickname.trim() || null,
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

    const obrDescription = obrLock.locked
        ? `Locked for ${obrLock.daysRemaining} more day${obrLock.daysRemaining === 1 ? '' : 's'}.`
        : user?.obr_nickname
          ? 'Available to change now. Saving a change starts a new 90-day lock.'
          : 'Optional. Your first OBR nickname can be set at any time.';

    return (
        <form onSubmit={submit} noValidate>
            <FieldGroup>
                <Field data-invalid={Boolean(errors.rider_nickname)}>
                    <FieldLabel htmlFor='rider-nickname'>
                        Rider nickname
                    </FieldLabel>
                    <Input
                        id='rider-nickname'
                        maxLength={255}
                        aria-invalid={Boolean(errors.rider_nickname)}
                        {...register('rider_nickname')}
                    />
                    <FieldDescription>
                        You can update this nickname at any time.
                    </FieldDescription>
                    <FieldError errors={[errors.rider_nickname]} />
                </Field>

                <Field
                    data-invalid={Boolean(errors.obr_nickname)}
                    data-disabled={obrLock.locked}
                >
                    <FieldLabel htmlFor='obr-nickname'>OBR nickname</FieldLabel>
                    <Input
                        id='obr-nickname'
                        maxLength={255}
                        disabled={obrLock.locked}
                        aria-invalid={Boolean(errors.obr_nickname)}
                        {...register('obr_nickname')}
                    />
                    <FieldDescription>{obrDescription}</FieldDescription>
                    <FieldError errors={[errors.obr_nickname]} />
                </Field>

                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting && (
                        <LoaderCircle
                            data-icon='inline-start'
                            className='animate-spin motion-reduce:animate-none'
                        />
                    )}
                    Save nicknames
                </Button>
            </FieldGroup>
        </form>
    );
}
