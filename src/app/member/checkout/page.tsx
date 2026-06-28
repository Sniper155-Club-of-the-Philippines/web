'use client';

import { order, paymentMethod } from '@/api';
import MemberPageHeader from '@/components/member/MemberPageHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useHttp } from '@/hooks/http';
import { formatPesos, pesosToCentavos } from '@/lib/money';
import type { PaymentMethod } from '@/types/models/store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { LoaderCircle, ReceiptText, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type ProofInputs = {
    payment_method_id: string;
    payment_ref_no: string;
    paid_amount: string;
    proof: FileList;
};

type ValidationResponse = {
    message?: string;
    errors?: Partial<Record<keyof ProofInputs, string[]>>;
};

export default function MemberCheckoutPage() {
    const http = useHttp();
    const queryClient = useQueryClient();
    const router = useRouter();

    const ordersQuery = useQuery({
        queryKey: ['orders'],
        queryFn: () => order.list(http),
    });
    const methodsQuery = useQuery({
        queryKey: ['payment-methods'],
        queryFn: () => paymentMethod.all(http),
    });

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ProofInputs>();

    // The order awaiting payment: unpaid, or rejected and open for a new proof.
    const openOrder = ordersQuery.data?.find(
        (item) =>
            item.payment_status === 'unpaid' ||
            item.payment_status === 'rejected',
    );
    const methods = (methodsQuery.data ?? []).filter(
        (method) => method.is_active,
    );

    const submit = handleSubmit(async (values) => {
        if (!openOrder) return;

        const proof = values.proof?.[0];
        if (!proof) {
            setError('proof', { message: 'Attach a screenshot of your payment.' });
            return;
        }

        let paidAmount: number | undefined;
        if (values.paid_amount.trim()) {
            try {
                paidAmount = pesosToCentavos(values.paid_amount);
            } catch (error) {
                setError('paid_amount', { message: (error as Error).message });
                return;
            }
        }

        try {
            await order.submitProof(http, openOrder.id, {
                payment_method_id: values.payment_method_id,
                payment_ref_no: values.payment_ref_no || undefined,
                paid_amount: paidAmount,
                proof,
            });
            await queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Payment proof submitted for verification');
            router.push('/member/orders');
        } catch (error) {
            if (isAxiosError<ValidationResponse>(error)) {
                const response = error.response?.data;
                for (const [field, messages] of Object.entries(
                    response?.errors ?? {},
                )) {
                    const message = messages?.[0];
                    if (message) {
                        setError(field as keyof ProofInputs, { message });
                    }
                }
                toast.error(response?.message ?? 'Could not submit your proof');
                return;
            }
            toast.error('Could not submit your proof');
        }
    });

    return (
        <>
            <MemberPageHeader
                title='Checkout'
                description='Pay through any method below, then upload your proof for verification.'
            />

            {ordersQuery.isLoading || methodsQuery.isLoading ? (
                <div className='flex flex-col gap-3'>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className='h-28 w-full' />
                    ))}
                </div>
            ) : !openOrder ? (
                <Alert>
                    <ReceiptText />
                    <AlertTitle>No order to pay</AlertTitle>
                    <AlertDescription>
                        <span>Place an order before submitting a payment.</span>
                        <Button asChild size='sm' className='mt-2 w-fit'>
                            <Link href='/member/cart'>Go to cart</Link>
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : (
                <div className='grid items-start gap-6 lg:grid-cols-[1fr_22rem]'>
                    <section className='flex flex-col gap-4'>
                        <header className='flex items-baseline justify-between'>
                            <h2 className='text-lg font-semibold'>
                                Payment methods
                            </h2>
                            <span className='text-muted-foreground text-sm'>
                                Order {openOrder.order_number}
                            </span>
                        </header>

                        {methods.length === 0 ? (
                            <Alert>
                                <Wallet />
                                <AlertTitle>No payment methods yet</AlertTitle>
                                <AlertDescription>
                                    Payment options will appear here once an
                                    organizer adds them.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className='flex flex-col gap-3'>
                                {methods.map((method) => (
                                    <MethodCard
                                        key={method.id}
                                        method={method}
                                        register={register}
                                    />
                                ))}
                            </div>
                        )}
                        <FieldError errors={[errors.payment_method_id]} />
                    </section>

                    <form
                        onSubmit={submit}
                        noValidate
                        className='bg-card flex flex-col gap-5 rounded-lg border p-5'
                    >
                        <div className='flex items-baseline justify-between'>
                            <span className='text-muted-foreground text-sm'>
                                Total due
                            </span>
                            <span className='text-xl font-semibold'>
                                {formatPesos(openOrder.subtotal)}
                            </span>
                        </div>

                        <FieldGroup>
                            <Field data-invalid={Boolean(errors.proof)}>
                                <FieldLabel htmlFor='proof'>
                                    Proof of payment
                                </FieldLabel>
                                <Input
                                    id='proof'
                                    type='file'
                                    accept='image/*'
                                    aria-invalid={Boolean(errors.proof)}
                                    {...register('proof', {
                                        required: 'Attach a screenshot of your payment.',
                                    })}
                                />
                                <FieldDescription>
                                    A clear screenshot of your transfer or
                                    receipt.
                                </FieldDescription>
                                <FieldError errors={[errors.proof]} />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor='payment_ref_no'>
                                    Reference number (optional)
                                </FieldLabel>
                                <Input
                                    id='payment_ref_no'
                                    {...register('payment_ref_no')}
                                />
                            </Field>

                            <Field data-invalid={Boolean(errors.paid_amount)}>
                                <FieldLabel htmlFor='paid_amount'>
                                    Amount paid (optional)
                                </FieldLabel>
                                <Input
                                    id='paid_amount'
                                    inputMode='decimal'
                                    placeholder='0.00'
                                    aria-invalid={Boolean(errors.paid_amount)}
                                    {...register('paid_amount')}
                                />
                                <FieldError errors={[errors.paid_amount]} />
                            </Field>

                            <Button
                                type='submit'
                                disabled={isSubmitting || methods.length === 0}
                            >
                                {isSubmitting && (
                                    <LoaderCircle
                                        data-icon='inline-start'
                                        className='animate-spin motion-reduce:animate-none'
                                    />
                                )}
                                Submit for verification
                            </Button>
                        </FieldGroup>
                    </form>
                </div>
            )}
        </>
    );
}

function MethodCard({
    method,
    register,
}: {
    method: PaymentMethod;
    register: ReturnType<typeof useForm<ProofInputs>>['register'];
}) {
    return (
        <label className='bg-card hover:border-primary has-[:checked]:border-primary has-[:checked]:ring-primary/30 flex cursor-pointer gap-3 rounded-lg border p-4 transition has-[:checked]:ring-2'>
            <input
                type='radio'
                value={method.id}
                className='mt-1'
                {...register('payment_method_id', {
                    required: 'Choose a payment method.',
                })}
            />
            <div className='flex flex-1 flex-col gap-1'>
                <span className='font-medium'>{method.label}</span>
                <span className='text-muted-foreground text-sm'>
                    {method.account_name} · {method.account_number}
                </span>
                {method.instructions && (
                    <span className='text-muted-foreground text-sm'>
                        {method.instructions}
                    </span>
                )}
                {method.qr_image_url && (
                    <img
                        src={method.qr_image_url}
                        alt={`${method.label} QR code`}
                        className='mt-2 h-40 w-40 rounded border object-contain'
                    />
                )}
            </div>
        </label>
    );
}
