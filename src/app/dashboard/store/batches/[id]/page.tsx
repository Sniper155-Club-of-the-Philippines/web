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
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

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
    const [price, setPrice] = useState(
        override ? centavosToPesos(override.price) : '0.00',
    );
    const [selectedSizes, setSelectedSizes] = useState(
        override?.available_sizes ?? sizes,
    );
    const [riderAllowed, setRiderAllowed] = useState(
        override?.rider_allowed ?? true,
    );
    const [obrAllowed, setObrAllowed] = useState(override?.obr_allowed ?? true);
    const [riderLimit, setRiderLimit] = useState(override?.rider_limit ?? 1);
    const [obrLimit, setObrLimit] = useState(override?.obr_limit ?? 1);
    const [active, setActive] = useState(override?.is_active ?? true);
    const save = useMutation({
        mutationFn: () =>
            batch.updateProduct(http, batchId, item.id, {
                price: pesosToCentavos(price),
                available_sizes: selectedSizes,
                rider_allowed: riderAllowed,
                obr_allowed: obrAllowed,
                rider_limit: riderLimit,
                obr_limit: obrLimit,
                is_active: active,
            }),
        onSuccess: () => {
            toast.success(`${item.name} saved.`);
            queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
        },
        onError: (error) =>
            toast.error(apiError(error, 'Unable to save product settings.')),
    });
    const toggleSize = (size: string, checked: boolean) =>
        setSelectedSizes(
            checked
                ? [...selectedSizes, size]
                : selectedSizes.filter((value) => value !== size),
        );
    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!selectedSizes.length)
            return toast.error('Select at least one size.');
        try {
            pesosToCentavos(price);
        } catch (error) {
            return toast.error((error as Error).message);
        }
        save.mutate();
    };

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
                    <Input
                        inputMode='decimal'
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </label>
                <label className='grid gap-2 text-sm font-medium'>
                    Rider limit
                    <Input
                        min={1}
                        type='number'
                        value={riderLimit}
                        onChange={(e) => setRiderLimit(Number(e.target.value))}
                    />
                </label>
                <label className='grid gap-2 text-sm font-medium'>
                    OBR limit
                    <Input
                        min={1}
                        type='number'
                        value={obrLimit}
                        onChange={(e) => setObrLimit(Number(e.target.value))}
                    />
                </label>
                <div className='flex flex-wrap items-end gap-4 pb-2 text-sm'>
                    <label className='flex items-center gap-2'>
                        <Checkbox
                            checked={riderAllowed}
                            onCheckedChange={(v) => setRiderAllowed(v === true)}
                        />{' '}
                        Rider
                    </label>
                    <label className='flex items-center gap-2'>
                        <Checkbox
                            checked={obrAllowed}
                            onCheckedChange={(v) => setObrAllowed(v === true)}
                        />{' '}
                        OBR
                    </label>
                    <label className='flex items-center gap-2'>
                        <Checkbox
                            checked={active}
                            onCheckedChange={(v) => setActive(v === true)}
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
