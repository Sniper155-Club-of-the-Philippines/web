/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
'use client';

import FormForm from '@/components/base/forms/FormForm';
import { Button } from '@/components/ui/button';
import { useFormResponseQuery } from '@/hooks/queries';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ViewFormResponse() {
    const params = useParams<{ id: string }>();
    const { data } = useFormResponseQuery(params.id);

    if (!data?.form) {
        return null;
    }

    const { form, answers, user } = data;

    return (
        <div className='overflow-auto'>
            <div className='mb-2 flex max-w-2xl mx-auto gap-2 items-center'>
                <span className='text-lg'>
                    {user?.last_name}, {user?.first_name}
                </span>
                <Button asChild className='ml-auto'>
                    <Link href='/dashboard/forms/responses'>Go Back</Link>
                </Button>
            </div>
            <FormForm
                readonly
                answer
                initialTitle={form.title}
                initialDescription={form.description}
                initialFields={form.fields}
                initialData={answers?.map((answer) => ({
                    id: answer.field?.id!,
                    value: answer.answer,
                    type: answer.field?.type ?? 'text',
                }))}
            />
        </div>
    );
}
