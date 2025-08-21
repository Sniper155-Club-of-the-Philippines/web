'use client';

import { user as api, auth, chapter } from '@/api';
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
import { User } from '@/types/user';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Select from '@/components/root/base/Select';

type Props = {
    user: User;
};

type Inputs = Omit<
    User,
    'created_at' | 'updated_at' | 'google_id' | 'chapter'
> & { password?: string; password_confirmation?: string; photo?: File };

const UserActionCell = ({ user }: Props) => {
    const http = useHttp();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [, setLoading] = useAtom(loadingAtom);
    const { register, handleSubmit, watch, setValue } = useForm<Inputs>({
        defaultValues: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            designation: user.designation,
            club_number: user.club_number,
            chapter_id: user.chapter_id,
        },
    });
    const { data: designations } = useQuery({
        queryKey: ['designations'],
        queryFn: () => auth.designations(http),
    });
    const { data: chapters } = useQuery({
        queryKey: ['chapters'],
        queryFn: () => chapter.all(http),
    });

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.remove(http, user.id);
        } catch (error) {
            console.error(error);
            toast('Unable to delete member.');
        } finally {
            setDeleteOpen(false);
            setLoading(false);
        }
    };

    const handleEdit = async (data: Inputs) => {
        setLoading(true);

        try {
            await api.update(http, data);
            toast('Member updated successfully.');
            setEditOpen(false);
        } catch (error) {
            console.error(error);
            toast('Unable to edit member.');
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
                    <form onSubmit={handleSubmit(handleEdit)}>
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                                Make changes to the member profile here. Click
                                save when you&apos;re done.
                            </DialogDescription>
                        </DialogHeader>
                        <div className='grid gap-4 py-10 md:py-4 max-h-[500px] overflow-x-auto md:max-h-none md:overflow-x-hidden'>
                            <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                                <Label
                                    htmlFor='first_name'
                                    className='text-right'
                                >
                                    First Name
                                </Label>
                                <Input
                                    {...register('first_name')}
                                    id='first_name'
                                    name='first_name'
                                    className='md:col-span-3'
                                />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                                <Label
                                    htmlFor='last_name'
                                    className='text-right'
                                >
                                    Last Name
                                </Label>
                                <Input
                                    {...register('last_name')}
                                    id='last_name'
                                    name='last_name'
                                    className='md:col-span-3'
                                />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                                <Label htmlFor='email' className='text-right'>
                                    Email
                                </Label>
                                <Input
                                    {...register('email')}
                                    id='email'
                                    name='email'
                                    type='email'
                                    className='md:col-span-3'
                                />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                                <Label
                                    htmlFor='password'
                                    className='text-right'
                                >
                                    Password
                                </Label>
                                <Input
                                    {...register('password')}
                                    id='password'
                                    name='password'
                                    type='password'
                                    className='md:col-span-3'
                                />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                                <Label
                                    htmlFor='password_confirmation'
                                    className='text-right'
                                >
                                    Confirm Password
                                </Label>
                                <Input
                                    {...register('password_confirmation')}
                                    id='password_confirmation'
                                    name='password_confirmation'
                                    type='password'
                                    className='md:col-span-3'
                                />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                                <Label
                                    htmlFor='designation'
                                    className='text-right'
                                >
                                    Designation
                                </Label>
                                <div className='md:col-span-3'>
                                    <Select
                                        width='w-full'
                                        onChange={(value) =>
                                            setValue(
                                                'designation',
                                                value ?? null
                                            )
                                        }
                                        value={
                                            watch('designation') ?? undefined
                                        }
                                        options={designations ?? []}
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:max-h-[36px]'>
                                <Label htmlFor='chapter' className='text-right'>
                                    Chapter
                                </Label>
                                <div className='md:col-span-3'>
                                    <Select
                                        width='w-full'
                                        onChange={(value) =>
                                            setValue(
                                                'chapter_id',
                                                value ?? null
                                            )
                                        }
                                        value={watch('chapter_id') ?? undefined}
                                        options={
                                            chapters?.map((chapter) => ({
                                                value: chapter.id,
                                                label: chapter.name,
                                            })) ?? []
                                        }
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-4 max-h-[36px]'>
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
                        <DialogFooter className='mt-10 md:mt-0'>
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
