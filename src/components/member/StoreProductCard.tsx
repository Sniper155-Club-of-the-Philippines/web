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
import ProductImageGallery from '@/components/member/ProductImageGallery';

export default function StoreProductCard({
    product,
}: {
    product: StoreProduct;
}) {
    return (
        <Card className='overflow-hidden pt-0 gap-3 md:gap-6 pb-3 md:pb-6'>
            <ProductImageGallery images={product.images} name={product.name} />
            <CardHeader className='px-2 md:px-6'>
                <CardTitle className='text-base'>{product.name}</CardTitle>
                <p className='text-lg font-semibold'>
                    {formatPesos(product.price)}
                </p>
            </CardHeader>
            <CardContent className='px-2 md:px-6 flex flex-wrap gap-1'>
                {product.available_sizes.map((size) => (
                    <Badge key={size} variant='secondary'>
                        {size}
                    </Badge>
                ))}
            </CardContent>
            <CardFooter className='px-2 md:px-6'>
                <StoreProductDialog product={product}>
                    <Button className='w-full'>Order</Button>
                </StoreProductDialog>
            </CardFooter>
        </Card>
    );
}
