export default function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
	return (
		<h2 id={id} className='text-xl md:text-2xl font-semibold tracking-tight mt-8 mb-3 scroll-mt-24'>
			{children}
		</h2>
	);
}
