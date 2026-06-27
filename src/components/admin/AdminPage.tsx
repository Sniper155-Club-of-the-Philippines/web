import type { ReactNode } from 'react';

export function AdminPage({
    title,
    description,
    action,
    children,
}: {
    title: string;
    description: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <main className='mx-auto flex w-full max-w-7xl flex-col gap-6 pb-10'>
            <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold tracking-tight'>
                        {title}
                    </h1>
                    <p className='mt-1 max-w-2xl text-sm text-muted-foreground'>
                        {description}
                    </p>
                </div>
                {action}
            </header>
            {children}
        </main>
    );
}

export function TableLoading({ columns }: { columns: number }) {
    return (
        <tr>
            <td
                className='h-24 text-center text-sm text-muted-foreground'
                colSpan={columns}
            >
                Loading…
            </td>
        </tr>
    );
}

export function TableEmpty({
    columns,
    message,
}: {
    columns: number;
    message: string;
}) {
    return (
        <tr>
            <td
                className='h-24 text-center text-sm text-muted-foreground'
                colSpan={columns}
            >
                {message}
            </td>
        </tr>
    );
}
