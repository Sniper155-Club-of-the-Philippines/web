import { ArrowUpRight } from 'lucide-react';
import Container from '@/components/root/Container';
import Header from '@/components/root/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import cover from '@/assets/cover.jpg';
import Link from 'next/link';
import Footer from '@/components/root/Footer';

const props = {
	badge: '✨ YClub',
	heading: 'Sniper155 Club of the Philippines Inc.',
	description: 'Ride with passion. Where Sniper155 enthusiasts unite to share their love for the ride, the community, and the journey ahead.',
	buttons: {
		primary: {
			text: 'Explore',
			url: '/gallery',
		},
	},
};

export default function Home() {
	return (
		<>
			<Header />
			<Container>
				<section className='py-32'>
					<div className='container'>
						<div className='grid items-center gap-8 lg:grid-cols-2'>
							<div className='flex flex-col items-center text-center lg:items-start lg:text-left'>
								{props.badge && (
									<Badge variant='outline'>
										{props.badge}
										<ArrowUpRight className='ml-2 size-4' />
									</Badge>
								)}
								<h1 className='my-6 text-pretty text-4xl font-bold lg:text-6xl'>{props.heading}</h1>
								<p className='text-muted-foreground mb-8 max-w-xl lg:text-xl'>{props.description}</p>
								<div className='flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start'>
									{props.buttons.primary && (
										<Button asChild variant='default' className='w-full sm:w-auto'>
											<Link href={props.buttons.primary.url}>{props.buttons.primary.text}</Link>
										</Button>
									)}
								</div>
							</div>
							<div className='max-h-96 relative w-full h-full'>
								<Image src={cover.src} fill alt='S155CP Cover' className='rounded-md object-cover' />
							</div>
						</div>
					</div>
				</section>
			</Container>
			<Footer />
		</>
	);
}

