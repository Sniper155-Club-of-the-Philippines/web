import LoadingOverlay from '@/components/root/LoadingOverlay';

// Route-level fallback: shown while a new page segment compiles or loads
// during navigation, and on initial route load.
export default function Loading() {
    return <LoadingOverlay />;
}
