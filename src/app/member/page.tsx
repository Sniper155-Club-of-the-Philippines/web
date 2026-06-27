import MemberPageHeader from '@/components/member/MemberPageHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShoppingBag } from 'lucide-react';

export default function MemberStorePage() {
    return (
        <>
            <MemberPageHeader
                title='Member Store'
                description='Official S155CP merchandise for active ordering periods.'
            />
            <Alert>
                <ShoppingBag />
                <AlertTitle>Store catalog not configured yet</AlertTitle>
                <AlertDescription>
                    Products will appear here when store configuration is ready.
                </AlertDescription>
            </Alert>
        </>
    );
}
