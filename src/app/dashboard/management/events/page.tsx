'use client';

import { event } from '@/api';
import { DataTable, DataTableRef } from '@/components/ui/data-table';
import { useHttp } from '@/hooks/http';
import { Event } from '@/types/models/event';
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import TableMenu from '@/components/base/table/TableMenu';
import { useAtom } from 'jotai';
import { loadingAtom } from '@/atoms/misc';
import { exportToExcel } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { EventFormInputs } from '@/types/form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import EventActionCell from '@/components/base/table/cells/EventActionCell';
import { Input } from '@/components/ui/input';
import EventForm from '@/components/base/forms/EventForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventPanel from '@/components/root/panels/EventPanel';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useEventQuery } from '@/hooks/queries';

export default function Events() {
    const http = useHttp();
    const [, setLoading] = useAtom(loadingAtom);
    const printRef = useRef<HTMLDivElement>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('list');
    const [scrollIndex, setScrollIndex] = useState<number | null>(null);
    const { data: events, refetch, isLoading } = useEventQuery();
    const dataTableRef = useRef<DataTableRef>(null);

    const handleCreate = async (data: EventFormInputs) => {
        setLoading(true);
        try {
            await event.store(http, data);
            toast('Event created successfully.', {
                closeButton: true,
            });
            setCreateOpen(false);
            refetch();
        } catch (error) {
            console.error(error);
            toast('Unable to create event.', {
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = (id: string) => {
        const index = events?.findIndex((e) => e.id === id);

        if (typeof index === 'number' && index >= 0) {
            setActiveTab('preview');
            setScrollIndex(index);
        }
    };

    useEffect(() => {
        if (activeTab === 'preview' && typeof scrollIndex === 'number') {
            const scrollToIndex =
                dataTableRef.current?.virtualizer?.scrollToIndex;

            if (scrollToIndex) {
                scrollToIndex(scrollIndex);
            }

            setScrollIndex(null);
        }
    }, [activeTab, scrollIndex, setScrollIndex]);

    const columns: ColumnDef<Event>[] = [
        {
            header: 'Title',
            accessorKey: 'title',
            enableGlobalFilter: true,
        },
        {
            header: 'Start',
            accessorKey: 'start',
            accessorFn: (row) => dayjs(row.start).format('MMMM DD, YYYY'),
            enableGlobalFilter: true,
        },
        {
            header: 'End',
            accessorKey: 'end',
            accessorFn: (row) => dayjs(row.end).format('MMMM DD, YYYY'),
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
                return (
                    <EventActionCell
                        event={row.original}
                        onPreview={() => handlePreview(row.original.id)}
                    />
                );
            },
        },
    ];

    const exportData = () => {
        exportToExcel(columns as any, events ?? [], 'events.xlsx');
    };

    useEffect(() => {
        setLoading(isLoading);

        return () => {
            setLoading(false);
        };
    }, [isLoading, setLoading]);

    return (
        <div ref={printRef} className='flex flex-col'>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className='flex md:items-center px-5 mb-4 flex-col md:flex-row'>
                    <h4 className='text-2xl mr-4'>Events</h4>
                    <div className='inline-flex gap-4 md:ml-auto print:hidden flex-col md:flex-row mt-2 md:mt-0'>
                        <TabsList>
                            <TabsTrigger value='list'>List</TabsTrigger>
                            <TabsTrigger value='preview'>Preview</TabsTrigger>
                        </TabsList>
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
                                    <DialogTitle>Create User</DialogTitle>
                                    <DialogDescription>
                                        Fill in the form to add a new event.
                                    </DialogDescription>
                                </DialogHeader>

                                <EventForm
                                    onSubmit={handleCreate}
                                    onCancel={() => setCreateOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <TabsContent value='list'>
                    <DataTable
                        ref={dataTableRef}
                        columns={columns}
                        data={events ?? []}
                        search={search}
                    />
                </TabsContent>
                <TabsContent value='preview'>
                    <ScrollArea className='flex-1 overflow-x-auto max-h-[calc(100vh-320px)] md:max-h-[calc(100vh-175px)]'>
                        <ScrollBar orientation='vertical' />
                        <EventPanel data={events ?? []} />
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}
