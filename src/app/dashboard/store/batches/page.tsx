'use client';

import { batch } from '@/api';
import {
    AdminPage,
    TableEmpty,
    TableLoading,
} from '@/components/admin/AdminPage';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useHttp } from '@/hooks/http';
import { apiError } from '@/lib/api-error';
import type { Batch } from '@/types/models/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type BatchInputs = {
    name: string;
    sequence: number;
    ordering_start_at: string;
    ordering_end_at: string;
    is_active: boolean;
    notes: string;
};

const empty: BatchInputs = {
    name: '',
    sequence: 1,
    ordering_start_at: '',
    ordering_end_at: '',
    is_active: false,
    notes: '',
};

export default function BatchesPage() {
    const http = useHttp();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Batch | null>(null);
    const { register, handleSubmit, reset, watch, setValue } =
        useForm<BatchInputs>({ defaultValues: empty });
    const form = watch();
    const query = useQuery({
        queryKey: ['batches'],
        queryFn: () => batch.all(http),
    });
    const refresh = () =>
        queryClient.invalidateQueries({ queryKey: ['batches'] });
    const save = useMutation({
        mutationFn: (values: BatchInputs) => {
            const payload = { ...values, notes: values.notes || null };
            return editing
                ? batch.update(http, editing.id, payload)
                : batch.store(http, payload);
        },
        onSuccess: () => {
            toast.success(editing ? 'Batch updated.' : 'Batch created.');
            setOpen(false);
            refresh();
        },
        onError: (error) =>
            toast.error(apiError(error, 'Unable to save batch.')),
    });
    const remove = useMutation({
        mutationFn: (id: string) => batch.remove(http, id),
        onSuccess: () => {
            toast.success('Batch deleted.');
            refresh();
        },
        onError: (error) =>
            toast.error(apiError(error, 'Unable to delete batch.')),
    });
    const startCreate = () => {
        setEditing(null);
        reset({ ...empty, sequence: (query.data?.[0]?.sequence ?? 0) + 1 });
        setOpen(true);
    };
    const startEdit = (item: Batch) => {
        setEditing(item);
        reset({
            name: item.name,
            sequence: item.sequence,
            ordering_start_at: dayjs(item.ordering_start_at).format(
                'YYYY-MM-DDTHH:mm',
            ),
            ordering_end_at: dayjs(item.ordering_end_at).format(
                'YYYY-MM-DDTHH:mm',
            ),
            is_active: item.is_active,
            notes: item.notes ?? '',
        });
        setOpen(true);
    };
    const submit = handleSubmit((values) => save.mutate(values));

    return (
        <AdminPage
            title='Batches'
            description='Define ordering periods, then configure product pricing and limits for each batch.'
            action={<Button onClick={startCreate}>New batch</Button>}
        >
            <div className='overflow-x-auto rounded-lg border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Batch</TableHead>
                            <TableHead>Window</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className='text-right'>
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {query.isLoading && <TableLoading columns={4} />}
                        {!query.isLoading && !query.data?.length && (
                            <TableEmpty
                                columns={4}
                                message='No ordering batches yet.'
                            />
                        )}
                        {query.data?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className='font-medium'>
                                        {item.name}
                                    </div>
                                    <div className='text-xs text-muted-foreground'>
                                        Sequence {item.sequence}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {dayjs(item.ordering_start_at).format(
                                        'MMM D, YYYY h:mm A',
                                    )}{' '}
                                    –{' '}
                                    {dayjs(item.ordering_end_at).format(
                                        'MMM D, YYYY h:mm A',
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            item.is_active
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {item.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className='flex justify-end gap-2'>
                                        <Button
                                            asChild
                                            size='sm'
                                            variant='outline'
                                        >
                                            <Link
                                                href={`/dashboard/store/batches/${item.id}`}
                                            >
                                                Products
                                            </Link>
                                        </Button>
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            onClick={() => startEdit(item)}
                                        >
                                            Edit
                                        </Button>
                                        <ConfirmDialog
                                            title='Delete batch?'
                                            description='This removes its product overrides too.'
                                            onConfirm={() =>
                                                remove.mutate(item.id)
                                            }
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='sm:max-w-xl'>
                    <form onSubmit={submit} className='grid gap-5'>
                        <DialogHeader>
                            <DialogTitle>
                                {editing ? 'Edit batch' : 'New batch'}
                            </DialogTitle>
                            <DialogDescription>
                                Times are interpreted in Philippine time.
                            </DialogDescription>
                        </DialogHeader>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <label className='grid gap-2 text-sm font-medium sm:col-span-2'>
                                Name
                                <Input
                                    {...register('name', { required: true })}
                                />
                            </label>
                            <label className='grid gap-2 text-sm font-medium'>
                                Sequence
                                <Input
                                    min={1}
                                    type='number'
                                    {...register('sequence', {
                                        required: true,
                                        valueAsNumber: true,
                                    })}
                                />
                            </label>
                            <label className='flex items-end gap-3 pb-2 text-sm font-medium'>
                                <Checkbox
                                    checked={form.is_active}
                                    onCheckedChange={(v) =>
                                        setValue('is_active', v === true)
                                    }
                                />{' '}
                                Active batch
                            </label>
                            <label className='grid gap-2 text-sm font-medium'>
                                Ordering starts
                                <Input
                                    required
                                    type='datetime-local'
                                    {...register('ordering_start_at')}
                                />
                            </label>
                            <label className='grid gap-2 text-sm font-medium'>
                                Ordering ends
                                <Input
                                    required
                                    type='datetime-local'
                                    {...register('ordering_end_at')}
                                />
                            </label>
                            <label className='grid gap-2 text-sm font-medium sm:col-span-2'>
                                Notes
                                <Textarea {...register('notes')} />
                            </label>
                        </div>
                        <DialogFooter>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button disabled={save.isPending}>
                                {save.isPending ? 'Saving…' : 'Save batch'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminPage>
    );
}
