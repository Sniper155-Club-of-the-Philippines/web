import type { RecipientType } from '@/types/models/cart';
import type { StoreProduct } from '@/types/models/store';
import type { User } from '@/types/models/user';

export interface RecipientOption {
    type: RecipientType;
    label: string;
    nickname: string;
    limit: number;
}

/**
 * Recipients a member may order this product for. A recipient is offered only
 * when the product allows it AND the member has set the matching nickname —
 * mirroring the cart server rule (which snapshots and requires that nickname).
 * So OBR is hidden for Rider-only products or members without an OBR nickname.
 */
export function recipientOptions(
    product: Pick<
        StoreProduct,
        'rider_allowed' | 'obr_allowed' | 'rider_limit' | 'obr_limit'
    >,
    user: Pick<User, 'rider_nickname' | 'obr_nickname'>,
): RecipientOption[] {
    const options: RecipientOption[] = [];

    if (product.rider_allowed && user.rider_nickname) {
        options.push({
            type: 'rider',
            label: 'Rider',
            nickname: user.rider_nickname,
            limit: product.rider_limit,
        });
    }

    if (product.obr_allowed && user.obr_nickname) {
        options.push({
            type: 'obr',
            label: 'OBR',
            nickname: user.obr_nickname,
            limit: product.obr_limit,
        });
    }

    return options;
}
