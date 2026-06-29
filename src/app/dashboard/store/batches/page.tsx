'use client';

import { batch } from '@/api';
import { AdminPage } from '@/components/admin/AdminPage';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import DateTimePicker from '@/components/base/inputs/DateTimePicker';
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
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Textarea } from '@/components/ui/textarea';
import { useHttp } from '@/hooks/http';
import { apiError } from '@/lib/api-error';
import type { Batch } from '@/types/models/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

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
    const { control, register, handleSubmit, reset, watch, setValue } =
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
            const payload = {
                ...values,
                ordering_start_at: new Date(
                    values.ordering_start_at,
                ).toISOString(),
                ordering_end_at: new Date(values.ordering_end_at).toISOString(),
                notes: values.notes || null,
            };
            return editing
                ? batch.update(http, editing.id, payload)
                : batch.store(http, payload);
        },
        onSuccess: () => {
            toast.success(editing ? 'Batch updated.' : 'Batch created.');
            setOpen(false);
            void refresh();
        },
        onError: (error) =>
            toast.error(apiError(error, 'Unable to save batch.')),
    });
    const remove = useMutation({
        mutationFn: (id: string) => batch.remove(http, id),
        onSuccess: () => {
            toast.success('Batch deleted.');
            void refresh();
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
            ordering_start_at: item.ordering_start_at,
            ordering_end_at: item.ordering_end_at,
            is_active: item.is_active,
            notes: item.notes ?? '',
        });
        setOpen(true);
    };
    const submit = handleSubmit((values) => {
        save.mutate(values);
    });
    const columns: ColumnDef<Batch>[] = [
        {
            header: 'Batch',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div>
                    <div className='font-medium'>{row.original.name}</div>
                    <div className='text-xs text-muted-foreground'>
                        Sequence {row.original.sequence}
                    </div>
                </div>
            ),
        },
        {
            header: 'Window',
            cell: ({ row }) => (
                <>
                    {dayjs(row.original.ordering_start_at).format(
                        'MMM D, YYYY h:mm A',
                    )}{' '}
                    –{' '}
                    {dayjs(row.original.ordering_end_at).format(
                        'MMM D, YYYY h:mm A',
                    )}
                </>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'is_active',
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                >
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => <div className='text-right'>Actions</div>,
            cell: ({ row }) => (
                <div className='flex justify-end gap-2'>
                    <Button asChild size='sm' variant='outline'>
                        <Link
                            href={`/dashboard/store/batches/${row.original.id}`}
                        >
                            Products
                        </Link>
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                            startEdit(row.original);
                        }}
                    >
                        Edit
                    </Button>
                    <ConfirmDialog
                        title='Delete batch?'
                        description='This removes its product overrides too.'
                        onConfirm={() => {
                            remove.mutate(row.original.id);
                        }}
                    />
                </div>
            ),
        },
    ];

    return (
        <AdminPage
            title='Batches'
            description='Define ordering periods, then configure product pricing and limits for each batch.'
            action={<Button onClick={startCreate}>New batch</Button>}
        >
            <DataTable
                columns={columns}
                data={query.data ?? []}
                isLoading={query.isLoading}
                emptyMessage='No ordering batches yet.'
                rowHeight={64}
            />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='sm:max-w-xl'>
                    <form onSubmit={submit} className='grid gap-5'>
                        <DialogHeader>
                            <DialogTitle>
                                {editing ? 'Edit batch' : 'New batch'}
                            </DialogTitle>
                            <DialogDescription>
                                Times use your device timezone and are stored in
                                UTC.
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup className='grid gap-4 sm:grid-cols-2'>
                            <Field className='sm:col-span-2'>
                                <FieldLabel htmlFor='batch-name'>
                                    Name
                                </FieldLabel>
                                <Input
                                    id='batch-name'
                                    {...register('name', { required: true })}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor='batch-sequence'>
                                    Sequence
                                </FieldLabel>
                                <Input
                                    id='batch-sequence'
                                    min={1}
                                    type='number'
                                    {...register('sequence', {
                                        required: true,
                                        valueAsNumber: true,
                                    })}
                                />
                            </Field>
                            <Field
                                orientation='horizontal'
                                className='items-end pb-2'
                            >
                                <Checkbox
                                    id='batch-active'
                                    checked={form.is_active}
                                    onCheckedChange={(v) => {
                                        setValue('is_active', v === true);
                                    }}
                                />
                                <FieldLabel htmlFor='batch-active'>
                                    Active batch
                                </FieldLabel>
                            </Field>
                            <Controller
                                control={control}
                                name='ordering_start_at'
                                rules={{
                                    required: 'Select an ordering start.',
                                }}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor='batch-ordering-start'>
                                            Ordering starts
                                        </FieldLabel>
                                        <DateTimePicker
                                            id='batch-ordering-start'
                                            name={field.name}
                                            value={
                                                field.value
                                                    ? new Date(field.value)
                                                    : undefined
                                            }
                                            onChange={(value) => {
                                                field.onChange(
                                                    value?.toISOString() ?? '',
                                                );
                                            }}
                                            onBlur={field.onBlur}
                                            aria-invalid={fieldState.invalid}
                                            placeholder='Select start date and time'
                                        />
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    </Field>
                                )}
                            />
                            <Controller
                                control={control}
                                name='ordering_end_at'
                                rules={{
                                    required: 'Select an ordering end.',
                                }}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor='batch-ordering-end'>
                                            Ordering ends
                                        </FieldLabel>
                                        <DateTimePicker
                                            id='batch-ordering-end'
                                            name={field.name}
                                            value={
                                                field.value
                                                    ? new Date(field.value)
                                                    : undefined
                                            }
                                            onChange={(value) => {
                                                field.onChange(
                                                    value?.toISOString() ?? '',
                                                );
                                            }}
                                            onBlur={field.onBlur}
                                            aria-invalid={fieldState.invalid}
                                            placeholder='Select end date and time'
                                        />
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    </Field>
                                )}
                            />
                            <Field className='sm:col-span-2'>
                                <FieldLabel htmlFor='batch-notes'>
                                    Notes
                                </FieldLabel>
                                <Textarea
                                    id='batch-notes'
                                    {...register('notes')}
                                />
                            </Field>
                        </FieldGroup>
                        <DialogFooter>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                    setOpen(false);
                                }}
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
