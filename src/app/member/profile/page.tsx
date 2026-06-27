import ChangePasswordForm from '@/components/auth/ChangePasswordForm';
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
                description='Manage store recipient names and account security.'
            />

            <div className='grid items-start gap-6 lg:grid-cols-2'>
                <Card>
                    <CardHeader>
                        <CardTitle>Member identity</CardTitle>
                        <CardDescription>
                            Club records are managed by an administrator.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MemberIdentity />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Store recipients</CardTitle>
                        <CardDescription>
                            These names are copied into cart and order records.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MemberProfileForm />
                    </CardContent>
                </Card>
            </div>

            <Card className='max-w-2xl'>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                        Change your password after confirming the current one.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChangePasswordForm />
                </CardContent>
            </Card>
        </>
    );
}
