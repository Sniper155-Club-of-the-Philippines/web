'use client';

import ChangePasswordForm from '@/components/auth/ChangePasswordForm';
import MemberPageHeader from '@/components/member/MemberPageHeader';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useLogout } from '@/hooks/useLogout';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

export default function MemberSettingsPage() {
    const logout = useLogout();

    return (
        <>
            <MemberPageHeader
                title='Settings'
                description='Manage your account security and session.'
            />

            <div className='grid items-start gap-6 lg:grid-cols-2'>
                <Card>
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>
                            Update your membership details and the names printed
                            on your merchandise.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant='outline'>
                            <Link href='/member/profile'>Go to profile</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Password</CardTitle>
                        <CardDescription>
                            Choose a strong password you do not use anywhere
                            else.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChangePasswordForm />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Session</CardTitle>
                        <CardDescription>
                            Sign out of the member portal on this device.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant='outline' onClick={logout}>
                            <LogOut />
                            Sign out
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
