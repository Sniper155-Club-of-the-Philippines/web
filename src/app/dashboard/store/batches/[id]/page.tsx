'use client';

import { batch, product } from '@/api';
import { AdminPage } from '@/components/admin/AdminPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useHttp } from '@/hooks/http';
import { apiError } from '@/lib/api-error';
import { centavosToPesos, pesosToCentavos } from '@/lib/money';
import type { BatchProduct, Product } from '@/types/models/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

type OverrideInputs = {
    price: string;
    available_sizes: string[];
    rider_allowed: boolean;
    obr_allowed: boolean;
    rider_limit: number;
    obr_limit: number;
    is_active: boolean;
};

function ProductOverride({
    product: item,
    override,
    batchId,
}: {
    product: Product;
    override?: BatchProduct;
    batchId: string;
}) {
    const http = useHttp();
    const queryClient = useQueryClient();
    const { register, handleSubmit, watch, setValue } = useForm<OverrideInputs>(
        {
            defaultValues: {
                price: override ? centavosToPesos(override.price) : '0.00',
                available_sizes: override?.available_sizes ?? sizes,
                rider_allowed: override?.rider_allowed ?? true,
                obr_allowed: override?.obr_allowed ?? true,
                rider_limit: override?.rider_limit ?? 1,
                obr_limit: override?.obr_limit ?? 1,
                is_active: override?.is_active ?? true,
            },
        },
    );
    const selectedSizes = watch('available_sizes');
    const riderAllowed = watch('rider_allowed');
    const obrAllowed = watch('obr_allowed');
    const active = watch('is_active');
    const save = useMutation({
        mutationFn: (values: OverrideInputs) =>
            batch.updateProduct(http, batchId, item.id, {
                price: pesosToCentavos(values.price),
                available_sizes: values.available_sizes,
                rider_allowed: values.rider_allowed,
                obr_allowed: values.obr_allowed,
                rider_limit: values.rider_limit,
                obr_limit: values.obr_limit,
                is_active: values.is_active,
            }),
        onSuccess: () => {
            toast.success(`${item.name} saved.`);
            queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
        },
        onError: (error) =>
            toast.error(apiError(error, 'Unable to save product settings.')),
    });
    const toggleSize = (size: string, checked: boolean) =>
        setValue(
            'available_sizes',
            checked
                ? [...selectedSizes, size]
                : selectedSizes.filter((value) => value !== size),
        );
    const submit = handleSubmit((values) => {
        if (!values.available_sizes.length)
            return toast.error('Select at least one size.');
        try {
            pesosToCentavos(values.price);
        } catch (error) {
            return toast.error((error as Error).message);
        }
        save.mutate(values);
    });

    return (
        <form
            onSubmit={submit}
            className='grid gap-5 border-b p-5 last:border-b-0'
        >
            <div className='flex flex-wrap items-start justify-between gap-3'>
                <div>
                    <h2 className='font-medium'>{item.name}</h2>
                    <p className='text-sm text-muted-foreground'>
                        {item.description || 'No description'}
                    </p>
                </div>
                <Badge variant={override ? 'default' : 'secondary'}>
                    {override ? 'Configured' : 'Using defaults'}
                </Badge>
            </div>
            <div className='grid gap-4 lg:grid-cols-4'>
                <label className='grid gap-2 text-sm font-medium'>
                    Price (PHP)
                    <Input inputMode='decimal' {...register('price')} />
                </label>
                <label className='grid gap-2 text-sm font-medium'>
                    Rider limit
                    <Input
                        min={1}
                        type='number'
                        {...register('rider_limit', { valueAsNumber: true })}
                    />
                </label>
                <label className='grid gap-2 text-sm font-medium'>
                    OBR limit
                    <Input
                        min={1}
                        type='number'
                        {...register('obr_limit', { valueAsNumber: true })}
                    />
                </label>
                <div className='flex flex-wrap items-end gap-4 pb-2 text-sm'>
                    <label className='flex items-center gap-2'>
                        <Checkbox
                            checked={riderAllowed}
                            onCheckedChange={(v) =>
                                setValue('rider_allowed', v === true)
                            }
                        />{' '}
                        Rider
                    </label>
                    <label className='flex items-center gap-2'>
                        <Checkbox
                            checked={obrAllowed}
                            onCheckedChange={(v) =>
                                setValue('obr_allowed', v === true)
                            }
                        />{' '}
                        OBR
                    </label>
                    <label className='flex items-center gap-2'>
                        <Checkbox
                            checked={active}
                            onCheckedChange={(v) =>
                                setValue('is_active', v === true)
                            }
                        />{' '}
                        Active
                    </label>
                </div>
            </div>
            <fieldset>
                <legend className='mb-2 text-sm font-medium'>
                    Available sizes
                </legend>
                <div className='flex flex-wrap gap-4'>
                    {sizes.map((size) => (
                        <label
                            key={size}
                            className='flex items-center gap-2 text-sm'
                        >
                            <Checkbox
                                checked={selectedSizes.includes(size)}
                                onCheckedChange={(v) =>
                                    toggleSize(size, v === true)
                                }
                            />{' '}
                            {size}
                        </label>
                    ))}
                </div>
            </fieldset>
            <div>
                <Button size='sm' disabled={save.isPending}>
                    {save.isPending ? 'Saving…' : 'Save product'}
                </Button>
            </div>
        </form>
    );
}

export default function BatchProductsPage() {
    const { id } = useParams<{ id: string }>();
    const http = useHttp();
    const batchQuery = useQuery({
        queryKey: ['batch', id],
        queryFn: () => batch.show(http, id),
    });
    const productsQuery = useQuery({
        queryKey: ['products'],
        queryFn: () => product.all(http),
    });
    const overrides = new Map(
        batchQuery.data?.batch_products?.map((item) => [item.product_id, item]),
    );

    return (
        <AdminPage
            title={batchQuery.data?.name ?? 'Batch products'}
            description='Set the price, sizes, eligibility, and limits for each catalog product in this batch.'
            action={
                <Button asChild variant='outline'>
                    <Link href='/dashboard/store/batches'>Back to batches</Link>
                </Button>
            }
        >
            <div className='overflow-hidden rounded-lg border'>
                {(batchQuery.isLoading || productsQuery.isLoading) && (
                    <p className='p-8 text-center text-sm text-muted-foreground'>
                        Loading products…
                    </p>
                )}
                {!productsQuery.isLoading && !productsQuery.data?.length && (
                    <p className='p-8 text-center text-sm text-muted-foreground'>
                        Create catalog products first.
                    </p>
                )}
                {productsQuery.data?.map((item) => (
                    <ProductOverride
                        key={item.id}
                        product={item}
                        override={overrides.get(item.id)}
                        batchId={id}
                    />
                ))}
            </div>
        </AdminPage>
    );
}
