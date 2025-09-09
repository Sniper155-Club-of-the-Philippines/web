'use client';

import GoogleCallback from '@/components/auth/GoogleCallback';
import Spinner from '@/components/root/Spinner';
import { Suspense } from 'react';

export default function CallbackPage() {
    return (
        <Suspense fallback={<Spinner />}>
            <GoogleCallback />
        </Suspense>
    );
}
