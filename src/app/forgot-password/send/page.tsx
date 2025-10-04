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
    email: string;
};

export default function SendForgotPasswordPage() {
    const { register, handleSubmit } = useForm<Inputs>();
    const http = useHttp();
    const [loading, setLoading] = useAtom(loadingAtom);
    const [, setForgotPasswordAtom] = useAtom(forgotPasswordAtom);
    const router = useRouter();

    const onSubmit: SubmitHandler<Inputs> = async ({ email }) => {
        setLoading(true);
        try {
            const data = await forgotPassword.send(http, email);
            setForgotPasswordAtom({
                ...data,
                email,
            });
            toast.success('Password reset sent successfully.', {
                closeButton: true,
            });
            router.push('/forgot-password/verify');
        } catch (error) {
            if (isAxiosError(error) && error.response?.data.message) {
                toast.error(error.response?.data.message);
            } else {
                console.error(error);
                toast.error('Unable to send reset request', {
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
                <CardTitle>Forgot Password</CardTitle>
                <CardDescription>
                    Enter your email to receive a reset code
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='grid gap-3'>
                        <Label htmlFor='email'>Email</Label>
                        <Input
                            {...register('email', { required: true })}
                            id='email'
                            type='email'
                            placeholder='Email'
                            disabled={loading}
                        />
                    </div>
                    <Button
                        type='submit'
                        className='w-full mt-4'
                        disabled={loading}
                    >
                        Send Reset Code
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
