import Image from 'next/image';
import national from '@/assets/national.png';

export default function Logo() {
	return <Image src={national} alt='National Logo' className='h-8 w-auto' />;
}
