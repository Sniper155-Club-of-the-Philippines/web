'use client';

import SelectSearch from '@/components/base/inputs/SelectSearch';
import { Label } from '@/components/ui/label';
import { useProfileQuery } from '@/hooks/queries';
import { useEffect, useMemo, useRef, useState } from 'react';
import { VCard } from '@scr2em/vcard';
import { Profile } from '@/types/models/profile';
import QRCode from 'qr-code-styling';
import { Button } from '@/components/ui/button';
import {
    deviceSupportsNFC,
    deviceAllowsNFC,
    requestAccessToNFC,
    nfcEvents,
    writeToTag,
} from 'webnfc';
import { toast } from 'sonner';
import { useLogo } from '@/contexts/logo';

const encoder = new TextEncoder();

export default function NFCID() {
    const logoUrl = useLogo();
    const { data: profiles } = useProfileQuery();
    const [profile, setProfile] = useState<Profile | null>();
    const canvasRef = useRef<HTMLDivElement>(null);
    const [nfcSupported, setNfcSupported] = useState(false);
    const options =
        profiles?.map((profile) => ({
            label: `${profile.user?.last_name}, ${profile.user?.first_name}`,
            value: profile.id,
        })) ?? [];
    const qrCodeInstance = useRef<QRCode | null>(null);
    const [writing, setWriting] = useState(false);

    const vcard = useMemo(() => {
        if (!profile?.user) {
            return null;
        }

        const user = profile.user;

        const card = new VCard()
            .setName(user.first_name, user.last_name)
            .setOrganization('Sniper 155 Club of the Philippines Inc.')
            .addUrl({
                label: 'Profile',
                value: profile.url,
                type: 'home',
            });

        if (user.designation) {
            card.setJobTitle(user.designation);
        }

        if (user.phone) {
            card.addPhone({
                label: 'Phone',
                type: 'cell',
                value: user.phone,
            });
        }

        return card;
    }, [profile]);

    const writeToNfc = async () => {
        setWriting(true);
        try {
            if (!vcard) {
                return;
            }

            if (!(await deviceAllowsNFC())) {
                await requestAccessToNFC();
            }

            const vcardBuffer = encoder.encode(vcard.toString()).buffer;

            await writeToTag('text/x-vcard', vcardBuffer, true, 5);
            toast('NFC Write Successful', {
                closeButton: true,
            });
        } catch (error) {
            console.error(error);
            toast('NFC Write Error', {
                closeButton: true,
            });
        } finally {
            setWriting(false);
        }
    };

    const downloadQrCode = () => {
        qrCodeInstance.current?.download({
            name: `${profile?.user?.last_name}, ${profile?.user?.first_name}`,
            extension: 'png',
        });
    };

    useEffect(() => {
        if (!vcard || !canvasRef.current) {
            return;
        }

        canvasRef.current.innerHTML = '';

        qrCodeInstance.current = new QRCode({
            width: 300,
            height: 300,
            type: 'svg',
            data: vcard.toString(),
            image: logoUrl ?? undefined,
            imageOptions: {
                crossOrigin: 'anonymous',
            },
        });

        qrCodeInstance.current.append(canvasRef.current);
    }, [vcard, logoUrl]);

    const onPermissionGrant = () => {
        toast('NFC Permission Granted', {
            closeButton: true,
        });
    };

    const onPermissionDenied = () => {
        toast('NFC Permission Denied', {
            closeButton: true,
        });
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
                            id='canvas'
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
                                toast('Copied VCard to clipboard', {
                                    closeButton: true,
                                });
                            }}
                        >
                            <code className='relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold'>
                                {vcard.toString()}
                            </code>
                            <span className='absolute right-2 top-2 text-xs opacity-0 group-hover:opacity-100 transition'>
                                Click to copy
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
