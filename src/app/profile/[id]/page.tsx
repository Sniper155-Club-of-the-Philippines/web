import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import national from '@/assets/national.png';
import news from '@/assets/news-update.png';
import imprint from '@/assets/imprint.png';
import yamaha from '@/assets/yamaha.png';
import yclub from '@/assets/yclub.png';
import Image from 'next/image';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import InfoRow from '@/components/profile/InfoRow';
import { SOCIAL_LINKS } from '@/constants';
import { Button } from '@/components/ui/button';
import { profile } from '@/api';
import axios from 'axios';
import { cn } from '@/lib/utils';

export default async function Profile({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const http = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        withCredentials: true,
    });
    const { id } = await params;
    const data = await profile.show(http, id);
    const background = 'bg-[linear-gradient(135deg,#0d0d0d,#1a1f3a,#0a2a4f)]';
    const { user } = data;
    const avatar = user?.photo_url;
    const name = `${user?.first_name} ${user?.last_name}`;

    return (
        <div
            className={`dark w-full p-0 m-0 text-white flex items-center justify-center ${background}`}
        >
            <Card
                className={`h-full w-[95%] max-w-[1000px] relative rounded-2xl py-0 shadow-2xl ${background} drop-shadow-2xl`}
            >
                <CardHeader className='relative h-64 md:h-[300px] border-b-3 border-accent-foreground'>
                    <Image
                        src={national.src}
                        alt='National Logo'
                        fill
                        className='object-cover bg-no-repeat bg-center'
                    />
                    {avatar && (
                        <Avatar className='size-[200px] -bottom-[100px] md:size-[350px] md:-bottom-[175px] left-1/2 -translate-x-1/2 absolute border-4 border-accent-foreground'>
                            <AvatarImage src={avatar} alt='Profile' />
                        </Avatar>
                    )}
                </CardHeader>
                <CardContent>
                    <div
                        className={cn(
                            'flex flex-col items-center w-full md:px-5 pb-5',
                            avatar ? 'pt-[100px] md:pt-[175px]' : ''
                        )}
                    >
                        <h1 className='scroll-m-20 text-center text-3xl md:text-4xl font-extrabold tracking-tight text-balance'>
                            {name}
                        </h1>
                        <h3 className='scroll-m-20 text-xl md:text-2xl font-semibold tracking-tight mt-2'>
                            {user?.designation}
                        </h3>
                        <div className='flex flex-col md:flex-row gap-[30px] w-full mt-6'>
                            <div className='w-full md:w-3/12 relative flex items-center justify-center h-60 md:h-auto'>
                                {user?.chapter?.photo_url && (
                                    <Image
                                        src={user?.chapter?.photo_url}
                                        alt={user?.chapter?.name}
                                        fill
                                        className='object-contain bg-no-repeat bg-center h-full w-full'
                                    />
                                )}
                            </div>
                            <div className='w-full md:w-9/12 flex flex-col items-center justify-center'>
                                <div className='w-full p-8 rounded-2xl bg-accent gap-4 flex flex-col'>
                                    {user?.chapter && (
                                        <InfoRow
                                            label='Chapter'
                                            value={user.chapter.name}
                                        />
                                    )}
                                    {user && (
                                        <InfoRow
                                            label='Email'
                                            value={user.email}
                                            href={`mailto:${user.email}`}
                                        />
                                    )}
                                    {user?.phone && (
                                        <InfoRow
                                            label='Contact'
                                            value={user.phone}
                                            href={`tel:${user.phone}`}
                                        />
                                    )}
                                    {user?.address && (
                                        <InfoRow
                                            label='Address'
                                            value={user.address}
                                        />
                                    )}
                                    <InfoRow
                                        label='Website'
                                        value='https://sniper155clubofthephilippines.com'
                                        href='https://sniper155clubofthephilippines.com'
                                        useNext
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 justify-center py-8 md:px-5 gap-10 w-full'>
                            <div className='text-center'>
                                <h4 className='text-2xl'>
                                    Click the links to visit
                                </h4>
                                <div className='flex flex-col gap-2 mt-2'>
                                    {SOCIAL_LINKS.map((social, index) => (
                                        <Button
                                            key={index}
                                            asChild
                                            variant='outline'
                                        >
                                            <a
                                                href={social.href}
                                                aria-label={social.label}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                            >
                                                {social.label}
                                                {social.icon}
                                            </a>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className='text-center'>
                                <h4 className='text-2xl'>
                                    Announcements and Updates
                                </h4>
                                <div className='flex flex-col gap-2 mt-2 relative aspect-video'>
                                    <Image
                                        src={news.src}
                                        fill
                                        className='object-cover rounded-xl hover:scale-105 transition-[0.3s] hover:cursor-pointer'
                                        alt='News and Updates'
                                    />
                                </div>
                            </div>
                            <div className='text-center'>
                                <h4 className='text-2xl'>Powered by:</h4>
                                <div className='grid grid-cols-3 gap-2 h-20'>
                                    <div className='relative'>
                                        <Image
                                            src={imprint.src}
                                            alt='Imprint Customs'
                                            fill
                                            className='object-contain'
                                        />
                                    </div>
                                    <div className='relative'>
                                        <Image
                                            src={yamaha.src}
                                            alt='Yamaha'
                                            fill
                                            className='object-contain'
                                        />
                                    </div>
                                    <div className='relative'>
                                        <Image
                                            src={yclub.src}
                                            alt='YClub'
                                            fill
                                            className='object-contain'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className='bg-slate-900 py-4 rounded-b-2xl shadow-lg'>
                    <div className='text-center w-full text-sm'>
                        Copyright © 2025 Sniper 155 Club of the Philippines Inc.
                        All Rights Reserved.
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
