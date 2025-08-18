import Image from 'next/image';
import national from '@/assets/national.png';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default function Header() {
	return (
		<div className='flex items-center h-14 px-8 bg-neutral-900 shadow'>
			<Image src={national} alt='National Logo' className='h-8 w-auto' />
			<span className='text-lg ml-2 text-rose-50 select-none'>S155CP</span>
			<div className='ml-auto mr-10 flex gap-6'>
				<Link href='/'>Home</Link>
				<Link href='/about'>About</Link>
				<Link href='/events'>Events</Link>
				<Link href='/gallery'>Gallery</Link>
				<Link href='/contact'>Contact</Link>
			</div>
			<Link href='/login'>
				<LogIn className='h-4' />
			</Link>
		</div>
	);
}
