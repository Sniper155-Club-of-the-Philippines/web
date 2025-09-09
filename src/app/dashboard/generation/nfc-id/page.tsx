'use client';

import SelectSearch from '@/components/base/inputs/SelectSearch';
import { Label } from '@/components/ui/label';
import { useProfileQuery } from '@/hooks/queries';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { Profile } from '@/types/models/profile';
import { Button } from '@/components/ui/button';
import {
    deviceSupportsNFC,
    deviceAllowsNFC,
    requestAccessToNFC,
    nfcEvents,
    writeToTag,
} from '@/lib/web-nfc';
import { toast } from 'sonner';
import { useVCard } from '@/hooks/data';
import CardFront from '@/components/profile/cards/CardFront';
import { exportAsPNG } from '@/lib/dom';
import CardRear from '@/components/profile/cards/CardRear';
import { useQrCode } from '@/hooks/qr';
import { useAtom } from 'jotai';
import { loadingAtom } from '@/atoms/misc';

const encoder = new TextEncoder();

export default function NFCID() {
    const { data: profiles } = useProfileQuery();
    const [profile, setProfile] = useState<Profile | null>();
    const [nfcSupported, setNfcSupported] = useState(false);
    const options =
        profiles?.map(({ id, user }) => ({
            label: `${user?.last_name}, ${user?.first_name}`,
            value: id,
        })) ?? [];
    const [writing, setWriting] = useState(false);
    const vcard = useVCard(profile);
    const frontCardRef = useRef<HTMLDivElement>(null);
    const rearCardRef = useRef<HTMLDivElement>(null);
    const { qrCodeInstance, canvasRef } = useQrCode(profile);
    const [, setLoading] = useAtom(loadingAtom);

    const writeToNfc = async () => {
        setWriting(true);
        setLoading(true);
        try {
            if (!vcard || !profile) {
                toast.error('No Profile available', { closeButton: true });
                return;
            }

            if (!(await deviceAllowsNFC())) {
                await requestAccessToNFC();
            }

            await writeToTag(
                [
                    {
                        recordType: 'url',
                        data: profile.url,
                    },
                    {
                        recordType: 'mime',
                        mediaType: 'text/vcard',
                        data: encoder.encode(vcard.toString()).buffer,
                    },
                ],
                { overwrite: true, timeoutInSeconds: 5 }
            );

            toast.success('NFC Write Successful', { closeButton: true });
        } catch (error) {
            console.error(error);
            toast.error('NFC Write Error', { closeButton: true });
        } finally {
            setWriting(false);
            setLoading(false);
        }
    };

    const downloadQrCode = () => {
        setLoading(true);
        requestAnimationFrame(async () => {
            try {
                await qrCodeInstance.current?.download({
                    name: `${profile?.user?.last_name}, ${profile?.user?.first_name}`,
                    extension: 'png',
                });
            } catch (error) {
                console.error(error);
                toast.error('Unable to download QR code.', {
                    closeButton: true,
                });
            } finally {
                setLoading(false);
            }
        });
    };

    const name = useMemo(
        () => `${profile?.user?.first_name} ${profile?.user?.last_name}`,
        [profile]
    );

    const downloadCard = async (
        ref: RefObject<HTMLDivElement | null>,
        title = ''
    ) => {
        if (ref.current) {
            setLoading(true);
            try {
                await exportAsPNG(ref.current, name + title);
            } catch (error) {
                console.error(error);
                toast.error('Unable to export card.', {
                    closeButton: true,
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const onPermissionGrant = () => {
        toast.info('NFC Permission Granted', { closeButton: true });
    };

    const onPermissionDenied = () => {
        toast.warning('NFC Permission Denied', { closeButton: true });
    };

    useEffect(() => {
        deviceSupportsNFC()
            .then(setNfcSupported)
            .catch((error) => {
                console.error(error);
                setNfcSupported(false);
            });

        nfcEvents.on('PermissionGranted', onPermissionGrant);
        nfcEvents.on('PermissionDenied', onPermissionDenied);

        return () => {
            nfcEvents.off('PermissionGranted', onPermissionGrant);
            nfcEvents.off('PermissionDenied', onPermissionDenied);
        };
    }, []);

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-col'>
                <Label htmlFor='name' className='text-right mb-3'>
                    Member
                </Label>
                <div>
                    <SelectSearch
                        id='name'
                        onChange={(e) =>
                            setProfile(
                                profiles?.find(
                                    (profile) => profile.id === e.target.value
                                )
                            )
                        }
                        name='name'
                        options={options}
                        value={profile?.id}
                    />
                </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[calc(100vh-190px)] md:max-h-none overflow-y-scroll md:overflow-y-hidden pb-5 md:pb-0'>
                <div className='flex flex-col gap-4'>
                    <Label>QR Code</Label>
                    <div className='h-[300px] w-[300px]'>
                        <div
                            ref={canvasRef}
                            key={profile?.id}
                            id='qr-canvas'
                        ></div>
                    </div>
                    {vcard && (
                        <Button onClick={downloadQrCode}>Download</Button>
                    )}
                    {nfcSupported && vcard && (
                        <Button onClick={writeToNfc} disabled={writing}>
                            {writing ? 'Writing' : 'Write to NFC'}
                        </Button>
                    )}
                </div>
                {vcard && (
                    <div className='flex flex-col gap-4'>
                        <Label>VCard NFC Data</Label>
                        <div
                            className='bg-muted h-full whitespace-pre-wrap cursor-pointer group relative'
                            onClick={() => {
                                navigator.clipboard.writeText(vcard.toString());
                                toast.info('Copied VCard to clipboard', {
                                    closeButton: true,
                                });
                            }}
                        >
                            <code className='relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold whitespace-pre-wrap break-all'>
                                {vcard.toString()}
                            </code>
                            <span className='absolute right-2 top-2 text-xs opacity-0 group-hover:opacity-100 transition'>
                                Click to copy
                            </span>
                        </div>
                    </div>
                )}
                {profile?.user && name && (
                    <>
                        <div className='flex flex-col gap-4'>
                            <CardFront
                                ref={frontCardRef}
                                src={profile.user.photo_url}
                                name={name}
                                date={'June 20, 2025'}
                                yclubNumber={profile.user.yclub_number}
                            />
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    downloadCard(frontCardRef, '-front');
                                }}
                            >
                                Download
                            </Button>
                        </div>
                        <div className='flex flex-col gap-4'>
                            <CardRear ref={rearCardRef} profile={profile} />
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    downloadCard(rearCardRef, '-rear');
                                }}
                            >
                                Download
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
