'use client';

import { cart } from '@/api';
import { userAtom } from '@/atoms/auth';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useHttp } from '@/hooks/http';
import { formatPesos } from '@/lib/money';
import { recipientOptions } from '@/lib/store';
import type { RecipientType } from '@/types/models/cart';
import type { StoreProduct } from '@/types/models/store';
import { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import ProductImageGallery from '@/components/member/ProductImageGallery';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function StoreProductDialog({
    product,
    children,
    onAdded,
}: {
    product: StoreProduct;
    children: React.ReactNode;
    onAdded?: () => void;
}) {
    const http = useHttp();
    const user = useAtomValue(userAtom);
    const recipients = useMemo(
        () => (user ? recipientOptions(product, user) : []),
        [product, user],
    );

    const [open, setOpen] = useState(false);
    const [size, setSize] = useState(product.available_sizes[0] ?? '');
    const [recipientType, setRecipientType] = useState<RecipientType | ''>(
        recipients[0]?.type ?? '',
    );
    const [quantity, setQuantity] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    const recipient = recipients.find((r) => r.type === recipientType);
    const canSubmit = Boolean(size) && Boolean(recipient) && quantity >= 1;

    const submit = async () => {
        if (!recipient) {
            return;
        }

        setSubmitting(true);
        try {
            await cart.add(http, {
                product_id: product.id,
                recipient_type: recipient.type,
                size,
                quantity,
            });
            toast.success('Added to cart');
            setOpen(false);
            onAdded?.();
        } catch (error) {
            const message = isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message
                : undefined;
            toast.error(message ?? 'Unable to add to cart');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className='p-0 sm:max-w-3xl'>
                <ScrollArea
                    className='max-h-[calc(100svh-2rem)]'
                    viewportClassName='[&>div]:!block [&>div]:!min-w-0'
                >
                    <div className='grid gap-5 p-6'>
                        <DialogHeader>
                            <DialogTitle>{product.name}</DialogTitle>
                            <DialogDescription>
                                {formatPesos(product.price)}
                                {product.description
                                    ? ` · ${product.description}`
                                    : ''}
                            </DialogDescription>
                        </DialogHeader>

                        <div className='grid items-start gap-5 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'>
                            <ProductImageGallery
                                images={product.images}
                                name={product.name}
                                showThumbnails
                            />

                            {recipients.length === 0 ? (
                                <p className='text-muted-foreground text-sm'>
                                    Set the matching rider or OBR nickname on
                                    your profile before ordering this item.
                                </p>
                            ) : (
                                <div className='flex flex-col gap-4'>
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor='store-size'>Size</Label>
                                        <Select
                                            value={size}
                                            onValueChange={setSize}
                                        >
                                            <SelectTrigger id='store-size'>
                                                <SelectValue placeholder='Select size' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {product.available_sizes.map(
                                                    (value) => (
                                                        <SelectItem
                                                            key={value}
                                                            value={value}
                                                        >
                                                            {value}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <Label>Recipient</Label>
                                        <RadioGroup
                                            value={recipientType}
                                            onValueChange={(value) => {
                                                if (
                                                    value === 'rider' ||
                                                    value === 'obr'
                                                ) {
                                                    setRecipientType(value);
                                                    setQuantity(1);
                                                }
                                            }}
                                        >
                                            {recipients.map((option) => (
                                                <Label
                                                    key={option.type}
                                                    className='flex items-center gap-2 font-normal'
                                                >
                                                    <RadioGroupItem
                                                        value={option.type}
                                                    />
                                                    {option.label} (
                                                    {option.nickname}) · up to{' '}
                                                    {option.limit}
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor='store-qty'>
                                            Quantity
                                        </Label>
                                        <Input
                                            id='store-qty'
                                            type='number'
                                            min={1}
                                            max={recipient?.limit ?? 1}
                                            value={quantity}
                                            onChange={(event) => {
                                                setQuantity(
                                                    Math.max(
                                                        1,
                                                        Number(
                                                            event.target.value,
                                                        ) || 1,
                                                    ),
                                                );
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={submit}
                                disabled={!canSubmit || submitting}
                            >
                                {submitting && (
                                    <LoaderCircle
                                        data-icon='inline-start'
                                        className='animate-spin motion-reduce:animate-none'
                                    />
                                )}
                                Add to cart
                            </Button>
                        </DialogFooter>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
