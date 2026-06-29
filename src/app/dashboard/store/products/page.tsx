'use client';

import { product } from '@/api';
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
import type { Product, ProductImage } from '@/types/models/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type ProductInputs = {
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
    sort_order: number;
};

const empty: ProductInputs = {
    name: '',
    slug: '',
    description: '',
    is_active: true,
    sort_order: 0,
};

export default function ProductsPage() {
    const http = useHttp();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const { register, handleSubmit, reset, watch, setValue } =
        useForm<ProductInputs>({ defaultValues: empty });
    const form = watch();
    const query = useQuery({
        queryKey: ['products'],
        queryFn: () => product.all(http),
    });
    const refresh = () =>
        queryClient.invalidateQueries({ queryKey: ['products'] });
    const save = useMutation({
        mutationFn: (values: ProductInputs) => {
            const payload = {
                ...values,
                description: values.description || null,
            };
            return editing
                ? product.update(http, editing.id, payload)
                : product.store(http, payload);
        },
        onSuccess: () => {
            toast.success(editing ? 'Product updated.' : 'Product created.');
            setOpen(false);
            void refresh();
        },
        onError: (error) =>
            toast.error(apiError(error, 'Unable to save product.')),
    });
    const remove = useMutation({
        mutationFn: (id: string) => product.remove(http, id),
        onSuccess: () => {
            toast.success('Product deleted.');
            void refresh();
        },
        onError: (error) =>
            toast.error(apiError(error, 'Unable to delete product.')),
    });
    const startEdit = (item: Product) => {
        setEditing(item);
        reset({
            name: item.name,
            slug: item.slug,
            description: item.description ?? '',
            is_active: item.is_active,
            sort_order: item.sort_order,
        });
        setOpen(true);
    };
    const submit = handleSubmit((values) => {
        save.mutate(values);
    });
    const upload = async (file?: File) => {
        if (!editing || !file) return;
        try {
            await product.uploadImage(http, editing.id, file);
            toast.success('Image uploaded.');
            void refresh();
            setEditing(
                (await product.all(http)).find(
                    (item) => item.id === editing.id,
                ) ?? editing,
            );
        } catch (error) {
            toast.error(apiError(error, 'Unable to upload image.'));
        }
    };
    const deleteImage = async (imageId: string) => {
        if (!editing) return;
        try {
            await product.removeImage(http, editing.id, imageId);
            const images = editing.images.filter(
                (image) => image.id !== imageId,
            );
            setEditing({ ...editing, images });
            void refresh();
        } catch (error) {
            toast.error(apiError(error, 'Unable to delete image.'));
        }
    };
    const move = async (image: ProductImage, direction: -1 | 1) => {
        if (!editing) return;
        const images = [...editing.images];
        const from = images.findIndex((item) => item.id === image.id);
        const to = from + direction;
        if (to < 0 || to >= images.length) return;
        [images[from], images[to]] = [images[to], images[from]];
        try {
            const reordered = await product.reorderImages(
                http,
                editing.id,
                images,
            );
            setEditing({ ...editing, images: reordered });
            void refresh();
        } catch (error) {
            toast.error(apiError(error, 'Unable to reorder images.'));
        }
    };

    return (
        <AdminPage
            title='Products'
            description='Maintain the product catalog and ordered image galleries used by store batches.'
            action={
                <Button
                    onClick={() => {
                        setEditing(null);
                        reset({
                            ...empty,
                            sort_order: query.data?.length ?? 0,
                        });
                        setOpen(true);
                    }}
                >
                    New product
                </Button>
            }
        >
            <ScrollArea className='rounded-lg border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Gallery</TableHead>
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
                                message='No products in the catalog.'
                            />
                        )}
                        {query.data?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className='font-medium'>
                                        {item.name}
                                    </div>
                                    <div className='text-xs text-muted-foreground'>
                                        {item.slug}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {item.images.length} image
                                    {item.images.length === 1 ? '' : 's'}
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
                                            onClick={() => {
                                                startEdit(item);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <ConfirmDialog
                                            title='Delete product?'
                                            description='This also removes its batch configuration and images.'
                                            onConfirm={() => {
                                                remove.mutate(item.id);
                                            }}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <ScrollBar orientation='horizontal' />
            </ScrollArea>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='sm:max-w-2xl'>
                    <ScrollArea
                        className='max-h-[calc(90vh-3rem)]'
                        viewportClassName='[&>div]:!block [&>div]:!min-w-0'
                    >
                        <form onSubmit={submit} className='grid gap-5 p-1 pr-4'>
                        <DialogHeader>
                            <DialogTitle>
                                {editing ? 'Edit product' : 'New product'}
                            </DialogTitle>
                            <DialogDescription>
                                Slug may be left blank when creating; it will be
                                generated from the name.
                            </DialogDescription>
                        </DialogHeader>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <label className='grid gap-2 text-sm font-medium'>
                                Name
                                <Input
                                    {...register('name', { required: true })}
                                />
                            </label>
                            <label className='grid gap-2 text-sm font-medium'>
                                Slug
                                <Input {...register('slug')} />
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
                                    onCheckedChange={(v) => {
                                        setValue('is_active', v === true);
                                    }}
                                />{' '}
                                Active product
                            </label>
                            <label className='grid gap-2 text-sm font-medium sm:col-span-2'>
                                Description
                                <Textarea {...register('description')} />
                            </label>
                        </div>
                        {editing && (
                            <section className='grid gap-3 border-t pt-5'>
                                <div className='flex items-center justify-between gap-4'>
                                    <div>
                                        <h3 className='text-sm font-medium'>
                                            Image gallery
                                        </h3>
                                        <p className='text-xs text-muted-foreground'>
                                            Upload JPG, PNG, or WebP up to 10
                                            MB.
                                        </p>
                                    </div>
                                    <Button
                                        asChild
                                        type='button'
                                        size='sm'
                                        variant='outline'
                                    >
                                        <label className='cursor-pointer'>
                                            <Upload /> Upload
                                            <input
                                                className='sr-only'
                                                type='file'
                                                accept='image/jpeg,image/png,image/webp'
                                                onChange={(e) =>
                                                    upload(e.target.files?.[0])
                                                }
                                            />
                                        </label>
                                    </Button>
                                </div>
                                <div className='grid gap-3 sm:grid-cols-2'>
                                    {editing.images.map((image, index) => (
                                        <div
                                            key={image.id}
                                            className='flex items-center gap-3 rounded-md border p-2'
                                        >
                                            <Image
                                                src={image.image_url}
                                                alt={`${editing.name} gallery image ${index + 1}`}
                                                width={72}
                                                height={72}
                                                unoptimized
                                                className='size-18 rounded object-cover'
                                            />
                                            <div className='ml-auto flex gap-1'>
                                                <Button
                                                    type='button'
                                                    size='icon'
                                                    variant='ghost'
                                                    aria-label='Move image up'
                                                    onClick={() =>
                                                        move(image, -1)
                                                    }
                                                    disabled={index === 0}
                                                >
                                                    <ArrowUp />
                                                </Button>
                                                <Button
                                                    type='button'
                                                    size='icon'
                                                    variant='ghost'
                                                    aria-label='Move image down'
                                                    onClick={() =>
                                                        move(image, 1)
                                                    }
                                                    disabled={
                                                        index ===
                                                        editing.images.length -
                                                            1
                                                    }
                                                >
                                                    <ArrowDown />
                                                </Button>
                                                <Button
                                                    type='button'
                                                    size='icon'
                                                    variant='ghost'
                                                    aria-label='Delete image'
                                                    onClick={() =>
                                                        deleteImage(image.id)
                                                    }
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {!editing.images.length && (
                                    <p className='rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground'>
                                        No gallery images.
                                    </p>
                                )}
                            </section>
                        )}
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
                                {save.isPending ? 'Saving…' : 'Save product'}
                            </Button>
                        </DialogFooter>
                        </form>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </AdminPage>
    );
}
