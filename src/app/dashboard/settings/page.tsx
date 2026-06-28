'use client';

import { user as api } from '@/api';
import { userAtom } from '@/atoms/auth';
import { loadingAtom } from '@/atoms/misc';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm';
import UserForm from '@/components/base/forms/UserForm';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useHttp } from '@/hooks/http';
import { UserFormInputs } from '@/types/form';
import { useAtom } from 'jotai';
import { toast } from 'sonner';

export default function Settings() {
    const [user] = useAtom(userAtom);
    const [, setLoading] = useAtom(loadingAtom);
    const http = useHttp();

    const onSubmit = async (data: UserFormInputs) => {
        setLoading(true);
        try {
            await api.update(http, data);
            toast.success('Settings saved successfully.', {
                closeButton: true,
            });
        } catch (error) {
            console.error(error);
            toast.error('Unable to save settings.', {
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='mx-auto grid w-full max-w-4xl gap-6 pb-10'>
            <Card>
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>
                        Update your personal, club, and emergency details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserForm
                        onSubmit={onSubmit}
                        defaultValues={user ?? {}}
                        hideAccess
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                        Choose a strong password you do not use anywhere else.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChangePasswordForm />
                </CardContent>
            </Card>
        </div>
    );
}
