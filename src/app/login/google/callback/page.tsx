'use client';

import GoogleCallback from '@/components/auth/GoogleCallback';
import { Suspense } from 'react';

export default function CallbackPage() {
    return (
        <Suspense fallback={<p>Signing you in…</p>}>
            <GoogleCallback />
        </Suspense>
    );
}
