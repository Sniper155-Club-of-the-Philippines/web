'use client';

import { userAtom } from '@/atoms/auth';
import { Separator } from '@/components/ui/separator';
import { useAtomValue } from 'jotai';

export default function MemberIdentity() {
    const user = useAtomValue(userAtom);
    const rows = [
        ['Name', [user?.first_name, user?.last_name].filter(Boolean).join(' ')],
        ['Club number', user?.club_number],
        ['Email', user?.email],
        ['Chapter', user?.chapter?.name],
        ['Designation', user?.designation],
        ['Region', user?.region],
    ];

    return (
        <dl className='flex flex-col'>
            {rows.map(([label, value], index) => (
                <div key={label}>
                    {index > 0 && <Separator />}
                    <div className='flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6'>
                        <dt className='text-muted-foreground text-sm'>
                            {label}
                        </dt>
                        <dd className='text-sm font-medium sm:text-right'>
                            {value || 'Not set'}
                        </dd>
                    </div>
                </div>
            ))}
        </dl>
    );
}
