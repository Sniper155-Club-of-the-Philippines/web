import Link from 'next/link';

type InfoRowProps = {
    label: string;
    value: string | React.ReactNode;
    href?: string;
    useNext?: boolean;
    center?: boolean;
};

export default function InfoRow({
    label,
    value,
    href,
    useNext = false,
    center = false,
}: InfoRowProps) {
    const alignment = center ? 'md:text-center' : 'md:text-left';
    const contentClassName = `text-[9px] md:text-lg hover:underline text-sky-400 break-all md:break-normal text-center ${alignment}`;

    const content = href ? (
        useNext ? (
            <Link href={href} className={contentClassName}>
                {value}
            </Link>
        ) : (
            <a href={href} className={contentClassName}>
                {value}
            </a>
        )
    ) : (
        <span
            className={`text-[9px] md:text-lg break-all md:break-normal text-center ${alignment}`}
        >
            {value}
        </span>
    );

    return (
        <div className='flex flex-col md:flex-row items-center justify-center'>
            <span className='text-[9px] md:text-lg font-semibold mr-1'>
                {label}
                <span className='hidden md:inline'>:</span>
            </span>
            {content}
        </div>
    );
}
