import { describe, expect, it } from 'vitest';
import type { Order, OrderStatus, PaymentStatus } from '@/types/models/order';
import {
    canSubmitProof,
    canVoid,
    orderStatusLabel,
    orderTab,
    paymentStatusLabel,
    paymentStatusVariant,
} from './order';

function order(overrides: Partial<Order> = {}): Order {
    return {
        id: 'o1',
        order_number: 'S155-B1-0001',
        user_id: 'u1',
        batch_id: 'b1',
        order_status: null,
        payment_status: 'unpaid',
        subtotal: 125000,
        payment_method_id: null,
        payment_ref_no: null,
        paid_amount: null,
        proof_submitted_at: null,
        reject_reason: null,
        voided_at: null,
        created_at: null,
        ...overrides,
    };
}

describe('orderTab', () => {
    it('buckets a fulfilled order as completed', () => {
        expect(
            orderTab(order({ order_status: 'completed', payment_status: 'approved' })),
        ).toBe('completed');
    });

    it('buckets an approved, still-in-production order as to-receive', () => {
        expect(
            orderTab(order({ order_status: 'in_production', payment_status: 'approved' })),
        ).toBe('to-receive');
    });

    it('buckets unpaid, awaiting, and rejected orders as to-pay', () => {
        for (const status of ['unpaid', 'proof_submitted', 'rejected'] as PaymentStatus[]) {
            expect(orderTab(order({ payment_status: status }))).toBe('to-pay');
        }
    });
});

describe('status labels', () => {
    it('labels every payment status', () => {
        const statuses: PaymentStatus[] = [
            'unpaid',
            'proof_submitted',
            'approved',
            'rejected',
        ];
        for (const status of statuses) {
            expect(paymentStatusLabel(status)).not.toBe('');
        }
    });

    it('labels a null order status as awaiting payment', () => {
        expect(orderStatusLabel(null)).toBe('Awaiting payment');
    });

    it('labels a known order status', () => {
        expect(orderStatusLabel('in_production' as OrderStatus)).toBe('In production');
    });

    it('maps a badge variant for every payment status', () => {
        expect(paymentStatusVariant('unpaid')).toBe('outline');
        expect(paymentStatusVariant('proof_submitted')).toBe('secondary');
        expect(paymentStatusVariant('approved')).toBe('default');
        expect(paymentStatusVariant('rejected')).toBe('destructive');
    });
});

describe('member actions', () => {
    it('allows proof on unpaid and rejected only', () => {
        expect(canSubmitProof(order({ payment_status: 'unpaid' }))).toBe(true);
        expect(canSubmitProof(order({ payment_status: 'rejected' }))).toBe(true);
        expect(canSubmitProof(order({ payment_status: 'proof_submitted' }))).toBe(false);
        expect(canSubmitProof(order({ payment_status: 'approved' }))).toBe(false);
    });

    it('allows void on unpaid only', () => {
        expect(canVoid(order({ payment_status: 'unpaid' }))).toBe(true);
        expect(canVoid(order({ payment_status: 'proof_submitted' }))).toBe(false);
    });
});
