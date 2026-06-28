'use client';

import { store } from '@/api';
import MemberPageHeader from '@/components/member/MemberPageHeader';
import StoreProductCard from '@/components/member/StoreProductCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useHttp } from '@/hooks/http';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Store } from 'lucide-react';

export default function MemberStorePage() {
    const http = useHttp();

    const statusQuery = useQuery({
        queryKey: ['store', 'status'],
        queryFn: () => store.status(http),
    });
    const productsQuery = useQuery({
        queryKey: ['store', 'products'],
        queryFn: () => store.products(http),
    });

    const loading = statusQuery.isLoading || productsQuery.isLoading;
    const open = statusQuery.data?.open ?? false;
    const products = productsQuery.data ?? [];

    return (
        <>
            <MemberPageHeader
                title='Member Merchandise'
                description='Official S155CP merchandise for active ordering periods.'
            />

            {loading ? (
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className='h-80 w-full' />
                    ))}
                </div>
            ) : !open ? (
                <Alert>
                    <Store />
                    <AlertTitle>Merchandise closed</AlertTitle>
                    <AlertDescription>
                        Ordering is not open right now. Check back during the
                        next ordering period.
                    </AlertDescription>
                </Alert>
            ) : products.length === 0 ? (
                <Alert>
                    <ShoppingBag />
                    <AlertTitle>No products yet</AlertTitle>
                    <AlertDescription>
                        The active batch has no products available for ordering.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {products.map((product) => (
                        <StoreProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </>
    );
}
