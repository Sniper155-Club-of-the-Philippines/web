import LoadingOverlay from '@/components/root/LoadingOverlay';

// Shown while a dashboard sub-page compiles or loads; the sidebar shell
// (dashboard/layout) stays mounted underneath.
export default function Loading() {
    return <LoadingOverlay />;
}
