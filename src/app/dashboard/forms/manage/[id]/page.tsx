'use client';

import FormForm from '@/components/base/forms/FormForm';
import { Button } from '@/components/ui/button';
import { useFormQuery } from '@/hooks/queries';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditForm() {
    const params = useParams<{ id: string }>();
    const { data } = useFormQuery(params.id);

    if (!data) {
        return null;
    }

    return (
        <div className='overflow-auto'>
            <div className='mb-2 flex justify-end max-w-2xl mx-auto gap-2'>
                <Button asChild>
                    <Link href={`/dashboard/forms/manage/${data.id}/edit`}>
                        Edit
                    </Link>
                </Button>
                <Button asChild>
                    <Link href='/dashboard/forms/manage'>Go Back</Link>
                </Button>
            </div>
            <FormForm
                readonly
                initialTitle={data.title}
                initialDescription={data.description}
                initialFields={data.fields}
            />
        </div>
    );
}
