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
import type { User } from '@/types/models/user';
import { isAxiosError } from 'axios';
import { useSetAtom } from 'jotai';
import { LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type PasswordInputs = {
    current_password: string;
    password: string;
    password_confirmation: string;
};

type ValidationResponse = {
    message?: string;
    errors?: Partial<Record<keyof PasswordInputs, string[]>>;
};

export default function ChangePasswordForm({
    onSuccess,
}: {
    onSuccess?: (user: User) => void;
}) {
    const http = useHttp();
    const setUser = useSetAtom(userAtom);
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<PasswordInputs>();

    const submit = handleSubmit(async (payload) => {
        try {
            const { user } = await auth.changePassword(http, payload);
            setUser(user);
            reset();
            toast.success('Password updated');
            onSuccess?.(user);
        } catch (error) {
            if (isAxiosError<ValidationResponse>(error)) {
                const response = error.response?.data;

                for (const [field, messages] of Object.entries(
                    response?.errors ?? {},
                )) {
                    const message = messages?.[0];
                    if (message) {
                        setError(field as keyof PasswordInputs, { message });
                    }
                }

                toast.error(response?.message ?? 'Unable to update password');
                return;
            }

            console.error(error);
            toast.error('Unable to update password');
        }
    });

    return (
        <form onSubmit={submit} noValidate>
            <FieldGroup>
                <Field data-invalid={Boolean(errors.current_password)}>
                    <FieldLabel htmlFor='current-password'>
                        Current password
                    </FieldLabel>
                    <Input
                        id='current-password'
                        type='password'
                        autoComplete='current-password'
                        aria-invalid={Boolean(errors.current_password)}
                        {...register('current_password', {
                            required: 'Enter your current password.',
                        })}
                    />
                    <FieldError errors={[errors.current_password]} />
                </Field>

                <Field data-invalid={Boolean(errors.password)}>
                    <FieldLabel htmlFor='new-password'>New password</FieldLabel>
                    <Input
                        id='new-password'
                        type='password'
                        autoComplete='new-password'
                        aria-invalid={Boolean(errors.password)}
                        {...register('password', {
                            required: 'Enter a new password.',
                            minLength: {
                                value: 8,
                                message: 'Use at least 8 characters.',
                            },
                        })}
                    />
                    <FieldDescription>
                        Use at least 8 characters and avoid reused passwords.
                    </FieldDescription>
                    <FieldError errors={[errors.password]} />
                </Field>

                <Field data-invalid={Boolean(errors.password_confirmation)}>
                    <FieldLabel htmlFor='confirm-password'>
                        Confirm new password
                    </FieldLabel>
                    <Input
                        id='confirm-password'
                        type='password'
                        autoComplete='new-password'
                        aria-invalid={Boolean(errors.password_confirmation)}
                        {...register('password_confirmation', {
                            required: 'Confirm your new password.',
                            validate: (value, values) =>
                                value === values.password ||
                                'Passwords do not match.',
                        })}
                    />
                    <FieldError errors={[errors.password_confirmation]} />
                </Field>

                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting && (
                        <LoaderCircle
                            data-icon='inline-start'
                            className='animate-spin motion-reduce:animate-none'
                        />
                    )}
                    Update password
                </Button>
            </FieldGroup>
        </form>
    );
}
