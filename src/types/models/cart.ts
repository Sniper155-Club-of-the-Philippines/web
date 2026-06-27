import type { Model } from '@/types/models/model';
import type { ProductImage } from '@/types/models/store';

export type RecipientType = 'rider' | 'obr';

export interface CartItem extends Model {
    user_id: string;
    batch_id: string;
    product_id: string;
    recipient_type: RecipientType;
    recipient_nickname: string;
    size: string;
    quantity: number;
    product?: {
        name: string;
        images: ProductImage[];
    };
}

/** A cart line presented for display, with resolved price and subtotal. */
export interface CartLine {
    id: string;
    product_id: string;
    name: string;
    images: ProductImage[];
    recipient_type: RecipientType;
    recipient_nickname: string;
    size: string;
    quantity: number;
    price: number;
    subtotal: number;
}
