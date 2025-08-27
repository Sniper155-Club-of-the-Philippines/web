import Link from 'next/link';
import Logo from '@/components/root/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { DialogTitle } from '@radix-ui/react-dialog';

export default function Header() {
    return (
        <div className='flex items-center h-14 px-6 bg-neutral-100 dark:bg-neutral-900 shadow print:hidden'>
            <Logo />
            <span className='text-lg ml-2 dark:text-white select-none hidden md:block'>
                S155CP
            </span>

            <div className='ml-auto gap-6 hidden md:flex'>
                <Link href='/' className='dark:text-white hover:underline'>
                    Home
                </Link>
                <Link href='/about' className='dark:text-white hover:underline'>
                    About
                </Link>
                <Link
                    href='/events'
                    className='dark:text-white hover:underline'
                >
                    Events
                </Link>
                <Link
                    href='/gallery'
                    className='dark:text-white hover:underline'
                >
                    Gallery
                </Link>
                <Link
                    href='/contact'
                    className='dark:text-white hover:underline'
                >
                    Contact
                </Link>
                <Link href='/login' className='dark:text-white hover:underline'>
                    Admin
                </Link>
            </div>

            <div className='ml-auto md:hidden'>
                <Sheet>
                    <DialogTitle className='hidden'>Toggle Menu</DialogTitle>
                    <SheetTrigger asChild>
                        <Button variant='ghost' size='icon'>
                            <Menu className='h-6 w-6' />
                            <span className='sr-only'>Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side='right'
                        className='flex flex-col gap-4 p-6'
                    >
                        <div className='h-14 flex items-center'>
                            <Logo />
                            <span className='text-lg ml-2 dark:text-white select-none'>
                                S155CP
                            </span>
                        </div>
                        <Link
                            href='/'
                            className='dark:text-white hover:underline'
                        >
                            Home
                        </Link>
                        <Link
                            href='/about'
                            className='dark:text-white hover:underline'
                        >
                            About
                        </Link>
                        <Link
                            href='/events'
                            className='dark:text-white hover:underline'
                        >
                            Events
                        </Link>
                        <Link
                            href='/gallery'
                            className='dark:text-white hover:underline'
                        >
                            Gallery
                        </Link>
                        <Link
                            href='/contact'
                            className='dark:text-white hover:underline'
                        >
                            Contact
                        </Link>
                        <Link
                            href='/login'
                            className='dark:text-white hover:underline'
                        >
                            Admin
                        </Link>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
