'use client';

import TableMenu from '@/components/base/table/TableMenu';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useFormQuery } from '@/hooks/queries';
import type { Form } from '@/types/models/form';
import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ManageForms() {
    const [search, setSearch] = useState('');
    const { data: forms, refetch } = useFormQuery();
    const router = useRouter();
    const columns: ColumnDef<Form>[] = [
        {
            header: 'Title',
            accessorKey: 'title',
            enableGlobalFilter: true,
        },
        {
            header: 'Active',
            accessorKey: 'active',
            cell: ({ row }) => (
                <Badge variant={row.original.active ? 'green' : 'destructive'}>
                    {row.original.active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            header: 'Creator',
            accessorFn: (row) =>
                row.user
                    ? `${row.user.last_name}, ${row.user.first_name}`
                    : 'N/A',
        },
        {
            accessorKey: 'updated_at',
            accessorFn: (row) =>
                dayjs(row.updated_at).format('MMM DD, YYYY hh:mm A'),
            header: 'Last Modified',
        },
    ];

    const onCreate = () => {
        router.push('/dashboard/forms/create');
    };

    return (
        <div className='flex flex-col'>
            <div className='flex md:items-center px-5 mb-4 flex-col md:flex-row'>
                <h4 className='text-2xl mr-4'>Forms</h4>
                <div className='inline-flex gap-4 md:ml-auto print:hidden flex-col md:flex-row mt-2 md:mt-0'>
                    <Input
                        type='search'
                        placeholder='Search'
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                    />
                    <TableMenu onRefresh={refetch} onCreate={onCreate} />
                </div>
            </div>
            <DataTable columns={columns} data={forms ?? []} search={search} />
        </div>
    );
}
