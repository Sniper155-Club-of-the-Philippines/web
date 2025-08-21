'use client';

import { chapter } from '@/api';
import { DataTable } from '@/components/ui/data-table';
import { useHttp } from '@/hooks/http';
import { Chapter } from '@/types/chapter';
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import TableMenu from '@/components/base/table/TableMenu';
import { useAtom } from 'jotai';
import { loadingAtom } from '@/atoms/misc';
import { exportToExcel } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import ChapterActionCell from '@/components/base/table/cells/ChapterActionCell';
import { useQuery } from '@tanstack/react-query';
import { ChapterFormInputs } from '@/types/form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import ChapterForm from '@/components/base/forms/ChapterForm';
import { Input } from '@/components/ui/input';

export default function ClubChapters() {
    const http = useHttp();
    const [, setLoading] = useAtom(loadingAtom);
    const printRef = useRef<HTMLDivElement>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [search, setSearch] = useState('');
    const {
        data: chapters,
        refetch,
        isLoading,
    } = useQuery({
        queryKey: ['chapters'],
        queryFn: () => chapter.all(http),
    });

    const handleCreate = async (data: ChapterFormInputs) => {
        setLoading(true);
        try {
            await chapter.store(http, data);
            toast('Chapter created successfully.', {
                closeButton: true,
            });
            setCreateOpen(false);
            refetch();
        } catch (error) {
            console.error(error);
            toast('Unable to create chapter.', {
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = async () => {
        setLoading(true);
        try {
            const pdf = await chapter.pdf(http);

            saveAs(pdf, 'chapters.pdf');
        } catch (error) {
            console.error(error);
            toast('Unable to print PDF', {
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnDef<Chapter>[] = [
        {
            header: 'Name',
            accessorKey: 'name',
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
                return <ChapterActionCell chapter={row.original} />;
            },
        },
    ];

    const exportData = () => {
        exportToExcel(columns as any, chapters ?? [], 'chapters.xlsx');
    };

    useEffect(() => {
        setLoading(isLoading);

        return () => {
            setLoading(false);
        };
    }, [isLoading, setLoading]);

    return (
        <div ref={printRef} className='flex flex-col'>
            <div className='flex items-center px-5 mb-4'>
                <h4 className='text-2xl'>Chapters</h4>
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

                            <ChapterForm
                                onSubmit={handleCreate}
                                onCancel={() => setCreateOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={chapters ?? []}
                search={search}
            />
        </div>
    );
}
