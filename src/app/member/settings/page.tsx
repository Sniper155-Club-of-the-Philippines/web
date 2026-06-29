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

            <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]'>
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

                <aside className='grid gap-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>
                                Update membership details and merchandise print
                                names.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                asChild
                                variant='outline'
                                className='w-full'
                            >
                                <Link href='/member/profile'>Edit profile</Link>
                            </Button>
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
                            <Button
                                className='w-full'
                                variant='outline'
                                onClick={logout}
                            >
                                <LogOut />
                                Sign out
                            </Button>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </>
    );
}
