import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { HOME_PANEL } from '@/constants';

type Props = {
    badge?: string;
    heading?: string;
    description?: string;
    buttons?: {
        primary: {
            text: string;
            url: string;
        };
    };
    cover?: {
        src: string;
        alt?: string;
    };
    readonly?: boolean;
};

export default function HomePanel({
    badge = HOME_PANEL.badge,
    heading = HOME_PANEL.heading,
    description = HOME_PANEL.description,
    buttons = HOME_PANEL.buttons,
    cover = HOME_PANEL.cover,
    readonly = false,
}: Props) {
    return (
        <section className='py-32'>
            <div className='container'>
                <div className='grid items-center gap-8 lg:grid-cols-2'>
                    <div className='flex flex-col items-center text-center lg:items-start lg:text-left'>
                        {badge && (
                            <Badge variant='outline'>
                                {badge}
                                <ArrowUpRight className='ml-2 size-4' />
                            </Badge>
                        )}
                        <h1 className='my-6 text-pretty text-4xl font-bold lg:text-6xl'>
                            {heading}
                        </h1>
                        <p className='text-muted-foreground mb-8 max-w-xl lg:text-xl whitespace-pre-wrap break-all'>
                            {description}
                        </p>
                        <div className='flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start'>
                            {buttons?.primary && (
                                <Button
                                    asChild
                                    variant='default'
                                    className='w-full sm:w-auto'
                                    disabled={readonly}
                                >
                                    <Link
                                        href={buttons.primary.url}
                                        aria-disabled={
                                            readonly ? 'true' : 'false'
                                        }
                                        onClick={(e) => {
                                            if (readonly) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }
                                        }}
                                    >
                                        {buttons.primary.text}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                    {cover && (
                        <div className='max-h-96 relative w-full h-full'>
                            <Image
                                src={cover.src}
                                fill
                                alt={cover.alt ?? ''}
                                className='rounded-md object-cover'
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
