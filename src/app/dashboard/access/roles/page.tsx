'use client';

import { permission, role, user } from '@/api';
import {
    AdminPage,
    TableEmpty,
    TableLoading,
} from '@/components/admin/AdminPage';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHttp } from '@/hooks/http';
import { apiError } from '@/lib/api-error';
import type { Permission, Role } from '@/types/models/role';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type RoleInputs = {
    name: string;
    permissions: string[];
};

export default function RolesPage() {
    const http = useHttp();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Role | null>(null);
    const { register, handleSubmit, reset, watch, setValue } =
        useForm<RoleInputs>({
            defaultValues: { name: '', permissions: [] },
        });
    const selectedPermissions = watch('permissions');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const rolesQuery = useQuery({
        queryKey: ['roles'],
        queryFn: () => role.all(http),
    });
    const permissionsQuery = useQuery({
        queryKey: ['permissions'],
        queryFn: () => permission.all(http),
    });
    const usersQuery = useQuery({
        queryKey: ['users'],
        queryFn: () => user.all(http),
    });
    const permissionGroups = (permissionsQuery.data ?? []).reduce<
        Record<string, Permission[]>
    >((groups, item) => {
        const group = item.name.split('.')[0];
        groups[group] = [...(groups[group] ?? []), item];
        return groups;
    }, {});
    const refreshRoles = () =>
        queryClient.invalidateQueries({ queryKey: ['roles'] });
    const save = useMutation({
        mutationFn: (values: RoleInputs) =>
            editing
                ? role.update(http, editing.id, values)
                : role.store(http, values),
        onSuccess: () => {
            toast.success(editing ? 'Role updated.' : 'Role created.');
            setOpen(false);
            void refreshRoles();
        },
        onError: (error) =>
            toast.error(apiError(error, 'Unable to save role.')),
    });
    const remove = useMutation({
        mutationFn: (id: string) => role.remove(http, id),
        onSuccess: () => {
            toast.success('Role deleted.');
            void refreshRoles();
        },
        onError: (error) =>
            toast.error(apiError(error, 'Unable to delete role.')),
    });
    const assign = useMutation({
        mutationFn: () => user.assignRoles(http, selectedUserId, selectedRoles),
        onSuccess: () => {
            toast.success('User roles updated.');
            void queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) =>
            toast.error(apiError(error, 'Unable to assign roles.')),
    });
    const startCreate = () => {
        setEditing(null);
        reset({ name: '', permissions: [] });
        setOpen(true);
    };
    const startEdit = (item: Role) => {
        setEditing(item);
        reset({
            name: item.name,
            permissions: item.permissions?.map((value) => value.name) ?? [],
        });
        setOpen(true);
    };
    const togglePermission = (value: string, checked: boolean) => {
        setValue(
            'permissions',
            checked
                ? [...selectedPermissions, value]
                : selectedPermissions.filter((item) => item !== value),
        );
    };
    const toggleRole = (value: string, checked: boolean) => {
        setSelectedRoles(
            checked
                ? [...selectedRoles, value]
                : selectedRoles.filter((item) => item !== value),
        );
    };
    const selectUser = (id: string) => {
        setSelectedUserId(id);
        setSelectedRoles(
            usersQuery.data?.find((item) => item.id === id)?.roles ?? [],
        );
    };
    const submit = handleSubmit((values) => {
        save.mutate(values);
    });

    return (
        <AdminPage
            title='Roles and access'
            description='Compose permission bundles and assign one or more roles to club members.'
            action={<Button onClick={startCreate}>New role</Button>}
        >
            <Tabs defaultValue='roles'>
                <TabsList>
                    <TabsTrigger value='roles'>Roles</TabsTrigger>
                    <TabsTrigger value='assignments'>
                        User assignments
                    </TabsTrigger>
                </TabsList>
                <TabsContent value='roles' className='mt-4'>
                    <ScrollArea className='rounded-lg border'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead>Users</TableHead>
                                    <TableHead className='text-right'>
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rolesQuery.isLoading && (
                                    <TableLoading columns={4} />
                                )}
                                {!rolesQuery.isLoading &&
                                    !rolesQuery.data?.length && (
                                        <TableEmpty
                                            columns={4}
                                            message='No roles configured.'
                                        />
                                    )}
                                {rolesQuery.data?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className='font-medium'>
                                            {item.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex max-w-xl flex-wrap gap-1'>
                                                {item.permissions?.length ? (
                                                    item.permissions.map(
                                                        (value) => (
                                                            <Badge
                                                                key={value.id}
                                                                variant='secondary'
                                                            >
                                                                {value.name}
                                                            </Badge>
                                                        ),
                                                    )
                                                ) : (
                                                    <span className='text-sm text-muted-foreground'>
                                                        {item.name === 'admin'
                                                            ? 'Full access bypass'
                                                            : 'No permissions'}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.users_count ?? 0}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex justify-end gap-2'>
                                                <Button
                                                    size='sm'
                                                    variant='outline'
                                                    onClick={() => {
                                                        startEdit(item);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <ConfirmDialog
                                                    title='Delete role?'
                                                    description='Users assigned only this role may lose access.'
                                                    disabled={[
                                                        'admin',
                                                        'member',
                                                    ].includes(item.name)}
                                                    onConfirm={() => {
                                                        remove.mutate(item.id);
                                                    }}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <ScrollBar orientation='horizontal' />
                    </ScrollArea>
                </TabsContent>
                <TabsContent value='assignments' className='mt-4'>
                    <section className='grid max-w-2xl gap-5 rounded-lg border p-5'>
                        <div>
                            <h2 className='font-medium'>Assign roles</h2>
                            <p className='text-sm text-muted-foreground'>
                                Selecting Save replaces the user’s complete role
                                set.
                            </p>
                        </div>
                        <label className='grid gap-2 text-sm font-medium'>
                            Member
                            <Select
                                value={selectedUserId}
                                onValueChange={selectUser}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Select a member' />
                                </SelectTrigger>
                                <SelectContent>
                                    {usersQuery.data?.map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.last_name}, {item.first_name}{' '}
                                            — {item.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </label>
                        <fieldset disabled={!selectedUserId}>
                            <legend className='mb-3 text-sm font-medium'>
                                Assigned roles
                            </legend>
                            <div className='grid gap-3 sm:grid-cols-2'>
                                {rolesQuery.data?.map((item) => (
                                    <label
                                        key={item.id}
                                        className='flex items-center gap-2 text-sm'
                                    >
                                        <Checkbox
                                            checked={selectedRoles.includes(
                                                item.name,
                                            )}
                                            onCheckedChange={(v) => {
                                                toggleRole(
                                                    item.name,
                                                    v === true,
                                                );
                                            }}
                                        />{' '}
                                        {item.name}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        <div>
                            <Button
                                disabled={!selectedUserId || assign.isPending}
                                onClick={() => {
                                    assign.mutate();
                                }}
                            >
                                {assign.isPending
                                    ? 'Saving…'
                                    : 'Save assignments'}
                            </Button>
                        </div>
                    </section>
                </TabsContent>
            </Tabs>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='sm:max-w-3xl'>
                    <ScrollArea
                        className='max-h-[calc(90vh-3rem)]'
                        viewportClassName='[&>div]:!block [&>div]:!min-w-0'
                    >
                        <form onSubmit={submit} className='grid gap-5 p-1 pr-4'>
                            <DialogHeader>
                                <DialogTitle>
                                    {editing ? 'Edit role' : 'New role'}
                                </DialogTitle>
                                <DialogDescription>
                                    Role names use lowercase letters, numbers,
                                    and hyphens.
                                </DialogDescription>
                            </DialogHeader>
                            <label className='grid gap-2 text-sm font-medium'>
                                Role name
                                <Input
                                    pattern='[a-z0-9]+(?:-[a-z0-9]+)*'
                                    disabled={
                                        editing
                                            ? ['admin', 'member'].includes(
                                                  editing.name,
                                              )
                                            : false
                                    }
                                    {...register('name', { required: true })}
                                />
                            </label>
                            <div className='grid gap-5 sm:grid-cols-2'>
                                {Object.entries(permissionGroups).map(
                                    ([group, values]) => (
                                        <fieldset
                                            key={group}
                                            className='rounded-md border p-4'
                                        >
                                            <legend className='px-1 text-sm font-medium capitalize'>
                                                {group.replace('-', ' ')}
                                            </legend>
                                            <div className='grid gap-3'>
                                                {values?.map((item) => (
                                                    <label
                                                        key={item.id}
                                                        className='flex items-start gap-2 text-sm'
                                                    >
                                                        <Checkbox
                                                            checked={selectedPermissions.includes(
                                                                item.name,
                                                            )}
                                                            onCheckedChange={(
                                                                v,
                                                            ) => {
                                                                togglePermission(
                                                                    item.name,
                                                                    v === true,
                                                                );
                                                            }}
                                                        />
                                                        <span>
                                                            {
                                                                item.name.split(
                                                                    '.',
                                                                )[1]
                                                            }
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </fieldset>
                                    ),
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => {
                                        setOpen(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button disabled={save.isPending}>
                                    {save.isPending ? 'Saving…' : 'Save role'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </AdminPage>
    );
}
