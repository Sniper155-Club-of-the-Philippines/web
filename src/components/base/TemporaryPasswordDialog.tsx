'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface TemporaryPasswordCredentials {
    email: string;
    password: string;
    emailSent: boolean;
}

interface Props {
    credentials: TemporaryPasswordCredentials | null;
    onClose: () => void;
    title: string;
}

export default function TemporaryPasswordDialog({
    credentials,
    onClose,
    title,
}: Props) {
    const copyPassword = async () => {
        if (!credentials) return;

        try {
            await navigator.clipboard.writeText(credentials.password);
            toast.success('Password copied.');
        } catch {
            toast.error('Unable to copy password.');
        }
    };

    return (
        <Dialog
            open={credentials !== null}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className='sm:max-w-[480px]'>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {credentials?.emailSent
                            ? 'These credentials were emailed to the member.'
                            : 'The email could not be sent. Give these credentials to the member in person.'}{' '}
                        The member must change the password on next login.
                    </DialogDescription>
                </DialogHeader>
                <div className='grid gap-3'>
                    <div className='grid gap-1'>
                        <Label htmlFor='temporary-password-email'>
                            Username
                        </Label>
                        <Input
                            id='temporary-password-email'
                            readOnly
                            value={credentials?.email ?? ''}
                        />
                    </div>
                    <div className='grid gap-1'>
                        <Label htmlFor='temporary-password'>
                            Temporary password
                        </Label>
                        <div className='flex gap-2'>
                            <Input
                                id='temporary-password'
                                readOnly
                                className='font-mono'
                                value={credentials?.password ?? ''}
                            />
                            <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                aria-label='Copy temporary password'
                                onClick={() => void copyPassword()}
                            >
                                <Copy />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
