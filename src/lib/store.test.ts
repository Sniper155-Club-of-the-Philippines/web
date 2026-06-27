import { describe, expect, it } from 'vitest';
import { recipientOptions } from '@/lib/store';

const product = {
    rider_allowed: true,
    obr_allowed: true,
    rider_limit: 2,
    obr_limit: 1,
};

describe('recipientOptions', () => {
    it('offers both recipients when allowed and both nicknames set', () => {
        const options = recipientOptions(product, {
            rider_nickname: 'Maverick',
            obr_nickname: 'Iceman',
        });

        expect(options).toEqual([
            { type: 'rider', label: 'Rider', nickname: 'Maverick', limit: 2 },
            { type: 'obr', label: 'OBR', nickname: 'Iceman', limit: 1 },
        ]);
    });

    it('hides OBR for rider-only products', () => {
        const options = recipientOptions(
            { ...product, obr_allowed: false },
            { rider_nickname: 'Maverick', obr_nickname: 'Iceman' },
        );

        expect(options.map((o) => o.type)).toEqual(['rider']);
    });

    it('hides OBR when the member has no OBR nickname', () => {
        const options = recipientOptions(product, {
            rider_nickname: 'Maverick',
            obr_nickname: null,
        });

        expect(options.map((o) => o.type)).toEqual(['rider']);
    });

    it('hides Rider when the member has no rider nickname', () => {
        const options = recipientOptions(product, {
            rider_nickname: undefined,
            obr_nickname: 'Iceman',
        });

        expect(options.map((o) => o.type)).toEqual(['obr']);
    });

    it('returns nothing when no recipient is eligible', () => {
        expect(
            recipientOptions(
                { ...product, rider_allowed: false, obr_allowed: false },
                { rider_nickname: 'Maverick', obr_nickname: 'Iceman' },
            ),
        ).toEqual([]);
    });
});
