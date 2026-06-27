'use client';

import { paymentMethod } from '@/api';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import type { PaymentMethod } from '@/types/models/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type PaymentMethodInputs = {
    label: string;
    type: PaymentMethod['type'];
    account_name: string;
    account_number: string;
    instructions: string;
    is_active: boolean;
    sort_order: number;
    qr_image?: File;
};

const empty: PaymentMethodInputs = {
    label: '',
    type: 'gcash',
    account_name: '',
    account_number: '',
    instructions: '',
    is_active: true,
    sort_order: 0,
};

export default function PaymentMethodsPage() {
    const http = useHttp();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<PaymentMethod | null>(null);
    const { register, handleSubmit, reset, watch, setValue } =
        useForm<PaymentMethodInputs>({ defaultValues: empty });
    const form = watch();
    const query = useQuery({
        queryKey: ['payment-methods'],
        queryFn: () => paymentMethod.all(http),
    });
    const refresh = () =>
        queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    const save = useMutation({
        mutationFn: (values: PaymentMethodInputs) => {
            const payload = {
                ...values,
                instructions: values.instructions || null,
            };
            return editing
                ? paymentMethod.update(http, editing.id, payload)
                : paymentMethod.store(http, payload);
        },
        onSuccess: () => {
            toast.success(
                editing ? 'Payment method updated.' : 'Payment method created.',
            );
            setOpen(false);
            refresh();
        },
        onError: (error) =>
            toast.error(apiError(error, 'Unable to save payment method.')),
    });
    const remove = useMutation({
        mutationFn: (id: string) => paymentMethod.remove(http, id),
        onSuccess: () => {
            toast.success('Payment method deleted.');
            refresh();
        },
        onError: (error) =>
            toast.error(apiError(error, 'Unable to delete payment method.')),
    });
    const startCreate = () => {
        setEditing(null);
        reset({ ...empty, sort_order: query.data?.length ?? 0 });
        setOpen(true);
    };
    const startEdit = (item: PaymentMethod) => {
        setEditing(item);
        reset({
            label: item.label,
            type: item.type,
            account_name: item.account_name,
            account_number: item.account_number,
            instructions: item.instructions ?? '',
            is_active: item.is_active,
            sort_order: item.sort_order,
            qr_image: undefined,
        });
        setOpen(true);
    };
    const submit = handleSubmit((values) => save.mutate(values));

    return (
        <AdminPage
            title='Payment methods'
            description='Configure the payment instructions members see during checkout.'
            action={<Button onClick={startCreate}>New payment method</Button>}
        >
            <div className='overflow-x-auto rounded-lg border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Method</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>QR</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className='text-right'>
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {query.isLoading && <TableLoading columns={5} />}
                        {!query.isLoading && !query.data?.length && (
                            <TableEmpty
                                columns={5}
                                message='No payment methods configured.'
                            />
                        )}
                        {query.data?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className='font-medium'>
                                        {item.label}
                                    </div>
                                    <div className='text-xs uppercase text-muted-foreground'>
                                        {item.type.replace('_', ' ')}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>{item.account_name}</div>
                                    <div className='text-xs text-muted-foreground'>
                                        {item.account_number}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {item.qr_image_url ? (
                                        <Image
                                            src={item.qr_image_url}
                                            alt={`${item.label} QR code`}
                                            width={48}
                                            height={48}
                                            unoptimized
                                            className='size-12 rounded object-cover'
                                        />
                                    ) : (
                                        <span className='text-muted-foreground'>
                                            None
                                        </span>
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
                                            size='sm'
                                            variant='outline'
                                            onClick={() => startEdit(item)}
                                        >
                                            Edit
                                        </Button>
                                        <ConfirmDialog
                                            title='Delete payment method?'
                                            description='Members will no longer be able to select it.'
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
                <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
                    <form onSubmit={submit} className='grid gap-5'>
                        <DialogHeader>
                            <DialogTitle>
                                {editing
                                    ? 'Edit payment method'
                                    : 'New payment method'}
                            </DialogTitle>
                            <DialogDescription>
                                Add account details and an optional QR image.
                            </DialogDescription>
                        </DialogHeader>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <label className='grid gap-2 text-sm font-medium'>
                                Label
                                <Input
                                    {...register('label', { required: true })}
                                />
                            </label>
                            <label className='grid gap-2 text-sm font-medium'>
                                Type
                                <Select
                                    value={form.type}
                                    onValueChange={(
                                        type: PaymentMethod['type'],
                                    ) => setValue('type', type)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='gcash'>
                                            GCash
                                        </SelectItem>
                                        <SelectItem value='bank'>
                                            Bank transfer
                                        </SelectItem>
                                        <SelectItem value='other'>
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </label>
                            <label className='grid gap-2 text-sm font-medium'>
                                Account name
                                <Input
                                    {...register('account_name', {
                                        required: true,
                                    })}
                                />
                            </label>
                            <label className='grid gap-2 text-sm font-medium'>
                                Account number
                                <Input
                                    {...register('account_number', {
                                        required: true,
                                    })}
                                />
                            </label>
                            <label className='grid gap-2 text-sm font-medium'>
                                Sort order
                                <Input
                                    min={0}
                                    type='number'
                                    {...register('sort_order', {
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
                                Active method
                            </label>
                            <label className='grid gap-2 text-sm font-medium sm:col-span-2'>
                                Instructions
                                <Textarea {...register('instructions')} />
                            </label>
                            <label className='grid gap-2 text-sm font-medium sm:col-span-2'>
                                QR image
                                <Input
                                    type='file'
                                    accept='image/jpeg,image/png,image/webp'
                                    onChange={(e) =>
                                        setValue(
                                            'qr_image',
                                            e.target.files?.[0],
                                        )
                                    }
                                />
                                <span className='text-xs font-normal text-muted-foreground'>
                                    {editing?.qr_image_url && !form.qr_image
                                        ? 'Current image will be kept.'
                                        : 'JPG, PNG, or WebP up to 10 MB.'}
                                </span>
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
                                {save.isPending ? 'Saving…' : 'Save method'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminPage>
    );
}
