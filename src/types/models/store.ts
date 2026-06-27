import type { Model } from '@/types/models/model';

export interface BatchProduct extends Model {
    batch_id: string;
    product_id: string;
    price: number;
    available_sizes: string[];
    rider_allowed: boolean;
    obr_allowed: boolean;
    rider_limit: number;
    obr_limit: number;
    is_active: boolean;
}

export interface Batch extends Model {
    name: string;
    sequence: number;
    ordering_start_at: string;
    ordering_end_at: string;
    is_active: boolean;
    notes: string | null;
    batch_products?: BatchProduct[];
}

export interface ProductImage extends Model {
    product_id: string;
    image_url: string;
    sort_order: number;
}

export interface Product extends Model {
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    sort_order: number;
    images: ProductImage[];
}

export interface PaymentMethod extends Model {
    label: string;
    type: 'gcash' | 'bank' | 'other';
    account_name: string;
    account_number: string;
    qr_image_url: string | null;
    instructions: string | null;
    is_active: boolean;
    sort_order: number;
}

/** A product of the active batch, flattened with its per-batch override. */
export interface StoreProduct {
    id: string;
    batch_product_id: string;
    name: string;
    slug: string;
    description: string | null;
    images: ProductImage[];
    price: number;
    available_sizes: string[];
    rider_allowed: boolean;
    obr_allowed: boolean;
    rider_limit: number;
    obr_limit: number;
}

export interface StoreStatus {
    open: boolean;
    batch: Batch | null;
}
