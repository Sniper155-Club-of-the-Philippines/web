'use client';

import { accessAtom } from '@/atoms/auth';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm';
import Logo from '@/components/root/Logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useRefreshToken } from '@/hooks/auth';
import { AUTH_ROUTES, landingPath } from '@/lib/auth';
import type { User } from '@/types/models/user';
import { useAtomValue } from 'jotai';
import { KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
    const access = useAtomValue(accessAtom);
    const router = useRouter();

    useRefreshToken({ redirectTo: AUTH_ROUTES.changePassword });

    const complete = (user: User) => {
        router.replace(landingPath(user));
    };

    if (!access) {
        return null;
    }

    return (
        <main className='flex min-h-svh items-center justify-center p-4 sm:p-8'>
            <div className='flex w-full max-w-md flex-col gap-5'>
                <div className='flex items-center gap-3 px-1'>
                    <Logo />
                    <span className='font-semibold'>S155CP Member Portal</span>
                </div>

                <Alert>
                    <KeyRound />
                    <AlertTitle>Secure your account</AlertTitle>
                    <AlertDescription>
                        Replace your temporary password before continuing.
                    </AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <CardTitle>Choose a new password</CardTitle>
                        <CardDescription>
                            Your current password is the temporary password sent
                            to your email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChangePasswordForm onSuccess={complete} />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
