'use client';

import { user } from '@/api';
import { DataTable } from '@/components/ui/data-table';
import { useHttp } from '@/hooks/http';
import { User } from '@/types/models/user';
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
import { useUserQuery } from '@/hooks/queries';
import { userAtom } from '@/atoms/auth';

export default function ClubMembers() {
    const http = useHttp();
    const [, setLoading] = useAtom(loadingAtom);
    const printRef = useRef<HTMLDivElement>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [search, setSearch] = useState('');
    const { data: users, refetch } = useUserQuery();
    const [me] = useAtom(userAtom);

    const handleCreate = async (data: UserFormInputs) => {
        setLoading(true);
        try {
            await user.store(http, data);
            toast.success('Member created successfully.', {
                closeButton: true,
            });
            setCreateOpen(false);
            refetch();
        } catch (error) {
            console.error(error);
            toast.error('Unable to create member.', {
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
            toast.error('Unable to print PDF', {
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
            accessorKey: 'address',
            header: 'Address',
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
                if (row.original.id === me?.id) {
                    return null;
                }

                return <UserActionCell user={row.original} refetch={refetch} />;
            },
        },
    ];

    const exportData = () => {
        exportToExcel(columns as any, users ?? [], 'members.xlsx');
    };

    return (
        <div ref={printRef} className='flex flex-col'>
            <div className='flex md:items-center px-5 mb-4 flex-col md:flex-row'>
                <h4 className='text-2xl mr-4'>Members</h4>
                <div className='inline-flex gap-4 md:ml-auto print:hidden flex-col md:flex-row mt-2 md:mt-0'>
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
