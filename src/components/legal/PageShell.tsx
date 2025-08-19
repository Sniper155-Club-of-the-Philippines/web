'use client';

import { Button } from '@/components/ui/button';

export default function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className='min-h-screen dark:text-white'>
			<div className='mx-auto max-w-3xl px-4 pb-24 pt-10 md:pt-16'>
				<div className='mb-6'>
					<h1 className='text-1xl md:text-3xl font-bold tracking-tight'>{title}</h1>
					<p className='mt-1 text-sm text-neutral-600 dark:text-neutral-100'>
						Effective Date: <span className='font-medium'>August 20, 2025</span>
					</p>
				</div>
				<div className='rounded-2xl dark:text-white shadow-sm ring-1 ring-black/5 p-5 md:p-8'>{children}</div>
				<div className='mt-6 flex flex-wrap items-center gap-3 print:hidden'>
					<Button onClick={() => window.print()}>Print</Button>
					<Button asChild>
						<a href='mailto:contactus@sniper155clubofthephilippines.com'>Contact Us</a>
					</Button>
				</div>
			</div>
		</div>
	);
}
