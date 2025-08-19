import Link from 'next/link';
import { LogIn } from 'lucide-react';
import Logo from '@/components/root/Logo';

export default function Header() {
	return (
		<div className='flex items-center h-14 px-8 bg-neutral-900 shadow'>
			<Logo />
			<span className='text-lg ml-2 text-rose-50 select-none hidden md:block'>S155CP</span>
			<div className='ml-auto mr-10 gap-6 hidden md:flex'>
				<Link href='/'>Home</Link>
				<Link href='/about'>About</Link>
				<Link href='/events'>Events</Link>
				<Link href='/gallery'>Gallery</Link>
				<Link href='/contact'>Contact</Link>
			</div>
			<Link href='/login' className='hidden md:block'>
				<LogIn className='h-4' />
			</Link>
		</div>
	);
}
