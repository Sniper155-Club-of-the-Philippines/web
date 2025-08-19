import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Container from '@/components/root/Container';
import Header from '@/components/root/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import cover from '@/assets/cover.jpg';
import Link from 'next/link';

interface Props {
	badge?: string;
	heading: string;
	description: string;
	buttons?: {
		primary?: {
			text: string;
			url: string;
		};
		secondary?: {
			text: string;
			url: string;
		};
	};
}

export default function Home({
	badge = '✨ YClub',
	heading = 'Sniper155 Club of the Philippines',
	description = 'Ride with passion. Where Sniper155 enthusiasts unite to share their love for the ride, the community, and the journey ahead.',
	buttons = {
		primary: {
			text: 'Explore',
			url: '/gallery',
		},
	},
}: Props) {
	return (
		<>
			<Header />
			<Container>
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
								<h1 className='my-6 text-pretty text-4xl font-bold lg:text-6xl'>{heading}</h1>
								<p className='text-muted-foreground mb-8 max-w-xl lg:text-xl'>{description}</p>
								<div className='flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start'>
									{buttons.primary && (
										<Button asChild variant='default' className='w-full sm:w-auto'>
											<Link href={buttons.primary.url}>{buttons.primary.text}</Link>
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
		</>
	);
}

