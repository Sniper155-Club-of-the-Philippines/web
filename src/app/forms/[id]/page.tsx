'use client';

import NotFound from '@/app/not-found';
import { loadingAtom } from '@/atoms/misc';
import FormForm, { FormSubmitPayload } from '@/components/base/forms/FormForm';
import { useRefreshToken } from '@/hooks/auth';
import { useFormQuery } from '@/hooks/queries';
import { useAtom } from 'jotai';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { auth, form } from '@/api';
import { useHttp } from '@/hooks/http';
import { accessAtom, userAtom } from '@/atoms/auth';
import { RESET } from 'jotai/utils';
import Logo from '@/components/root/Logo';
import { FORM_FIELD_TYPES } from '@/constants';
import dayjs from 'dayjs';
import { useToggle } from '@avidian/hooks';
import { CircleCheckBigIcon } from 'lucide-react';

export default function AnswerForm() {
    const params = useParams<{ id: string }>();
    const [loading, setLoading] = useAtom(loadingAtom);
    const [user, setUser] = useAtom(userAtom);
    const [, setAccess] = useAtom(accessAtom);
    const { data, isError, isLoading } = useFormQuery(params.id, true, {
        retry: false,
    });

    const http = useHttp();
    const [submitted, setSubmitted] = useToggle(false);
    const router = useRouter();

    const fetchStatus = useCallback(() => {
        form.status(http, params.id)
            .then(() => {
                setSubmitted(true);
            })
            .catch(() => {
                setSubmitted(false);
            });
    }, [http, params.id, setSubmitted]);

    const handleSubmit = async (data: FormSubmitPayload) => {
        setLoading(true);
        try {
            const answers = data.formData.reduce((payload, item) => {
                switch (item.type) {
                    case FORM_FIELD_TYPES.CHECKBOXES:
                        payload[item.id] = item.value;
                        break;
                    case FORM_FIELD_TYPES.DATE:
                        payload[item.id] = dayjs(item.value).toJSON();
                        break;
                    case FORM_FIELD_TYPES.DATETIME:
                        payload[item.id] = dayjs(item.value).toJSON();
                        break;
                    case FORM_FIELD_TYPES.DROPDOWN:
                        payload[item.id] = item.value;
                        break;
                    case FORM_FIELD_TYPES.MULTIPLE_CHOICE:
                        payload[item.id] = item.value;
                        break;
                    case FORM_FIELD_TYPES.TEXT:
                        payload[item.id] = item.value;
                        break;
                    case FORM_FIELD_TYPES.PARAGRAPH:
                        payload[item.id] = item.value;
                        break;
                    case FORM_FIELD_TYPES.TIME:
                        payload[item.id] = dayjs(item.value).format('HH:mm');
                        break;
                }

                return payload;
            }, {} as Record<string, any>);

            await form.answer(http, params.id, answers);
            toast.success('Form submitted successfully!', {
                closeButton: true,
            });
            setSubmitted(true);
        } catch (error) {
            console.error(error);
            toast.error('Unable to submit form.', {
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await auth.logout(http);
        } catch (error) {
            console.error(error);
        }

        setUser(RESET);
        setAccess(RESET);
    };

    useEffect(() => {
        if (isLoading && !loading) {
            setLoading(true);
        } else if (!isLoading && loading) {
            setLoading(false);
        }
    }, [isLoading, loading, setLoading]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    useRefreshToken({
        redirectTo: `/forms/${params.id}`,
    });

    if ((isError || !data) && !loading && isError) {
        return (
            <NotFound message='Form cannot be found. Please check your link and try again.' />
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div className='flex flex-col h-full'>
            <div className='flex justify-between items-center border-b px-4 py-2 bg-background shadow-sm'>
                <div className='text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                    <Logo />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight ml-2'>
                    <span className='truncate font-medium'>S155CP Inc</span>
                </div>
                {user && !submitted && (
                    <div className='flex items-center gap-3'>
                        <span className='text-sm text-muted-foreground'>
                            {user.first_name} {user.last_name} ({user.email})
                        </span>
                        <Avatar>
                            <AvatarImage
                                src={
                                    user.photo_url ??
                                    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.first_name}%20${user?.last_name}`
                                }
                                alt='User'
                            />
                            <AvatarFallback>
                                {user.first_name.charAt(0)}
                                {user.last_name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={(e) => {
                                e.preventDefault();
                                logout();
                            }}
                        >
                            Sign out
                        </Button>
                    </div>
                )}
            </div>

            {submitted ? (
                <div className='flex flex-1 items-center justify-center p-8'>
                    <div className='max-w-md w-full text-center space-y-4'>
                        <div className='flex items-center justify-center'>
                            <div className='rounded-full bg-green-100 p-4'>
                                <CircleCheckBigIcon
                                    className='text-green-600'
                                    size={50}
                                />
                            </div>
                        </div>
                        <h2 className='text-xl font-semibold text-foreground'>
                            Your response has been recorded
                        </h2>
                        <p className='text-sm text-muted-foreground'>
                            Thank you for submitting the form. You may close
                            this window.
                        </p>
                        <div className='flex justify-center gap-3 pt-4'>
                            <Button
                                variant='outline'
                                onClick={(e) => {
                                    e.preventDefault();
                                    setTimeout(() => {
                                        logout();
                                    }, 100);
                                    router.replace('/');
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='overflow-auto flex-1 p-4'>
                    <FormForm
                        initialTitle={data.title}
                        initialDescription={data.description}
                        initialFields={data.fields}
                        onSubmit={handleSubmit}
                        answer
                    />
                </div>
            )}
        </div>
    );
}
