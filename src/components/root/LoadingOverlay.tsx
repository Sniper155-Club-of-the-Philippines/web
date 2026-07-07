'use client';

import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { motion } from 'framer-motion';

/**
 * Presentational full-screen loading overlay. Always renders while mounted, so
 * it works as a Suspense/route fallback (loading.tsx), an auth-validation
 * placeholder, or the visual for the loadingAtom-driven BaseSpinner.
 */
export default function LoadingOverlay() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50'
            style={{ pointerEvents: 'all' }}
            onPointerDown={(e) => {
                e.preventDefault();
            }}
            onClick={(e) => {
                e.preventDefault();
            }}
        >
            <div className='pointer-events-none'>
                <Spinner variant='ring' className='text-white' size={48} />
            </div>
        </motion.div>
    );
}
