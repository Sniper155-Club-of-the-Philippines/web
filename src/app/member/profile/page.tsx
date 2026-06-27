import MemberIdentity from '@/components/member/MemberIdentity';
import MemberPageHeader from '@/components/member/MemberPageHeader';
import MemberProfileForm from '@/components/member/MemberProfileForm';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function MemberProfilePage() {
    return (
        <>
            <MemberPageHeader
                title='Profile'
                description='Your membership details and the names printed on your merchandise.'
            />

            <div className='grid items-start gap-6 lg:grid-cols-2'>
                <Card>
                    <CardHeader>
                        <CardTitle>Membership</CardTitle>
                        <CardDescription>
                            Managed by club administrators. Contact them to
                            correct anything here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MemberIdentity />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order nicknames</CardTitle>
                        <CardDescription>
                            The rider and OBR names printed on the items you
                            order.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MemberProfileForm />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
