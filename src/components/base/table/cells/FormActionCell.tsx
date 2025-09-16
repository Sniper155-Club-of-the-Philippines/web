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
import { useRouter } from 'next/navigation';
import { Form } from '@/types/models/form';

type Props = {
    form: Form;
    refetch?: () => void;
};

const FormActionCell = ({ form, refetch }: Props) => {
    const http = useHttp();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [, setLoading] = useAtom(loadingAtom);
    const router = useRouter();

    const onEdit = () => router.push(`/dashboard/forms/${form.id}/edit`);

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
                    <DropdownMenuItem onClick={() => onEdit}>
                        Edit
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
