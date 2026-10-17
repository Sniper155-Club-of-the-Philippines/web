'use client';

import { useQuery } from '@tanstack/react-query';

import { user as api } from '@/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useHttp } from '@/hooks/http';
import { userChangeRow } from '@/lib/user-changes';
import { User } from '@/types/models/user';

type Props = {
    userId: User['id'];
};

/**
 * Every change to a member's personal info, newest first, so the club can
 * check what a member had on file at any point (for example their size when
 * they ordered).
 */
export default function MemberChangeLog({ userId }: Props) {
    const http = useHttp();
    const { data, isPending, isError } = useQuery({
        queryKey: ['users', userId, 'changes'],
        queryFn: () => api.changes(http, userId),
    });

    if (isPending) {
        return <p className='text-sm text-muted-foreground'>Loading...</p>;
    }

    if (isError) {
        return (
            <p className='text-sm text-destructive'>
                Unable to load the change history.
            </p>
        );
    }

    if (data.length === 0) {
        return (
            <p className='text-sm text-muted-foreground'>
                No changes recorded yet.
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>By</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map(userChangeRow).map((row) => (
                    <TableRow key={row.id}>
                        <TableCell className='text-muted-foreground'>
                            {row.when}
                        </TableCell>
                        <TableCell>{row.field}</TableCell>
                        <TableCell
                            className='max-w-48 truncate'
                            title={row.from}
                        >
                            {row.from}
                        </TableCell>
                        <TableCell className='max-w-48 truncate' title={row.to}>
                            {row.to}
                        </TableCell>
                        <TableCell>{row.by}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
