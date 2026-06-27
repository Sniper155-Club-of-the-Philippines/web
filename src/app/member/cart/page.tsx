import MemberPageHeader from '@/components/member/MemberPageHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShoppingBag } from 'lucide-react';

export default function MemberCartPage() {
    return (
        <>
            <MemberPageHeader
                title='Cart'
                description='Review merchandise before checkout.'
            />
            <Alert>
                <ShoppingBag />
                <AlertTitle>Your cart is empty</AlertTitle>
                <AlertDescription>
                    Cart ordering becomes available with the store catalog.
                </AlertDescription>
            </Alert>
        </>
    );
}
