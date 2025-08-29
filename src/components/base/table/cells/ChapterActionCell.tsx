'use client';

import { chapter as api } from '@/api';
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
import { Chapter } from '@/types/models/chapter';
import { ChapterFormInputs } from '@/types/form';
import { useAtom } from 'jotai';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ChapterForm from '@/components/base/forms/ChapterForm';

type Props = {
    chapter: Chapter;
    refetch?: () => void;
};

const ChapterActionCell = ({ chapter, refetch }: Props) => {
    const http = useHttp();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [, setLoading] = useAtom(loadingAtom);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.remove(http, chapter.id);
            refetch?.();
        } catch (error) {
            console.error(error);
            toast.error('Unable to delete chapter.', {
                closeButton: true,
            });
        } finally {
            setDeleteOpen(false);
            setLoading(false);
        }
    };

    const handleEdit = async (data: ChapterFormInputs) => {
        setLoading(true);
        try {
            await api.update(http, data);
            toast.success('Chapter updated successfully.', {
                closeButton: true,
            });
            setEditOpen(false);
            refetch?.();
        } catch (error) {
            console.error(error);
            toast.error('Unable to edit chapter.', {
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
                        <DialogTitle>Edit Chapter</DialogTitle>
                        <DialogDescription>
                            Make changes to the chapter here. Click save when
                            you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>

                    <ChapterForm
                        defaultValues={chapter}
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
                            delete the chapter &quot;{chapter?.name}&quot; and
                            remove their data.
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

export default ChapterActionCell;
