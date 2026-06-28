import type { RecipientType } from '@/types/models/cart';

export type PaymentStatus =
    'unpaid' | 'proof_submitted' | 'approved' | 'rejected';

export type OrderStatus =
    | 'order_received'
    | 'tallying_orders'
    | 'in_production'
    | 'quality_checking'
    | 'received_by_national'
    | 'ready_for_shipment'
    | 'completed';

export interface OrderItem {
    id: string;
    product_id: string | null;
    product_name: string;
    recipient_type: RecipientType;
    recipient_nickname: string;
    size: string;
    quantity: number;
    unit_price: number;
    line_total: number;
}

export interface Order {
    id: string;
    order_number: string;
    user_id: string;
    batch_id: string;
    order_status: OrderStatus | null;
    payment_status: PaymentStatus;
    subtotal: number;
    items?: OrderItem[];
}
