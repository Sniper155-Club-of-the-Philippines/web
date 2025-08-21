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
                                {routes.length > 1 && (
                                    <BreadcrumbSeparator className='hidden md:block' />
                                )}
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        {route.title}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </Fragment>
                        );
                    }

                    return (
                        <BreadcrumbItem key={index} className='hidden md:block'>
                            <BreadcrumbLink asChild>
                                <Link href={route.url}>{route.title}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
