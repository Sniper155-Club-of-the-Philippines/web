import Logo from '@/components/root/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Label } from '@radix-ui/react-label';

export default function Login() {
	return (
		<div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
			<div className='w-full max-w-sm'>
				<div className='flex flex-col gap-6'>
					<Card>
						<CardHeader>
							<Logo />
							<CardTitle>Login to your account</CardTitle>
							<CardDescription>Enter your email below to login to your account</CardDescription>
						</CardHeader>
						<CardContent>
							<form>
								<div className='flex flex-col gap-1'>
									<div className='grid gap-3'>
										<Label htmlFor='email'>Email</Label>
										<Input id='email' type='email' placeholder='Email' required />
									</div>
									<div className='grid gap-3'>
										<div className='flex items-center'>
											<Label htmlFor='password'>Password</Label>
											<a href='#' className='ml-auto inline-block text-sm underline-offset-4 hover:underline'>
												Forgot your password?
											</a>
										</div>
										<Input id='password' type='password' placeholder='Password' required />
									</div>
									<div className='flex flex-col gap-3 mt-3'>
										<Button type='submit' className='w-full'>
											Login
										</Button>
										<Button variant='outline' className='w-full'>
											<FontAwesomeIcon icon={faGoogle} />
											Login with Google
										</Button>
									</div>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
