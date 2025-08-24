'use client';

import { auth } from '@/api';
import { accessAtom, userAtom } from '@/atoms/auth';
import GoogleButton from '@/components/auth/GoogleButton';
import Logo from '@/components/root/Logo';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Access } from '@/types/models/auth';
import { Label } from '@radix-ui/react-label';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import { loadingAtom } from '@/atoms/misc';
import { useRouter } from 'next/navigation';
import { User } from '@/types/models/user';
import { useHttp } from '@/hooks/http';
import { isAxiosError } from 'axios';

type Inputs = {
    email: string;
    password: string;
};

export default function Login() {
    const { register, handleSubmit, control } = useForm<Inputs>();
    const [user, setUser] = useAtom(userAtom);
    const [access, setAccess] = useAtom(accessAtom);
    const [, setLoading] = useAtom(loadingAtom);
    const router = useRouter();
    const http = useHttp();

    const onLogin: SubmitHandler<Inputs> = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await auth.login(http, email, password);

            handleSuccess(data);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = (data: { user: User; access: Access }) => {
        setUser(data.user);
        setAccess(data.access);
    };

    const handleError = (error: unknown) => {
        if (isAxiosError(error)) {
            toast('Unable to login', {
                description: error.response?.data?.message,
                closeButton: true,
            });
        } else {
            console.error(error);
            toast('Unable to login', {
                closeButton: true,
            });
        }
    };

    const [email, password] = useWatch({
        control,
        name: ['email', 'password'],
    });

    const isValid = useMemo(() => email && password, [email, password]);

    useEffect(() => {
        if (access && user) {
            router.replace('/dashboard');
        }
    }, [access, router, user]);

    return (
        <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
            <div className='w-full max-w-sm'>
                <div className='flex flex-col gap-6'>
                    <Card>
                        <CardHeader>
                            <Logo />
                            <CardTitle>Login to your account</CardTitle>
                            <CardDescription>
                                Enter your email below to login to your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onLogin)}>
                                <div className='flex flex-col gap-1'>
                                    <div className='grid gap-3'>
                                        <Label htmlFor='email'>Email</Label>
                                        <Input
                                            {...register('email', {
                                                required: true,
                                            })}
                                            id='email'
                                            type='email'
                                            placeholder='Email'
                                        />
                                    </div>
                                    <div className='grid gap-3'>
                                        <div className='flex items-center'>
                                            <Label htmlFor='password'>
                                                Password
                                            </Label>
                                            <a
                                                href='#'
                                                className='ml-auto inline-block text-sm underline-offset-4 hover:underline'
                                            >
                                                Forgot your password?
                                            </a>
                                        </div>
                                        <Input
                                            {...register('password', {
                                                required: true,
                                            })}
                                            id='password'
                                            type='password'
                                            placeholder='Password'
                                        />
                                    </div>
                                    <div className='flex flex-col gap-3 mt-3'>
                                        <Button
                                            type='submit'
                                            className='w-full'
                                            disabled={!isValid}
                                        >
                                            Login
                                        </Button>
                                        <GoogleButton
                                            onSuccess={(access, user) => {
                                                handleSuccess({ access, user });
                                            }}
                                        />
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
