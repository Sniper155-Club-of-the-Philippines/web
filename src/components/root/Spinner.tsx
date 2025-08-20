'use client';

import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';
import { loadingAtom } from '@/atoms/misc';

export default function BaseSpinner() {
    const [loading] = useAtom(loadingAtom);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                >
                    <Spinner variant="ring" className="text-white" size={48} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
