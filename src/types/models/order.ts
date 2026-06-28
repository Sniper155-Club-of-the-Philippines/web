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

export type OrderHistoryType = 'order_status' | 'payment_status' | 'void';

export interface OrderStatusHistory {
    id: string;
    type: OrderHistoryType;
    admin_id: string | null;
    old_value: string | null;
    new_value: string | null;
    remarks: string | null;
    created_at: string | null;
}

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
    payment_method_id: string | null;
    payment_ref_no: string | null;
    paid_amount: number | null;
    proof_submitted_at: string | null;
    reject_reason: string | null;
    voided_at: string | null;
    created_at: string | null;
    items?: OrderItem[];
    histories?: OrderStatusHistory[];
    user?: {
        id: string;
        first_name: string;
        last_name: string;
        club_number: string | null;
        chapter_id: string | null;
        chapter?: {
            id: string;
            name: string;
        } | null;
    };
}

export interface ProofPayload {
    payment_method_id: string;
    payment_ref_no?: string;
    paid_amount?: number;
    proof: File;
}
