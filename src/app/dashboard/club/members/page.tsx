'use client';

import { user } from '@/api';
import { DataTable } from '@/components/ui/data-table';
import { useHttp } from '@/hooks/http';
import { User } from '@/types/user';
import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import TableMenu from '@/components/base/table/TableMenu';
import { useAtom } from 'jotai';
import { loadingAtom } from '@/atoms/misc';
import { exportToExcel } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import UserActionCell from '@/components/base/table/cells/UserActionCell';
import { useQuery } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import UserForm from '@/components/base/forms/UserForm';
import { UserFormInputs } from '@/types/form';
import { Input } from '@/components/ui/input';

export default function ClubMembers() {
    const http = useHttp();
    const [, setLoading] = useAtom(loadingAtom);
    const printRef = useRef<HTMLDivElement>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [search, setSearch] = useState('');
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

    const handleCreate = async (data: UserFormInputs) => {
        setLoading(true);
        try {
            await user.store(http, data);
            toast('Member created successfully.', {
                closeButton: true,
            });
            setCreateOpen(false);
            refetch();
        } catch (error) {
            console.error(error);
            toast('Unable to create member.', {
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = async () => {
        setLoading(true);
        try {
            const pdf = await user.pdf(http);

            saveAs(pdf, 'members.pdf');
        } catch (error) {
            console.error(error);
            toast('Unable to print PDF', {
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnDef<User>[] = [
        {
            header: 'Name',
            accessorFn: (row) => `${row.last_name}, ${row.first_name}`,
            enableGlobalFilter: true,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            enableGlobalFilter: true,
        },
        {
            accessorKey: 'designation',
            accessorFn: (row) => (row.designation ? row.designation : 'N/A'),
            header: 'Designation',
            enableGlobalFilter: true,
        },
        {
            accessorKey: 'club_number',
            accessorFn: (row) => (row.club_number ? row.club_number : 'N/A'),
            header: 'Club Number',
            enableGlobalFilter: true,
        },
        {
            accessorKey: 'chapter',
            accessorFn: (row) =>
                row.chapter?.name ? row.chapter?.name : 'N/A',
            header: 'Chapter',
            enableGlobalFilter: true,
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
                return <UserActionCell user={row.original} refetch={refetch} />;
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
                <div className='inline-flex gap-4 ml-auto print:hidden'>
                    <Input
                        type='search'
                        placeholder='Search'
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                    />
                    <TableMenu
                        onRefresh={refetch}
                        onExport={exportData}
                        onPrint={handlePrint}
                        onCreate={() => setCreateOpen(true)}
                    />
                    {/* Create Dialog */}
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogContent className='sm:max-w-[800px]'>
                            <DialogHeader>
                                <DialogTitle>Create User</DialogTitle>
                                <DialogDescription>
                                    Fill in the form to add a new member.
                                </DialogDescription>
                            </DialogHeader>

                            <UserForm
                                onSubmit={handleCreate}
                                onCancel={() => setCreateOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <DataTable columns={columns} data={users ?? []} search={search} />
        </div>
    );
}
