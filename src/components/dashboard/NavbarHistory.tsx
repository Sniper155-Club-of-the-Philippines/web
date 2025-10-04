'use client';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useRouteBreadcrumbs } from '@/hooks/routing';
import Link from 'next/link';
import { Fragment } from 'react';

export default function NavbarHistory() {
    const routes = useRouteBreadcrumbs();

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {routes.map((route, index) => {
                    const isLast = index === routes.length - 1;

                    if (isLast) {
                        return (
                            <Fragment key={index}>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className='select-none'>
                                        {route.title}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </Fragment>
                        );
                    }

                    return (
                        <Fragment key={index}>
                            <BreadcrumbItem
                                key={index}
                                className='hidden md:block'
                            >
                                <BreadcrumbLink asChild>
                                    <Link href={route.url}>{route.title}</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            {routes.length > 1 && (
                                <BreadcrumbSeparator className='hidden md:block' />
                            )}
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
