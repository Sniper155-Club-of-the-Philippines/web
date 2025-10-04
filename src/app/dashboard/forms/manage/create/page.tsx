'use client';

import { form } from '@/api';
import { loadingAtom } from '@/atoms/misc';
import FormForm, { FormSubmitPayload } from '@/components/base/forms/FormForm';
import { useHttp } from '@/hooks/http';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CreateForm() {
    const [, setLoading] = useAtom(loadingAtom);
    const http = useHttp();
    const router = useRouter();

    const onSubmit = async (data: FormSubmitPayload) => {
        setLoading(true);
        try {
            await form.store(http, {
                title: data.title,
                description: data.description,
                active: true,
                fields: data.fields.map((field, index) => ({
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
        }
    };

    return (
        <div className='overflow-auto'>
            <FormForm onSubmit={onSubmit} />
        </div>
    );
}
