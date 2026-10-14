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
import TemporaryPasswordDialog, {
    TemporaryPasswordCredentials,
} from '@/components/base/TemporaryPasswordDialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { hasPermission } from '@/lib/permissions';
import { credentialEmailsEta, membersWithoutAccount } from '@/lib/credentials';
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
    const [credentials, setCredentials] =
        useState<TemporaryPasswordCredentials | null>(null);
    const [search, setSearch] = useState('');
    const { data: users, refetch } = useUserQuery();
    const [me] = useAtom(userAtom);
    const [sendOpen, setSendOpen] = useState(false);
    const pendingCount = membersWithoutAccount(users ?? []).length;

    const handleCreate = async (data: UserFormInputs) => {
        setLoading(true);
        try {
            const result = await user.store(http, data);
            toast.success('Member created successfully.', {
                closeButton: true,
            });
            setCreateOpen(false);
            // The API emails the credentials; they are also shown here so the
            // admin can hand them over in person if the email did not go out.
            setCredentials({
                email: result.user.email,
                password: result.temp_password,
                emailSent: result.email_sent,
            });
            void refetch();
        } catch (error) {
            console.error(error);
            toast.error('Unable to create member.', {
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendCredentials = async () => {
        setLoading(true);
        try {
            const queued = await user.sendCredentials(http);
            setSendOpen(false);
            toast.success(
                `Sending credentials to ${queued} member${queued === 1 ? '' : 's'}.`,
                {
                    description: `All emails should be out in ${credentialEmailsEta(queued)}.`,
                    closeButton: true,
                },
            );
            void refetch();
        } catch (error) {
            console.error(error);
            toast.error('Unable to send credentials.', {
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
            minSize: 300,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            enableGlobalFilter: true,
            minSize: 300,
        },
        {
            id: 'account',
            header: 'Account',
            accessorFn: (row) => (row.has_password ? 'Active' : 'No account'),
            enableGlobalFilter: true,
            cell: ({ row }) =>
                row.original.has_password ? (
                    <Badge variant='secondary'>Active</Badge>
                ) : (
                    <Badge variant='outline'>No account</Badge>
                ),
        },
        {
            accessorKey: 'address',
            header: 'Address',
            enableGlobalFilter: true,
            minSize: 360,
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
            enableGlobalFilter: true,
        },
        {
            accessorKey: 'designation',
            accessorFn: (row) => (row.designation ? row.designation : 'N/A'),
            header: 'Designation',
            enableGlobalFilter: true,
            minSize: 250,
        },
        {
            accessorKey: 'club_number',
            accessorFn: (row) => (row.club_number ? row.club_number : 'N/A'),
            header: 'Club Number',
            enableGlobalFilter: true,
        },
        {
            accessorKey: 'yclub_number',
            accessorFn: (row) => (row.yclub_number ? row.yclub_number : 'N/A'),
            header: 'YClub Number',
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
            minSize: 200,
        },
        {
            accessorKey: 'updated_at',
            accessorFn: (row) =>
                dayjs(row.updated_at).format('MMM DD, YYYY hh:mm A'),
            header: 'Updated',
            minSize: 200,
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
        exportToExcel(columns, users ?? [], 'members.xlsx');
    };

    return (
        <div ref={printRef} className='flex flex-col'>
            <div className='flex md:items-center px-5 mb-4 flex-col md:flex-row'>
                <h4 className='text-2xl mr-4'>Members</h4>
                <div className='inline-flex gap-4 md:ml-auto print:hidden flex-col md:flex-row mt-2 md:mt-0'>
                    <Input
                        type='search'
                        placeholder='Search'
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        value={search}
                    />
                    {pendingCount > 0 && hasPermission(me, 'users.create') && (
                        <Button
                            variant='outline'
                            onClick={() => setSendOpen(true)}
                        >
                            Send credentials ({pendingCount})
                        </Button>
                    )}
                    <TableMenu
                        onRefresh={refetch}
                        onExport={exportData}
                        onPrint={handlePrint}
                        onCreate={() => {
                            setCreateOpen(true);
                        }}
                    />
                    {/* Create Dialog */}
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogContent className='max-h-[calc(100svh-2rem)] sm:max-w-[800px]'>
                            <DialogHeader>
                                <DialogTitle>Create User</DialogTitle>
                                <DialogDescription>
                                    Fill in the form to add a new member.
                                </DialogDescription>
                            </DialogHeader>

                            <UserForm
                                onSubmit={handleCreate}
                                onCancel={() => {
                                    setCreateOpen(false);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                    <TemporaryPasswordDialog
                        credentials={credentials}
                        title='Member created'
                        onClose={() => setCredentials(null)}
                    />
                    <Dialog open={sendOpen} onOpenChange={setSendOpen}>
                        <DialogContent className='sm:max-w-[480px]'>
                            <DialogHeader>
                                <DialogTitle>
                                    Send credentials to {pendingCount} member
                                    {pendingCount === 1 ? '' : 's'}?
                                </DialogTitle>
                                <DialogDescription>
                                    Each member without an account gets an email
                                    with their username (their email address)
                                    and a temporary password. Emails go out one
                                    every 30 seconds to stay within the mail
                                    limit, so all of them should be out in{' '}
                                    {credentialEmailsEta(pendingCount)}.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                    variant='outline'
                                    onClick={() => setSendOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => void handleSendCredentials()}
                                >
                                    Send credentials
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <DataTable columns={columns} data={users ?? []} search={search} />
        </div>
    );
}
