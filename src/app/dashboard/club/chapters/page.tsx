'use client';

import { chapter } from '@/api';
import { DataTable } from '@/components/ui/data-table';
import { useHttp } from '@/hooks/http';
import { Chapter } from '@/types/chapter';
import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import TableMenu from '@/components/root/table/TableMenu';
import { useAtom } from 'jotai';
import { loadingAtom } from '@/atoms/misc';
import { exportToExcel } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import ChapterActionCell from '@/components/root/table/cells/ChapterActionCell';
import { useQuery } from '@tanstack/react-query';

export default function ClubChapters() {
    const http = useHttp();
    const [, setLoading] = useAtom(loadingAtom);
    const printRef = useRef<HTMLDivElement>(null);
    const {
        data: chapters,
        refetch,
        isLoading,
    } = useQuery({
        queryKey: ['chapters'],
        queryFn: () => chapter.all(http),
    });

    const handlePrint = async () => {
        setLoading(true);
        try {
            const pdf = await chapter.pdf(http);

            saveAs(pdf, 'chapters.pdf');
        } catch (error) {
            console.error(error);
            toast('Unable to print PDF');
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnDef<Chapter>[] = [
        {
            header: 'Name',
            accessorKey: 'name',
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
                <div className='inline ml-auto print:hidden'>
                    <TableMenu
                        onRefresh={refetch}
                        onExport={exportData}
                        onPrint={handlePrint}
                    />
                </div>
            </div>
            <DataTable columns={columns} data={chapters ?? []} />
        </div>
    );
}
