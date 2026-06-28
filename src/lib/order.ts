import type { Order, OrderStatus, PaymentStatus } from '@/types/models/order';

export type OrderTab = 'to-pay' | 'to-receive' | 'completed';

/**
 * Which member tab an order belongs to. Completed once fulfilled; To Receive
 * once payment is approved and still in production; otherwise To Pay (unpaid,
 * awaiting verification, or rejected and needing a new proof).
 */
export function orderTab(order: Order): OrderTab {
    if (order.order_status === 'completed') return 'completed';
    if (order.payment_status === 'approved') return 'to-receive';
    return 'to-pay';
}

export const orderTabs: { value: OrderTab; label: string }[] = [
    { value: 'to-pay', label: 'To Pay' },
    { value: 'to-receive', label: 'To Receive' },
    { value: 'completed', label: 'Completed' },
];

const paymentLabels: Record<PaymentStatus, string> = {
    unpaid: 'Unpaid',
    proof_submitted: 'Awaiting verification',
    approved: 'Payment approved',
    rejected: 'Payment rejected',
};

const orderStatusLabels: Record<OrderStatus, string> = {
    order_received: 'Order received',
    tallying_orders: 'Tallying orders',
    in_production: 'In production',
    quality_checking: 'Quality checking',
    received_by_national: 'Received by national',
    ready_for_shipment: 'Ready for shipment',
    completed: 'Completed',
};

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const paymentVariants: Record<PaymentStatus, BadgeVariant> = {
    unpaid: 'outline',
    proof_submitted: 'secondary',
    approved: 'default',
    rejected: 'destructive',
};

export function paymentStatusLabel(status: PaymentStatus): string {
    return paymentLabels[status];
}

export function paymentStatusVariant(status: PaymentStatus): BadgeVariant {
    return paymentVariants[status];
}

/** The pipeline stages, in fulfillment order, for admin status controls. */
export const orderStatuses: { value: OrderStatus; label: string }[] = (
    Object.keys(orderStatusLabels) as OrderStatus[]
).map((value) => ({ value, label: orderStatusLabels[value] }));

export function orderStatusLabel(status: OrderStatus | null): string {
    return status ? orderStatusLabels[status] : 'Awaiting payment';
}

/** A member may still pay (or re-pay) only while unpaid or rejected. */
export function canSubmitProof(order: Order): boolean {
    return (
        order.payment_status === 'unpaid' ||
        order.payment_status === 'rejected'
    );
}

/** A member may self-void only an order that is still unpaid. */
export function canVoid(order: Order): boolean {
    return order.payment_status === 'unpaid';
}
