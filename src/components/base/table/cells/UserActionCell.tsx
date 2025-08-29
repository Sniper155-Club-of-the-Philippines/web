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
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useHttp } from '@/hooks/http';
import { User } from '@/types/models/user';
import { useAtom } from 'jotai';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import UserForm from '../../forms/UserForm';
import { UserFormInputs } from '@/types/form';

type Props = {
    user: User;
    refetch?: () => void;
};

const UserActionCell = ({ user, refetch }: Props) => {
    const http = useHttp();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [, setLoading] = useAtom(loadingAtom);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.remove(http, user.id);
            refetch?.();
        } catch (error) {
            console.error(error);
            toast.success('Unable to delete member.', {
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
            await api.update(http, data);
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
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className='sm:max-w-[425px] md:max-w-[800px]'>
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
                        onCancel={() => setEditOpen(false)}
                    />
                </DialogContent>
            </Dialog>

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
                            onClick={() => setDeleteOpen(false)}
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
