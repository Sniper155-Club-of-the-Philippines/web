'use client';

import { batch } from '@/api';
import {
    AdminPage,
    TableEmpty,
    TableLoading,
} from '@/components/admin/AdminPage';
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
import { Controller, useForm } from 'react-hook-form';
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
            ordering_start_at: item.ordering_start_at,
            ordering_end_at: item.ordering_end_at,
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
                                    onCheckedChange={(v) =>
                                        setValue('is_active', v === true)
                                    }
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
                                            onChange={(value) =>
                                                field.onChange(
                                                    value?.toISOString() ?? '',
                                                )
                                            }
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
                                            onChange={(value) =>
                                                field.onChange(
                                                    value?.toISOString() ?? '',
                                                )
                                            }
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
