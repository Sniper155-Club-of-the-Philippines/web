import { searchArray } from '@/lib/utils';
import { Profile } from '@/types/models/profile';
import { KeyOf } from '@/types/object';
import { VCard } from '@scr2em/vcard';
import { useMemo } from 'react';

export function useSearchFilter<T>(
    items: T[] | undefined,
    search: string,
    keys: KeyOf<T>[]
) {
    return useMemo(() => {
        return searchArray(items, search, keys);
    }, [items, search, keys]);
}

export function useVCard(profile?: Profile | null) {
    return useMemo(() => {
        if (!profile?.user) {
            return null;
        }

        const user = profile.user;

        const card = new VCard()
            .setName(user.first_name, user.last_name)
            .setOrganization('Sniper 155 Club of the Philippines Inc.')
            .addUrl({
                label: 'Profile',
                value: profile.url,
                type: 'home',
            });

        if (user.designation) {
            card.setJobTitle(user.designation);
        }

        if (user.phone) {
            card.addPhone({
                label: 'Phone',
                type: 'cell',
                value: user.phone,
            });
        }

        return card;
    }, [profile]);
}
