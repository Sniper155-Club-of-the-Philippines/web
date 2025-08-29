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
import type { Metadata } from 'next';
import type { Profile } from '@/types/models/profile';
import { notFound } from 'next/navigation';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const http = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        withCredentials: true,
    });
    const data = await profile.show(http, id);
    const { user } = data;
    const name = `${user?.first_name} ${user?.last_name}`;
    const description = `${name} – ${
        user?.designation || 'Member'
    } of Sniper 155 Club of the Philippines`;

    return {
        title: `${name} | Sniper 155 Club of the Philippines`,
        description,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/profiles/${id}`,
        },
        openGraph: {
            title: name,
            description,
            type: 'profile',
            images: [
                {
                    url: user?.photo_url || national.src,
                    width: 600,
                    height: 600,
                    alt: `${name} profile picture`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: name,
            description,
            images: [user?.photo_url || national.src],
        },
    };
}

export default async function Profile({ params }: Props) {
    const http = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        withCredentials: true,
    });
    const { id } = await params;

    let data: Profile;

    try {
        data = await profile.show(http, id);
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return notFound();
        }

        return (
            <main className='flex h-screen items-center justify-center'>
                <p className='text-red-500 text-xl'>
                    Failed to load profile. Please try again later.
                </p>
            </main>
        );
    }

    const background = 'bg-[linear-gradient(135deg,#0d0d0d,#1a1f3a,#0a2a4f)]';
    const { user } = data;
    const avatar = user?.photo_url;
    const name = `${user?.first_name} ${user?.last_name}`;

    // ✅ Structured Data (JSON-LD)
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        jobTitle: user?.designation,
        email: user?.email,
        telephone: user?.phone,
        address: user?.address,
        image: avatar,
        memberOf: {
            '@type': 'Organization',
            name: 'Sniper 155 Club of the Philippines',
            url: process.env.NEXT_PUBLIC_SITE_URL,
        },
    };

    return (
        <main
            className={`dark w-full p-0 m-0 text-white flex items-center justify-center ${background}`}
        >
            {/* Inject structured data */}
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <Card
                className={`w-[1000px] relative rounded-2xl py-0 shadow-2xl ${background} drop-shadow-2xl`}
            >
                <CardHeader className='relative h-64 md:h-[500px] border-b-3 border-accent-foreground'>
                    <Image
                        src={national.src}
                        alt='Sniper 155 Club of the Philippines - National Banner'
                        fill
                        className='object-cover bg-no-repeat bg-center'
                        priority
                    />
                    {avatar && (
                        <Avatar className='size-[200px] -bottom-[100px] md:size-[350px] md:-bottom-[175px] left-1/2 -translate-x-1/2 absolute border-4 border-accent-foreground'>
                            <AvatarImage
                                src={avatar}
                                alt={`${name} profile picture`}
                            />
                        </Avatar>
                    )}
                </CardHeader>
                <CardContent className='px-0 md:px-6'>
                    <article
                        className={cn(
                            'flex flex-col items-center w-full md:px-5 pb-5',
                            avatar ? 'pt-[100px] md:pt-[175px]' : ''
                        )}
                    >
                        <h1 className='text-center text-xl md:text-4xl font-extrabold tracking-tight'>
                            {name}
                        </h1>
                        {user?.designation && (
                            <h2 className='text md:text-2xl font-semibold tracking-tight mt-2 mb-3 md:mb-0'>
                                {user.designation}
                            </h2>
                        )}

                        <div className='scale-wrapper h-[650px] md:h-[820px] overflow-hidden'>
                            <div className='scale-container'>
                                <section
                                    aria-labelledby='profile-info'
                                    className='flex flex-row gap-1 md:gap-[30px] items-center w-full md:mt-6 px-0 md:px-10'
                                >
                                    {user?.chapter?.photo_url && (
                                        <div className='w-4/12 relative flex items-center justify-center h-60'>
                                            <Image
                                                src={user.chapter.photo_url}
                                                alt={`${user.chapter.name} Chapter Logo`}
                                                fill
                                                className='object-contain bg-no-repeat bg-center h-full w-full'
                                            />
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            'flex flex-col items-center justify-center',
                                            user?.chapter?.photo_url
                                                ? 'w-8/12'
                                                : 'w-full'
                                        )}
                                    >
                                        <div className='w-full p-4 md:p-8 rounded-2xl bg-accent gap-4 flex flex-col'>
                                            {user?.chapter && (
                                                <InfoRow
                                                    label='Chapter'
                                                    value={user.chapter.name}
                                                />
                                            )}
                                            {user?.email && (
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
                                </section>

                                <section
                                    aria-labelledby='social-and-news'
                                    className='grid grid-cols-2 justify-center py-8 md:px-5 gap-10 w-full'
                                >
                                    <div className='text-center'>
                                        <h3
                                            id='social-and-news'
                                            className='text-base md:text-2xl'
                                        >
                                            Connect with us
                                        </h3>
                                        <div className='flex flex-col gap-2 mt-2'>
                                            {SOCIAL_LINKS.map(
                                                (social, index) => (
                                                    <Button
                                                        key={index}
                                                        asChild
                                                        variant='outline'
                                                    >
                                                        <a
                                                            href={social.href}
                                                            aria-label={
                                                                social.label
                                                            }
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='text-[10px] md:text-base'
                                                        >
                                                            {social.label}
                                                            {social.icon}
                                                        </a>
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div className='text-center'>
                                        <h3 className='text-base md:text-2xl'>
                                            Announcements & Updates
                                        </h3>
                                        <div className='flex flex-col gap-2 mt-2 relative aspect-video'>
                                            <a
                                                href='https://www.facebook.com/groups/sniper155clubofthephilippinesofficial'
                                                target='_blank'
                                                rel='noreferrer noopener'
                                            >
                                                <Image
                                                    src={news.src}
                                                    fill
                                                    className='object-cover rounded-xl hover:scale-105 transition-[0.3s] hover:cursor-pointer'
                                                    alt='Latest news and updates'
                                                />
                                            </a>
                                        </div>
                                    </div>
                                </section>

                                <div className='text-center scale-100 pt-4'>
                                    <h3 className='text-base md:text-2xl'>
                                        Powered by
                                    </h3>
                                    <div className='grid grid-cols-3 gap-2 h-28 mt-4 items-center'>
                                        {[imprint, yamaha, yclub].map(
                                            (img, i) => (
                                                <div
                                                    key={i}
                                                    className={`relative ${
                                                        img.src.includes(
                                                            'yamaha'
                                                        )
                                                            ? 'h-18'
                                                            : 'h-full'
                                                    }`}
                                                >
                                                    <Image
                                                        src={img.src}
                                                        alt={
                                                            img.src.includes(
                                                                'yamaha'
                                                            )
                                                                ? 'Yamaha'
                                                                : img.src.includes(
                                                                      'yclub'
                                                                  )
                                                                ? 'YClub'
                                                                : 'Imprint Customs'
                                                        }
                                                        fill
                                                        className='object-contain'
                                                    />
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                </CardContent>
                <CardFooter className='bg-slate-900 py-4 rounded-b-2xl shadow-lg'>
                    <div className='text-center w-full text-xs md:text-sm'>
                        © 2025 Sniper 155 Club of the Philippines Inc. All
                        Rights Reserved.
                    </div>
                </CardFooter>
            </Card>
        </main>
    );
}
