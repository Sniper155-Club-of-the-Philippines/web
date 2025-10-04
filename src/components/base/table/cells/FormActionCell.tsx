'use client';

import { form as api } from '@/api';
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
import { useAtom } from 'jotai';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Form } from '@/types/models/form';
import Link from 'next/link';

type Props = {
    form: Form;
    refetch?: () => void | Promise<any>;
};

const FormActionCell = ({ form, refetch }: Props) => {
    const http = useHttp();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [, setLoading] = useAtom(loadingAtom);

    const toggleStatus = async () => {
        setLoading(true);
        try {
            await api.toggle(http, form.id, !form.active);
            await refetch?.();
            toast.success(
                `Form is now ${form.active ? 'inactive' : 'active'}.`,
                {
                    closeButton: true,
                }
            );
        } catch (error) {
            console.error(error);
            toast.success('Unable to update form.', {
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.remove(http, form.id);
            refetch?.();
        } catch (error) {
            console.error(error);
            toast.success('Unable to delete form.', {
                closeButton: true,
            });
        } finally {
            setDeleteOpen(false);
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
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/forms/manage/${form.id}`}>
                            View
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/forms/manage/${form.id}/edit`}>
                            Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleStatus()}>
                        {form.active ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete the form &quot;{form.title}&quot; and remove
                            their data.
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

export default FormActionCell;
