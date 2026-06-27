'use client';

import StoreProductDialog from '@/components/member/StoreProductDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatPesos } from '@/lib/money';
import type { StoreProduct } from '@/types/models/store';
import { ImageOff } from 'lucide-react';
import Image from 'next/image';

export default function StoreProductCard({
    product,
}: {
    product: StoreProduct;
}) {
    const cover = product.images[0];

    return (
        <Card className='overflow-hidden pt-0'>
            <div className='bg-muted relative flex aspect-square items-center justify-center'>
                {cover ? (
                    <Image
                        src={cover.image_url}
                        alt={product.name}
                        fill
                        sizes='(min-width: 768px) 33vw, 100vw'
                        className='object-cover'
                        unoptimized
                    />
                ) : (
                    <ImageOff className='text-muted-foreground size-10' />
                )}
            </div>
            <CardHeader>
                <CardTitle className='text-base'>{product.name}</CardTitle>
                <p className='text-lg font-semibold'>
                    {formatPesos(product.price)}
                </p>
            </CardHeader>
            <CardContent className='flex flex-wrap gap-1'>
                {product.available_sizes.map((size) => (
                    <Badge key={size} variant='secondary'>
                        {size}
                    </Badge>
                ))}
            </CardContent>
            <CardFooter>
                <StoreProductDialog product={product}>
                    <Button className='w-full'>Order</Button>
                </StoreProductDialog>
            </CardFooter>
        </Card>
    );
}
