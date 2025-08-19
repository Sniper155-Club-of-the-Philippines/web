import React from 'react';

import Container from '@/components/root/Container';
import Header from '@/components/root/Header';
import Footer from '@/components/root/Footer';
import PageShell from '@/components/legal/PageShell';
import SectionHeading from '@/components/legal/SectionHeading';

export default function TermsAndConditions() {
	return (
		<>
			<Header />
			<Container fluid className='px-4'>
				<section className='py-2'>
					<PageShell title='Sniper155 Club of the Philippines — Terms & Conditions'>
						<p className='text-sm md:text-base leading-relaxed'>Welcome to the Sniper155 Club of the Philippines Inc. By registering and using our website, app, or services, you agree to these Terms & Conditions.</p>

						<SectionHeading id='eligibility'>1. Membership Eligibility</SectionHeading>
						<ul className='list-disc pl-6 space-y-2 text-sm md:text-base'>
							<li>Membership is open to Yamaha Sniper155 riders and enthusiasts.</li>
							<li>Registration is voluntary but may be required to access certain features or services.</li>
						</ul>

						<SectionHeading id='accounts'>2. Member Accounts</SectionHeading>
						<ul className='list-disc pl-6 space-y-2 text-sm md:text-base'>
							<li>You must provide accurate and truthful information during registration.</li>
							<li>You are responsible for keeping your login credentials secure.</li>
							<li>S155CP is not responsible for unauthorized use of your account.</li>
						</ul>

						<SectionHeading id='services'>3. Club Services & Features</SectionHeading>
						<ul className='list-disc pl-6 space-y-2 text-sm md:text-base'>
							<li>Registered members may access various club services, including online features, events, and announcements.</li>
							<li>
								Certain benefits (such as an official NFC ID card) are <span className='font-medium'>optional</span> and not required for membership.
							</li>
							<li>New services and features may be introduced in the future as part of the membership experience.</li>
						</ul>

						<SectionHeading id='acceptable-use'>4. Use of Services</SectionHeading>
						<ul className='list-disc pl-6 space-y-2 text-sm md:text-base'>
							<li>Do not misuse the website, app, or membership system.</li>
							<li>Do not provide false information to obtain membership or club benefits.</li>
							<li>Do not use the club’s name, logo, or membership resources for fraudulent purposes.</li>
						</ul>

						<SectionHeading id='privacy'>5. Privacy & Data Protection</SectionHeading>
						<ul className='list-disc pl-6 space-y-2 text-sm md:text-base'>
							<li>Your use of our services is also governed by our Privacy Policy.</li>
							<li>S155CP complies with the Philippine Data Privacy Act of 2012 (RA 10173) in handling member information.</li>
						</ul>

						<SectionHeading id='termination'>6. Termination of Membership</SectionHeading>
						<p className='text-sm md:text-base'>The club reserves the right to suspend or revoke membership if a member violates these Terms or engages in conduct harmful to the club’s reputation.</p>

						<SectionHeading id='liability'>7. Limitation of Liability</SectionHeading>
						<ul className='list-disc pl-6 space-y-2 text-sm md:text-base'>
							<li>S155CP is not liable for technical issues, system downtime, or lost/damaged IDs.</li>
							<li>We are not responsible for unauthorized use of your membership account.</li>
						</ul>

						<SectionHeading id='changes'>8. Changes to Terms</SectionHeading>
						<p className='text-sm md:text-base'>We may update these Terms & Conditions at any time. Continued use of our services after updates means you accept the new Terms.</p>
					</PageShell>
				</section>
			</Container>
			<Footer />
		</>
	);
}
