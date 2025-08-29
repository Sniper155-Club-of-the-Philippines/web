import Link from 'next/link';

type InfoRowProps = {
    label: string;
    value: string | React.ReactNode;
    href?: string;
    useNext?: boolean;
};

export default function InfoRow({
    label,
    value,
    href,
    useNext = false,
}: InfoRowProps) {
    const content = href ? (
        useNext ? (
            <Link
                href={href}
                className='text-[10px] md:text-lg hover:underline text-sky-400 break-all md:break-normal text-center md:text-left'
            >
                {value}
            </Link>
        ) : (
            <a
                href={href}
                className='text-[10px] md:text-lg hover:underline text-sky-400 break-all md:break-normal text-center md:text-left'
            >
                {value}
            </a>
        )
    ) : (
        <span className='text-[10px] md:text-lg break-all md:break-normal text-center md:text-left'>
            {value}
        </span>
    );

    return (
        <div className='flex flex-col md:flex-row items-center justify-center'>
            <span className='text-[10px] md:text-lg font-semibold mr-1'>
                {label}
                <span className='hidden md:inline'>:</span>
            </span>
            {content}
        </div>
    );
}
