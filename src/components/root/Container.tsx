export default function Container({ children }: { children: React.ReactNode }) {
	return <div className='flex h-[calc(100vh-3.5rem)] items-center justify-center'>{children}</div>;
}
