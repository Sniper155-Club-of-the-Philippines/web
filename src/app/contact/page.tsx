import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Container from '@/components/root/Container';
import Header from '@/components/root/Header';

interface Props {
	title?: string;
	description?: string;
	phone?: string;
	email?: string;
	web: { label: string; url: string };
}

const props: Props = { title: 'Contact Us', description: 'We are available for questions, feedback, or collaboration opportunities. Let us know how we can help!', phone: '09393847512', email: 'contactus@sniper155clubofthephilippines.com', web: { label: 'sniper155clubofthephilippines.com', url: 'https://sniper155clubofthephilippines.com' } };

export default function Contact() {
	return (
		<>
			<Header />
			<Container>
				<section className='py-32'>
					<div className='container'>
						<div className='mx-auto flex max-w-7xl flex-col justify-between gap-10 lg:flex-row lg:gap-20'>
							<div className='mx-auto flex max-w-md flex-col justify-between gap-10'>
								<div className='text-center lg:text-left'>
									<h1 className='mb-2 text-5xl font-semibold lg:mb-1 lg:text-6xl'>{props.title}</h1>
									<p className='text-muted-foreground'>{props.description}</p>
								</div>
								<div className='mx-auto w-fit lg:mx-0'>
									<h3 className='mb-6 text-center text-2xl font-semibold lg:text-left'>Contact Details</h3>
									<ul className='ml-4 list-disc'>
										<li>
											<span className='font-bold'>Phone: </span>
											{props.phone}
										</li>
										<li>
											<span className='font-bold'>Email: </span>
											<a href={`mailto:${props.email}`} className='underline'>
												{props.email}
											</a>
										</li>
										<li>
											<span className='font-bold'>Web: </span>
											<a href={props.web.url} target='_blank' className='underline'>
												{props.web.label}
											</a>
										</li>
									</ul>
								</div>
							</div>
							<div className='mx-auto flex max-w-3xl flex-col gap-6 rounded-lg border p-10'>
								<div className='flex gap-4'>
									<div className='flex flex-col w-full gap-1.5'>
										<Label htmlFor='firstname'>First Name</Label>
										<Input type='text' id='firstname' placeholder='First Name' />
									</div>
									<div className='flex flex-col w-full gap-1.5'>
										<Label htmlFor='lastname'>Last Name</Label>
										<Input type='text' id='lastname' placeholder='Last Name' />
									</div>
								</div>
								<div className='flex flex-col w-full gap-1.5'>
									<Label htmlFor='email'>Email</Label>
									<Input type='email' id='email' placeholder='Email' />
								</div>
								<div className='flex flex-col w-full gap-1.5'>
									<Label htmlFor='subject'>Subject</Label>
									<Input type='text' id='subject' placeholder='Subject' />
								</div>
								<div className='flex flex-col w-full gap-1.5'>
									<Label htmlFor='message'>Message</Label>
									<Textarea placeholder='Type your message here.' id='message' />
								</div>
								<Button className='w-full'>Send Message</Button>
							</div>
						</div>
					</div>
				</section>
			</Container>
		</>
	);
}
