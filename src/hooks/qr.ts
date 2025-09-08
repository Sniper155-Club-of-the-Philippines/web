import { Profile } from '@/types/models/profile';
import { useEffect, useRef } from 'react';
import QRCode from 'qr-code-styling';
import { useLogo } from '@/contexts/logo';

export type Options = {
    height?: number;
    width?: number;
    appendLogo?: boolean;
};

export function useQrCode(
    profile?: Profile | null,
    options: Options = {
        height: 300,
        width: 300,
        appendLogo: true,
    }
) {
    const logoUrl = useLogo();
    const canvasRef = useRef<HTMLDivElement>(null);
    const qrCodeInstance = useRef<QRCode | null>(null);

    useEffect(() => {
        if (!profile || !canvasRef.current) {
            return;
        }

        canvasRef.current.innerHTML = '';

        qrCodeInstance.current = new QRCode({
            width: options.width,
            height: options.height,
            type: 'svg',
            data: profile.url,
            image: logoUrl && options.appendLogo ? logoUrl : undefined,
            imageOptions: {
                crossOrigin: 'anonymous',
            },
            dotsOptions: {
                roundSize: false,
            },
        });

        qrCodeInstance.current.append(canvasRef.current);
    }, [profile, logoUrl, options]);

    return { canvasRef, qrCodeInstance };
}
