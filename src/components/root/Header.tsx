import Link from 'next/link';
import { LogIn } from 'lucide-react';
import Logo from '@/components/root/Logo';

export default function Header() {
	return (
		<div className='flex items-center h-14 px-8 bg-neutral-100 dark:bg-neutral-900 shadow print:hidden'>
			<Logo />
			<span className='text-lg ml-2 dark:text-rose-50 select-none hidden md:block'>S155CP</span>
			<div className='ml-auto mr-10 gap-6 hidden md:flex'>
				<Link href='/' className='dark:text-rose-50'>
					Home
				</Link>
				<Link href='/about' className='dark:text-rose-50'>
					About
				</Link>
				<Link href='/events' className='dark:text-rose-50'>
					Events
				</Link>
				<Link href='/gallery' className='dark:text-rose-50'>
					Gallery
				</Link>
				<Link href='/contact' className='dark:text-rose-50'>
					Contact
				</Link>
			</div>
			<Link href='/login' className='hidden md:block dark:text-rose-50'>
				<LogIn className='h-4' />
			</Link>
		</div>
	);
}
