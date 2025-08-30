'use client';

import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { createVcard } from '@/lib/utils';
import { Profile } from '@/types/models/profile';
import saveAs from 'file-saver';

type Props = {
    profile?: Profile | null;
    name: string;
    className?: string;
};

export default function ProfileButton({ profile, name, className }: Props) {
    const isMobile = useIsMobile();

    if (!isMobile) {
        return null;
    }

    const addToContacts = () => {
        const vcard = createVcard(profile);

        if (!vcard) {
            return;
        }

        const blob = new Blob([vcard.toString()], { type: 'text/vcard' });

        saveAs(blob, `${name}.vcf`);
    };

    return (
        <Button
            variant='outline'
            className={className}
            onClick={(e) => {
                e.preventDefault();
                addToContacts();
            }}
        >
            Add to Contacts
        </Button>
    );
}
