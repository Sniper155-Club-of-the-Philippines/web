'use client';

import { AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';
import { loadingAtom } from '@/atoms/misc';
import LoadingOverlay from '@/components/root/LoadingOverlay';

export default function BaseSpinner() {
    const [loading] = useAtom(loadingAtom);

    return <AnimatePresence>{loading && <LoadingOverlay />}</AnimatePresence>;
}
