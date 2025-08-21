'use client';

import { user } from '@/api';
import { DataTable } from '@/components/ui/data-table';
import { useHttp } from '@/hooks/http';
import { User } from '@/types/user';
import { useRef } from 'react';
import dayjs from 'dayjs';
import TableMenu from '@/components/root/table/TableMenu';
import { useAtom } from 'jotai';
import { loadingAtom } from '@/atoms/misc';
import { exportToExcel } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import UserActionCell from '@/components/root/table/cells/UserActionCell';
import { useQuery } from '@tanstack/react-query';

export default function ClubMembers() {
    const http = useHttp();
    const [, setLoading] = useAtom(loadingAtom);
    const printRef = useRef<HTMLDivElement>(null);
    const { data: users, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            setLoading(true);
            try {
                return await user.all(http);
            } finally {
                setLoading(false);
            }
        },
    });

    const handlePrint = async () => {
        setLoading(true);
        try {
            const pdf = await user.pdf(http);

            saveAs(pdf, 'members.pdf');
        } catch (error) {
            console.error(error);
            toast('Unable to print PDF');
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnDef<User>[] = [
        {
            header: 'Name',
            accessorFn: (row) => `${row.last_name}, ${row.first_name}`,
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'designation',
            accessorFn: (row) => (row.designation ? row.designation : 'N/A'),
            header: 'Designation',
        },
        {
            accessorKey: 'club_number',
            accessorFn: (row) => (row.club_number ? row.club_number : 'N/A'),
            header: 'Club Number',
        },
        {
            accessorKey: 'chapter',
            accessorFn: (row) =>
                row.chapter?.name ? row.chapter?.name : 'N/A',
            header: 'Chapter',
        },
        {
            accessorKey: 'created_at',
            accessorFn: (row) =>
                dayjs(row.created_at).format('MMM DD, YYYY hh:mm A'),
            header: 'Created',
        },
        {
            accessorKey: 'updated_at',
            accessorFn: (row) =>
                dayjs(row.updated_at).format('MMM DD, YYYY hh:mm A'),
            header: 'Updated',
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                return <UserActionCell user={row.original} />;
            },
        },
    ];

    const exportData = () => {
        exportToExcel(columns as any, users ?? [], 'members.xlsx');
    };

    return (
        <div ref={printRef} className='flex flex-col'>
            <div className='flex items-center px-5 mb-4'>
                <h4 className='text-2xl'>Members</h4>
                <div className='inline ml-auto print:hidden'>
                    <TableMenu
                        onRefresh={refetch}
                        onExport={exportData}
                        onPrint={handlePrint}
                    />
                </div>
            </div>
            <DataTable columns={columns} data={users ?? []} />
        </div>
    );
}
