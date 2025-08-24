'use client';

import { profile } from '@/api';
import { DataTable } from '@/components/ui/data-table';
import { useHttp } from '@/hooks/http';
import { Profile } from '@/types/models/profile';
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import TableMenu from '@/components/base/table/TableMenu';
import { useAtom } from 'jotai';
import { loadingAtom } from '@/atoms/misc';
import { exportToExcel } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import ProfileActionCell from '@/components/base/table/cells/ProfileActionCell';
import { ProfileFormInputs } from '@/types/form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import ProfileForm from '@/components/base/forms/ProfileForm';
import { Input } from '@/components/ui/input';
import { useProfileQuery } from '@/hooks/queries';

export default function MemberProfile() {
    const http = useHttp();
    const [, setLoading] = useAtom(loadingAtom);
    const printRef = useRef<HTMLDivElement>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [search, setSearch] = useState('');
    const { data: profiles, refetch, isLoading } = useProfileQuery();

    const handleCreate = async (data: ProfileFormInputs) => {
        setLoading(true);
        try {
            await profile.store(http, data);
            toast('Profile created successfully.', {
                closeButton: true,
            });
            setCreateOpen(false);
            refetch();
        } catch (error) {
            console.error(error);
            toast('Unable to create profile.', {
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnDef<Profile>[] = [
        {
            header: 'Member',
            accessorKey: 'user',
            accessorFn: (row) =>
                `${row.user?.last_name}, ${row.user?.first_name}`,
            enableGlobalFilter: true,
        },
        {
            header: 'URL',
            accessorKey: 'url',
            cell: ({ row }) => (
                <a
                    href={row.original.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary hover:underline'
                >
                    {row.original.url}
                </a>
            ),
        },
        {
            header: 'URL (shortened)',
            accessorKey: 'shortened_url',
            cell: ({ row }) => (
                <a
                    href={row.original.shortened_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary hover:underline'
                >
                    {row.original.shortened_url}
                </a>
            ),
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
                return <ProfileActionCell profile={row.original} />;
            },
        },
    ];

    const exportData = () => {
        exportToExcel(columns as any, profiles ?? [], 'profiles.xlsx');
    };

    useEffect(() => {
        setLoading(isLoading);

        return () => {
            setLoading(false);
        };
    }, [isLoading, setLoading]);

    return (
        <div ref={printRef} className='flex flex-col'>
            <div className='flex md:items-center px-5 mb-4 flex-col md:flex-row'>
                <h4 className='text-2xl mr-4'>Profiles</h4>
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
                        onCreate={() => setCreateOpen(true)}
                        disable={['print']}
                    />
                    {/* Create Dialog */}
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogContent className='sm:max-w-[800px]'>
                            <DialogHeader>
                                <DialogTitle>Create Profile</DialogTitle>
                                <DialogDescription>
                                    Fill in the form to add a new profile.
                                </DialogDescription>
                            </DialogHeader>

                            <ProfileForm
                                onSubmit={handleCreate}
                                onCancel={() => setCreateOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={profiles ?? []}
                search={search}
            />
        </div>
    );
}
