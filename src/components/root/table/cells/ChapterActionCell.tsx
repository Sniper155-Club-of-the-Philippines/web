'use client';

import { chapter as api } from '@/api';
import { loadingAtom } from '@/atoms/misc';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHttp } from '@/hooks/http';
import { Chapter } from '@/types/chapter';
import { useAtom } from 'jotai';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type Props = {
    chapter: Chapter;
};

type Inputs = Omit<Chapter, 'created_at' | 'updated_at'> & { photo?: File };

const ChapterActionCell = ({ chapter }: Props) => {
    const http = useHttp();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [, setLoading] = useAtom(loadingAtom);
    const { register, handleSubmit, setValue } = useForm<Inputs>({
        defaultValues: {
            id: chapter.id,
            name: chapter.name,
        },
    });

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.remove(http, chapter.id);
        } catch (error) {
            console.error(error);
            toast('Unable to delete chapter.');
        } finally {
            setDeleteOpen(false);
            setLoading(false);
        }
    };

    const handleEdit = async (data: Inputs) => {
        setLoading(true);

        try {
            await api.update(http, data);
            toast('Chapter updated successfully.');
        } catch (error) {
            console.error(error);
            toast('Unable to edit chapter.');
        } finally {
            setEditOpen(false);
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
                    <form onSubmit={handleSubmit(handleEdit)}>
                        <DialogHeader>
                            <DialogTitle>Edit Chapter</DialogTitle>
                            <DialogDescription>
                                Make changes to the chapter here. Click save
                                when you&apos;re done.
                            </DialogDescription>
                        </DialogHeader>
                        <div className='grid gap-4 py-4'>
                            <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                                <Label htmlFor='name' className='text-right'>
                                    Name
                                </Label>
                                <Input
                                    {...register('name')}
                                    id='name'
                                    name='name'
                                    className='md:col-span-3'
                                />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                                <Label htmlFor='photo' className='text-right'>
                                    Photo
                                </Label>
                                <div className='md:col-span-3'>
                                    <Input
                                        id='photo'
                                        type='file'
                                        accept='image/*'
                                        name='photo'
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            setValue('photo', file);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant='outline' type='button'>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type='submit'>Save</Button>
                        </DialogFooter>
                    </form>
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
