'use client';

import { user as api } from '@/api';
import { loadingAtom } from '@/atoms/misc';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useHttp } from '@/hooks/http';
import { User } from '@/types/models/user';
import { useAtom } from 'jotai';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserFormInputs } from '@/types/form';
import UserForm from '@/components/base/forms/UserForm';
import TemporaryPasswordDialog, {
    TemporaryPasswordCredentials,
} from '@/components/base/TemporaryPasswordDialog';

type Props = {
    user: User;
    refetch?: () => void;
};

const UserActionCell = ({ user, refetch }: Props) => {
    const http = useHttp();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [resetOpen, setResetOpen] = useState(false);
    const [credentials, setCredentials] =
        useState<TemporaryPasswordCredentials | null>(null);
    const [, setLoading] = useAtom(loadingAtom);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.remove(http, user.id);
            refetch?.();
        } catch (error) {
            console.error(error);
            toast.error('Unable to delete member.', {
                closeButton: true,
            });
        } finally {
            setDeleteOpen(false);
            setLoading(false);
        }
    };

    const handleEdit = async (data: UserFormInputs) => {
        setLoading(true);
        try {
            await api.update(http, user.id, data);
            toast.success('Member updated successfully.', {
                closeButton: true,
            });
            setEditOpen(false);
            refetch?.();
        } catch (error) {
            console.error(error);
            toast.error('Unable to edit member.', {
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setLoading(true);
        try {
            const result = await api.resetPassword(http, user.id);
            setResetOpen(false);
            setCredentials({
                email: result.user.email,
                password: result.temp_password,
            });
            toast.success('Member password reset.');
            refetch?.();
        } catch (error) {
            console.error(error);
            toast.error('Unable to reset member password.', {
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='h-8 w-8 p-0'>
                        <span className='sr-only'>Open menu</span>
                        <MoreHorizontal className='h-4 w-4' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={() => {
                                setEditOpen(true);
                            }}
                        >
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                setResetOpen(true);
                            }}
                        >
                            Reset password
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant='destructive'
                            onClick={() => {
                                setDeleteOpen(true);
                            }}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className='max-h-[calc(100svh-2rem)] sm:max-w-[425px] md:max-w-[800px]'>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Make changes to the member profile here. Click save
                            when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <UserForm
                        defaultValues={user}
                        onSubmit={handleEdit}
                        onCancel={() => {
                            setEditOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle>Reset member password?</DialogTitle>
                        <DialogDescription>
                            {user.first_name}&apos;s current password will stop
                            working immediately. A temporary password will be
                            shown once and must be changed on next login.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => setResetOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={() => void handleResetPassword()}>
                            Reset password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <TemporaryPasswordDialog
                credentials={credentials}
                title='Password reset'
                onClose={() => setCredentials(null)}
            />

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete the member &quot;{user?.first_name}{' '}
                            {user?.last_name}&quot; and remove their data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => {
                                setDeleteOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant='destructive'
                            onClick={() => handleDelete()}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default UserActionCell;
