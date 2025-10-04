'use client';

import { form } from '@/api';
import { loadingAtom } from '@/atoms/misc';
import FormForm, {
    type FormSubmitPayload,
} from '@/components/base/forms/FormForm';
import { useHttp } from '@/hooks/http';
import { useFormQuery } from '@/hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function EditForm() {
    const [, setLoading] = useAtom(loadingAtom);
    const http = useHttp();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { data } = useFormQuery(params.id);
    const queryClient = useQueryClient();

    const onSubmit = async (payload: FormSubmitPayload) => {
        if (!data) {
            return;
        }

        setLoading(true);
        try {
            await form.update(http, {
                id: data.id,
                title: payload.title,
                description: payload.description,
                active: true,
                fields: payload.fields.map((field, index) => ({
                    label: field.label,
                    type: field.type,
                    required: true,
                    order: index,
                    options: field.options?.map((option, optionIndex) => ({
                        label: option.label,
                        value: option.value,
                        order: optionIndex,
                    })),
                })),
            });

            toast.success('Form created successfully.', { closeButton: true });
            router.back();
        } catch (error) {
            console.error(error);
            toast.error('Unable to create form.', {
                closeButton: true,
            });
        } finally {
            setLoading(false);
            queryClient.invalidateQueries({
                queryKey: ['forms', data.id],
            });
        }
    };

    if (!data) {
        return null;
    }

    return (
        <div className='overflow-auto'>
            <FormForm
                onSubmit={onSubmit}
                initialTitle={data.title}
                initialDescription={data.description}
                initialFields={data.fields}
            />
        </div>
    );
}
