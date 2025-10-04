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
import { useHttp } from '@/hooks/http';
import { isAxiosError } from 'axios';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Label } from '@/components/ui/label';

type Inputs = {
    code: string;
};

export default function VerifyForgotPasswordPage() {
    const { register, handleSubmit } = useForm<Inputs>();
    const http = useHttp();
    const [loading, setLoading] = useAtom(loadingAtom);
    const [forgotPasswordData] = useAtom(forgotPasswordAtom);
    const router = useRouter();

    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!forgotPasswordData?.expires) return;

        const expiresAt = dayjs(forgotPasswordData.expires);

        const updateCountdown = () => {
            const now = dayjs();
            const diff = expiresAt.diff(now, 'second');

            if (diff <= 0) {
                setTimeLeft(0);
                return;
            }

            setTimeLeft(diff);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [forgotPasswordData]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const onSubmit: SubmitHandler<Inputs> = async ({ code }) => {
        if (!forgotPasswordData) {
            router.back();
            return;
        }

        setLoading(true);
        try {
            await forgotPassword.verify(http, {
                otp: code,
                forgot_password_id: forgotPasswordData.forgot_password_id,
            });

            toast.success('Code verified successfully.', {
                closeButton: true,
            });
            router.push('/forgot-password/finalize');
        } catch (error) {
            if (isAxiosError(error) && error.response?.data.message) {
                toast.error(error.response?.data.message, {
                    closeButton: true,
                });
            } else {
                console.error(error);
                toast.error('Unable to verify code', {
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
                <CardTitle>Verify Code</CardTitle>
                <CardDescription>
                    Enter the reset code you received by email.
                </CardDescription>

                {timeLeft !== null && (
                    <p
                        className={`text-sm mt-1 ${
                            timeLeft === 0
                                ? 'text-red-500 font-medium'
                                : 'text-muted-foreground'
                        }`}
                    >
                        {timeLeft === 0
                            ? 'Expired'
                            : `Expires in ${formatTime(timeLeft)}`}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='grid gap-3'>
                        <Label htmlFor='code'>Reset Code</Label>
                        <Input
                            {...register('code', { required: true })}
                            id='code'
                            type='text'
                            placeholder='Enter reset code'
                            disabled={loading || timeLeft === 0}
                        />
                    </div>
                    <Button
                        type='submit'
                        className='w-full mt-4'
                        disabled={loading || timeLeft === 0}
                    >
                        Verify Code
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
