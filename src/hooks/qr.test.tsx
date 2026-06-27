import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { render } from '@testing-library/react';
import QRCode from 'qr-code-styling';
import { useQrCode } from './qr';
import { LogoContext } from '@/contexts/logo';

const append = vi.fn();
vi.mock('qr-code-styling', () => ({
    default: vi.fn().mockImplementation(() => ({ append })),
}));

function Probe({ value }: { value?: string | null }) {
    const { canvasRef } = useQrCode(value);
    return createElement('div', { ref: canvasRef, 'data-testid': 'qr' });
}

function withLogo(logo: string | null, children: ReactNode) {
    return createElement(LogoContext.Provider, { value: logo }, children);
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useQrCode', () => {
    it('does not build a QR code without a value', () => {
        render(withLogo(null, createElement(Probe, {})));
        expect(QRCode).not.toHaveBeenCalled();
    });

    it('builds a QR code with the value and appends it to the canvas', () => {
        render(withLogo(null, createElement(Probe, { value: 'hello' })));
        expect(QRCode).toHaveBeenCalledOnce();
        const opts = vi.mocked(QRCode).mock.calls[0][0]!;
        expect(opts.data).toBe('hello');
        expect(opts.type).toBe('svg');
        expect(opts.image).toBeUndefined();
        expect(append).toHaveBeenCalledOnce();
    });

    it('embeds the logo image when a logo is in context', () => {
        render(
            withLogo(
                'https://logo/x.png',
                createElement(Probe, { value: 'hello' }),
            ),
        );
        const opts = vi.mocked(QRCode).mock.calls[0][0]!;
        expect(opts.image).toBe('https://logo/x.png');
    });
});
