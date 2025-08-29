'use client';

import { user as api } from '@/api';
import { userAtom } from '@/atoms/auth';
import { loadingAtom } from '@/atoms/misc';
import UserForm from '@/components/base/forms/UserForm';
import { useHttp } from '@/hooks/http';
import { UserFormInputs } from '@/types/form';
import { useAtom } from 'jotai';
import { toast } from 'sonner';

export default function Settings() {
    const [user] = useAtom(userAtom);
    const [, setLoading] = useAtom(loadingAtom);
    const http = useHttp();

    const onSubmit = async (data: UserFormInputs) => {
        setLoading(true);
        try {
            await api.update(http, data);
            toast('Settings saved successfully.', {
                closeButton: true,
            });
        } catch (error) {
            console.error(error);
            toast('Unable to save settings.', {
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserForm
            onSubmit={onSubmit}
            defaultValues={user ?? {}}
            className='max-h-[80vh]'
        />
    );
}
