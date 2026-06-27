import MemberPageHeader from '@/components/member/MemberPageHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ReceiptText } from 'lucide-react';

export default function MemberOrdersPage() {
    return (
        <>
            <MemberPageHeader
                title='Orders'
                description='Track payment review and fulfillment progress.'
            />
            <Alert>
                <ReceiptText />
                <AlertTitle>No orders yet</AlertTitle>
                <AlertDescription>
                    Orders will appear here after checkout becomes available.
                </AlertDescription>
            </Alert>
        </>
    );
}
