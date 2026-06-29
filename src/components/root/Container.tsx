import { cn } from '@/lib/utils';

type Props = {
    children: React.ReactNode;
    fluid?: boolean;
    className?: string;
};

export default function Container({
    children,
    fluid = false,
    className,
}: Props) {
    return (
        <div
            className={cn(
                'flex items-center justify-center px-10 md:px-0',
                !fluid ? 'h-[calc(100vh-3.5rem)]' : '',
                className,
            )}
        >
            {children}
        </div>
    );
}
