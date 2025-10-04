'use client';

import { formIdAtom } from '@/atoms/form';
import SelectSearch from '@/components/base/inputs/SelectSearch';
import FormResponseActionCell from '@/components/base/table/cells/FormResponseActionCell';
import TableMenu from '@/components/base/table/TableMenu';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useFormResponsesQuery, useFormsQuery } from '@/hooks/queries';
import type { FormResponse } from '@/types/models/form-response';
import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useAtom } from 'jotai';
import { useState } from 'react';

export default function FormResponses() {
    const [search, setSearch] = useState('');
    const { data: forms } = useFormsQuery();
    const [formId, setFormId] = useAtom(formIdAtom);
    const { data: responses, refetch } = useFormResponsesQuery(formId);

    const columns: ColumnDef<FormResponse>[] = [
        {
            header: 'User',
            accessorFn: (row) =>
                `${row.user?.last_name}, ${row.user?.first_name}`,
        },
        {
            header: 'Submitted',
            accessorFn: (row) =>
                dayjs(row.updated_at).format('MM/DD/YYYY hh:mm A'),
        },
        {
            header: 'Actions',
            cell: ({ row }) => (
                <FormResponseActionCell response={row.original} />
            ),
        },
    ];

    return (
        <div className='flex flex-col'>
            <div className='flex md:items-center px-5 mb-4 flex-col md:flex-row'>
                <h4 className='text-2xl mr-4'>Form Responses</h4>
                <div className='inline-flex gap-4 md:ml-auto print:hidden flex-col md:flex-row mt-2 md:mt-0'>
                    <SelectSearch
                        options={forms?.map((form) => ({
                            label: form.title,
                            value: form.id,
                        }))}
                        onChange={(e) => {
                            setFormId(e.target.value);
                        }}
                        value={formId ?? undefined}
                        placeholder='Select Form'
                        triggerWidth='w-56'
                    />
                    <Input
                        type='search'
                        placeholder='Search'
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                    />
                    <TableMenu
                        onRefresh={refetch}
                        disable={['export', 'print', 'create']}
                    />
                </div>
            </div>
            {formId ? (
                <DataTable
                    columns={columns}
                    data={responses ?? []}
                    search={search}
                />
            ) : (
                <div className='flex items-center justify-center flex-1 py-10 text-gray-500'>
                    Select a form to view data
                </div>
            )}
        </div>
    );
}
