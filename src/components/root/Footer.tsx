import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import Logo from '@/components/root/Logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
    logo?: {
        url: string;
        title: string;
    };
    sections?: Array<{
        title: string;
        links: Array<{ name: string; href: string }>;
    }>;
    description?: string;
    socialLinks?: Array<{
        icon: React.ReactElement;
        href: string;
        label: string;
    }>;
    copyright?: string;
    legalLinks?: Array<{
        name: string;
        href: string;
    }>;
}

const defaultSocialLinks = [
    {
        icon: <FontAwesomeIcon icon={faFacebook} className='size-5' />,
        href: 'https://www.facebook.com/profile.php?id=61569977818058',
        label: 'S155CP Official Page',
    },
    {
        icon: <FontAwesomeIcon icon={faFacebook} className='size-5' />,
        href: 'https://www.facebook.com/groups/824433192468479',
        label: 'S155CP Visitor Group',
    },
    {
        icon: <FontAwesomeIcon icon={faFacebook} className='size-5' />,
        href: 'https://www.facebook.com/groups/sniper155clubofthephilippinesofficial',
        label: 'S155CP Official Group',
    },
    {
        icon: <FontAwesomeIcon icon={faFacebook} className='size-5' />,
        href: 'https://forms.gle/x2oWv29Sb54RikV17',
        label: 'S155CP Invitation Form',
    },
];

const defaultLegalLinks = [
    { name: 'Terms and Conditions', href: '/terms-and-conditions' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
];

export default function Footer({
    logo = {
        url: 'https://www.sniper155clubofthephilippines.com',
        title: 'S155CP',
    },
    description = 'Where riders unite to share knowledge, experiences, and camaraderie.',
    socialLinks = defaultSocialLinks,
    copyright = '© 2025 S155CP Inc. All rights reserved.',
    legalLinks = defaultLegalLinks,
}: Props) {
    return (
        <section className='py-8 px-10 bg-neutral-100 dark:bg-neutral-900 print:hidden'>
            <div className='flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left'>
                <div className='flex w-full flex-col justify-between gap-6 lg:items-start'>
                    {/* Logo */}
                    <div className='flex items-center gap-2 lg:justify-start'>
                        <a
                            href={logo.url}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <Logo />
                        </a>
                        <h2 className='text-xl font-semibold'>{logo.title}</h2>
                    </div>
                    <p className='text-muted-foreground max-w-[70%] text-sm'>
                        {description}
                    </p>
                    <ul className='text-muted-foreground grid items-center gap-5 grid-col-1 md:grid-cols-2 lg:grid-cols-4'>
                        {socialLinks.map((social, idx) => (
                            <li
                                key={idx}
                                className='hover:text-primary font-medium'
                            >
                                <Button asChild variant='secondary'>
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
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className='text-muted-foreground mt-8 flex flex-col justify-between gap-4 border-t py-8 text-xs font-medium md:flex-row md:items-center md:text-left'>
                <p className='order-2 lg:order-1'>{copyright}</p>
                <ul className='order-1 flex flex-col gap-2 md:order-2 md:flex-row'>
                    {legalLinks.map((link, idx) => (
                        <li key={idx} className='hover:text-primary'>
                            <Link href={link.href}> {link.name}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
