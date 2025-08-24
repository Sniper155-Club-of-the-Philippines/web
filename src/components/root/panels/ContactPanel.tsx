'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CONTACT_PANEL } from '@/constants';
import { useEffect, useState } from 'react';

type Props = {
    title?: string;
    description?: string;
    phone?: string;
    email?: string;
    web?: { label: string; url: string };
    readonly?: boolean;
};

export default function ContactPanel({
    title = CONTACT_PANEL.title,
    description = CONTACT_PANEL.description,
    phone = CONTACT_PANEL.phone,
    email = CONTACT_PANEL.email,
    readonly = false,
}: Props) {
    const [url, setUrl] = useState<URL | null>(null);

    useEffect(() => {
        setUrl(new URL(window.location.origin));
    }, []);

    return (
        <section className='py-32'>
            <div className='container'>
                <div className='mx-auto flex max-w-7xl flex-col justify-between gap-10 lg:flex-row lg:gap-20'>
                    <div className='mx-auto flex max-w-md flex-col justify-between gap-10'>
                        <div className='text-center lg:text-left'>
                            <h1 className='mb-2 text-5xl font-semibold lg:mb-1 lg:text-6xl'>
                                {title}
                            </h1>
                            <p className='text-muted-foreground whitespace-pre-wrap break-all'>
                                {description}
                            </p>
                        </div>
                        <div className='mx-auto w-fit lg:mx-0'>
                            <h3 className='mb-6 text-center text-2xl font-semibold lg:text-left'>
                                Contact Details
                            </h3>
                            <ul className='ml-4 list-disc'>
                                <li>
                                    <span className='font-bold'>Phone: </span>
                                    <a
                                        href={`tel:${phone}`}
                                        onClick={(e) => {
                                            if (readonly) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }
                                        }}
                                        className='hover:underline'
                                    >
                                        {phone}
                                    </a>
                                </li>
                                <li>
                                    <span className='font-bold'>Email: </span>
                                    <a
                                        href={`mailto:${email}`}
                                        onClick={(e) => {
                                            if (readonly) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }
                                        }}
                                        className='hover:underline'
                                    >
                                        {email}
                                    </a>
                                </li>
                                <li>
                                    <span className='font-bold'>Web: </span>
                                    <a
                                        href={url?.origin}
                                        onClick={(e) => {
                                            if (readonly) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }
                                        }}
                                        target='_blank'
                                        className='hover:underline'
                                    >
                                        {url?.host}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                        className='mx-auto flex max-w-3xl flex-col gap-6 rounded-lg border p-10'
                    >
                        <div className='flex gap-4'>
                            <div className='flex flex-col w-full gap-1.5'>
                                <Label htmlFor='firstname'>First Name</Label>
                                <Input
                                    type='text'
                                    id='firstname'
                                    placeholder='First Name'
                                />
                            </div>
                            <div className='flex flex-col w-full gap-1.5'>
                                <Label htmlFor='lastname'>Last Name</Label>
                                <Input
                                    type='text'
                                    id='lastname'
                                    placeholder='Last Name'
                                />
                            </div>
                        </div>
                        <div className='flex flex-col w-full gap-1.5'>
                            <Label htmlFor='email'>Email</Label>
                            <Input
                                type='email'
                                id='email'
                                placeholder='Email'
                            />
                        </div>
                        <div className='flex flex-col w-full gap-1.5'>
                            <Label htmlFor='subject'>Subject</Label>
                            <Input
                                type='text'
                                id='subject'
                                placeholder='Subject'
                            />
                        </div>
                        <div className='flex flex-col w-full gap-1.5'>
                            <Label htmlFor='message'>Message</Label>
                            <Textarea
                                placeholder='Type your message here.'
                                id='message'
                            />
                        </div>
                        <Button type='submit' className='w-full'>
                            Send Message
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    );
}
