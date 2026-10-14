'use client';

import { useQuery } from '@tanstack/react-query';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { user as api } from '@/api';
import PasswordInput from '@/components/base/inputs/PasswordInput';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useHttp } from '@/hooks/http';
import { User } from '@/types/models/user';

type Props = {
    userId: User['id'];
};

/**
 * Lets an admin read a member's current password back when helping them log
 * in. Fetched only while the field is on screen and never cached.
 */
export default function MemberPasswordField({ userId }: Props) {
    const http = useHttp();
    const { data, isPending, isError } = useQuery({
        queryKey: ['users', userId, 'password'],
        queryFn: () => api.password(http, userId),
        gcTime: 0,
        staleTime: 0,
    });

    const copyPassword = async () => {
        if (!data) return;

        try {
            await navigator.clipboard.writeText(data);
            toast.success('Password copied.');
        } catch {
            toast.error('Unable to copy password.');
        }
    };

    return (
        <div className='flex flex-col gap-2'>
            <Label htmlFor='member_password'>Current Password</Label>
            <div className='flex gap-2'>
                <div className='min-w-0 flex-1'>
                    <PasswordInput
                        id='member_password'
                        readOnly
                        autoComplete='off'
                        className='font-mono'
                        value={data ?? ''}
                        placeholder={isPending ? 'Loading...' : 'Not available'}
                    />
                </div>
                <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    aria-label='Copy password'
                    disabled={!data}
                    onClick={() => void copyPassword()}
                >
                    <Copy />
                </Button>
            </div>
            {isError && (
                <p className='text-destructive text-sm'>
                    Unable to load the password.
                </p>
            )}
            {data === null && (
                <p className='text-muted-foreground text-sm'>
                    This password was set before passwords were kept. Use Reset
                    password to email the member a new one.
                </p>
            )}
        </div>
    );
}
