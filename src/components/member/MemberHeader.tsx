import Logo from '@/components/root/Logo';
import MemberAccountMenu from '@/components/member/MemberAccountMenu';
import MemberNavigation from '@/components/member/MemberNavigation';
import Link from 'next/link';

export default function MemberHeader() {
    return (
        <header className='bg-background sticky top-0 z-40 border-b'>
            <div className='mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6'>
                <Link
                    href='/member'
                    className='flex min-w-0 items-center gap-3'
                >
                    <Logo />
                    <span className='truncate font-semibold'>
                        S155CP Member Portal
                    </span>
                </Link>
                <div className='ml-auto hidden md:block'>
                    <MemberNavigation />
                </div>
                <MemberAccountMenu />
            </div>
        </header>
    );
}
