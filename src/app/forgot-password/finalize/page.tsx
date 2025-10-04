'use client';

import { forgotPassword } from '@/api';
import { forgotPasswordAtom } from '@/atoms/forgot-password';
import { loadingAtom } from '@/atoms/misc';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHttp } from '@/hooks/http';
import { isAxiosError } from 'axios';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

type Inputs = {
    password: string;
    password_confirmation: string;
};

export default function FinalizeForgotPasswordPage() {
    const { register, handleSubmit } = useForm<Inputs>();
    const http = useHttp();
    const [loading, setLoading] = useAtom(loadingAtom);
    const [forgotPasswordData] = useAtom(forgotPasswordAtom);
    const router = useRouter();

    const onSubmit: SubmitHandler<Inputs> = async (values) => {
        if (!forgotPasswordData) {
            router.back();
            return;
        }

        setLoading(true);
        try {
            await forgotPassword.finalize(http, {
                forgot_password_id: forgotPasswordData.forgot_password_id,
                ...values,
            });
            toast.success('Password reset successfully.', {
                closeButton: true,
            });
            router.replace('/login');
        } catch (error) {
            if (isAxiosError(error) && error.response?.data.message) {
                toast.error(error.response?.data.message, {
                    closeButton: true,
                });
            } else {
                console.error(error);
                toast.error('Unable to reset password', {
                    closeButton: true,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>Enter your new password below</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='grid gap-3'>
                        <Label htmlFor='password'>New Password</Label>
                        <Input
                            {...register('password', { required: true })}
                            id='password'
                            type='password'
                            placeholder='New password'
                            disabled={loading}
                        />
                    </div>
                    <div className='grid gap-3 mt-3'>
                        <Label htmlFor='password_confirmation'>
                            Confirm Password
                        </Label>
                        <Input
                            {...register('password_confirmation', {
                                required: true,
                            })}
                            id='password_confirmation'
                            type='password'
                            placeholder='Confirm password'
                            disabled={loading}
                        />
                    </div>
                    <Button
                        type='submit'
                        className='w-full mt-4'
                        disabled={loading}
                    >
                        Reset Password
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
