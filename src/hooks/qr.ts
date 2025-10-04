import { useEffect, useRef } from 'react';
import QRCode from 'qr-code-styling';
import { useLogo } from '@/contexts/logo';

export type Options = {
    height?: number;
    width?: number;
    appendLogo?: boolean;
    dotsColor?: string;
};

export function useQrCode(
    value?: string | null,
    options: Options = {
        height: 300,
        width: 300,
        appendLogo: true,
        dotsColor: '#000000',
    }
) {
    const logoUrl = useLogo();
    const canvasRef = useRef<HTMLDivElement>(null);
    const qrCodeInstance = useRef<QRCode | null>(null);

    useEffect(() => {
        if (!value || !canvasRef.current) {
            return;
        }

        canvasRef.current.innerHTML = '';

        qrCodeInstance.current = new QRCode({
            width: options.width,
            height: options.height,
            type: 'svg',
            data: value,
            image: logoUrl && options.appendLogo ? logoUrl : undefined,
            imageOptions: {
                crossOrigin: 'anonymous',
            },
            dotsOptions: {
                roundSize: false,
                color: options.dotsColor,
            },
        });

        qrCodeInstance.current.append(canvasRef.current);
    }, [value, logoUrl, options]);

    return { canvasRef, qrCodeInstance };
}
