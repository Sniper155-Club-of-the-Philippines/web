'use client';

import React, { Fragment, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

const steps = [
    { key: 'send', label: 'Send' },
    { key: 'verify', label: 'Verify' },
    { key: 'finalize', label: 'Finalize' },
];

export default function ForgotPasswordLayout({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();
    const activeStep = steps.findIndex((s) => pathname?.includes(s.key));

    return (
        <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
            <div className='w-full max-w-sm'>
                <div className='flex flex-col gap-6'>
                    {/* Step Indicator */}
                    <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
                        {steps.map((step, index) => (
                            <Fragment key={step.key}>
                                <span
                                    className={`px-2 py-1 rounded-md ${
                                        index === activeStep
                                            ? 'bg-primary text-white font-medium'
                                            : 'bg-muted'
                                    }`}
                                >
                                    {step.label}
                                </span>
                                {index < steps.length - 1 && <span>→</span>}
                            </Fragment>
                        ))}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
