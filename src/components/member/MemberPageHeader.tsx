export default function MemberPageHeader({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <div className='flex flex-col gap-1'>
            <h1 className='text-2xl font-semibold tracking-tight text-balance'>
                {title}
            </h1>
            {description && (
                <p className='text-muted-foreground max-w-2xl text-sm text-pretty'>
                    {description}
                </p>
            )}
        </div>
    );
}
