import React from 'react';

import Container from '@/components/root/Container';
import Header from '@/components/root/Header';
import Footer from '@/components/root/Footer';
import PageShell from '@/components/legal/PageShell';
import SectionHeading from '@/components/legal/SectionHeading';
import Link from 'next/link';

export default function PrivacyPolicy() {
	return (
		<>
			<Header />
			<Container fluid className='px-4'>
				<section className='py-2'>
					<PageShell title='Sniper155 Club of the Philippines — Privacy Policy'>
						<p className='text-sm md:text-base leading-relaxed'>Sniper155 Club of the Philippines Inc. (“S155CP”, “we”, “our”, or “us”) values your privacy. This Privacy Policy explains how we collect, use, and protect the personal information of our members when they use our website, app, or participate in club activities.</p>

						<SectionHeading id='information'>1. Information We Collect</SectionHeading>
						<ul className='list-disc pl-6 space-y-2 text-sm md:text-base'>
							<li>Personal Information (optional): name, photo, address, contact number.</li>
							<li>Account Information: login details such as email/username and password.</li>
							<li>Technical Information: IP address, device type, and cookies (if applicable).</li>
							<li>Some information may be required to access specific services, while others are optional.</li>
						</ul>

						<SectionHeading id='usage'>2. How We Use Your Information</SectionHeading>
						<ul className='list-disc pl-6 space-y-2 text-sm md:text-base'>
							<li>Verify membership and maintain an accurate member database.</li>
							<li>Provide access to club services, features, and events.</li>
							<li>Offer optional benefits such as official S155CP ID cards.</li>
							<li>Communicate with members regarding announcements, activities, or updates.</li>
							<li>Improve and secure our website and membership system.</li>
						</ul>

						<SectionHeading id='sharing'>3. Sharing & Disclosure</SectionHeading>
						<ul className='list-disc pl-6 space-y-2 text-sm md:text-base'>
							<li>We do not sell or trade your personal information.</li>
							<li>Information may be shared only with trusted service providers (e.g., ID printing, event management).</li>
							<li>We may disclose information if required by law or to protect the safety of our members and organization.</li>
						</ul>

						<SectionHeading id='security'>4. Data Security</SectionHeading>
						<p className='text-sm md:text-base'>We implement reasonable measures to protect your information, including restricted access and data encryption. However, no system is completely secure, and we cannot guarantee absolute protection.</p>

						<SectionHeading id='retention'>5. Data Retention</SectionHeading>
						<p className='text-sm md:text-base'>Your data will be retained while you remain a member. You may request deletion of your data at any time by contacting us.</p>

						<SectionHeading id='rights'>6. Your Rights Under the Data Privacy Act of 2012</SectionHeading>
						<ul className='list-disc pl-6 space-y-2 text-sm md:text-base'>
							<li>Be informed about how your data is collected and processed.</li>
							<li>Access and review your personal information.</li>
							<li>Correct or update inaccurate details.</li>
							<li>Request deletion or blocking of your data.</li>
							<li>Object to the processing of your data in certain circumstances.</li>
						</ul>

						<SectionHeading id='updates'>7. Updates to This Policy</SectionHeading>
						<p className='text-sm md:text-base'>We may update this Privacy Policy when necessary. Any significant changes will be announced to members.</p>

						<SectionHeading id='contact'>8. Contact Us</SectionHeading>
						<p className='text-sm md:text-base'>
							If you have questions about this Privacy Policy or how we handle your data, please{' '}
							<Link href='/contact' className='text-blue-400 hover:cursor-pointer hover:underline'>
								contact us
							</Link>
							.
						</p>
					</PageShell>
				</section>
			</Container>
			<Footer />
		</>
	);
}
