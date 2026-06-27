'use client';

import { store } from '@/api';
import { AdminPage } from '@/components/admin/AdminPage';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useHttp } from '@/hooks/http';
import { apiError } from '@/lib/api-error';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function StoreSettingsPage() {
    const http = useHttp();
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ['store-settings'],
        queryFn: () => store.settings(http),
    });
    const mutation = useMutation({
        mutationFn: (enabled: boolean) => store.updateSettings(http, enabled),
        onSuccess: (data) => {
            queryClient.setQueryData(['store-settings'], data);
            toast.success(
                data.store_enabled ? 'Store opened.' : 'Store closed.',
            );
        },
        onError: (error) =>
            toast.error(apiError(error, 'Unable to update store settings.')),
    });

    const enabled = query.data?.store_enabled ?? false;

    return (
        <AdminPage
            title='Store settings'
            description='Control whether members can place orders in the active batch.'
        >
            <Card className='max-w-2xl'>
                <CardHeader>
                    <CardTitle>Ordering availability</CardTitle>
                    <CardDescription>
                        An active batch and its date window still apply when
                        this switch is on.
                    </CardDescription>
                </CardHeader>
                <CardContent className='flex items-center justify-between gap-6'>
                    <label
                        className='flex items-center gap-3 text-sm font-medium'
                        htmlFor='store-enabled'
                    >
                        <Checkbox
                            id='store-enabled'
                            checked={enabled}
                            onCheckedChange={(checked) =>
                                mutation.mutate(checked === true)
                            }
                            disabled={query.isLoading || mutation.isPending}
                        />
                        Store enabled
                    </label>
                    <Button
                        variant='outline'
                        onClick={() => mutation.mutate(!enabled)}
                        disabled={query.isLoading || mutation.isPending}
                    >
                        {enabled ? 'Close store' : 'Open store'}
                    </Button>
                </CardContent>
            </Card>
        </AdminPage>
    );
}
