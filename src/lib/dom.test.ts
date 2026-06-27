import { afterEach, describe, expect, it, vi } from 'vitest';
import { toPng } from 'html-to-image';
import { exportAsPNG } from './dom';

vi.mock('html-to-image', () => ({
    toPng: vi.fn().mockResolvedValue('data:image/png;base64,AAAA'),
}));

afterEach(() => vi.clearAllMocks());

describe('exportAsPNG', () => {
    it('returns early when no element is given', async () => {
        await exportAsPNG(null as never);
        expect(toPng).not.toHaveBeenCalled();
    });

    it('captures the element and triggers an anchor download', async () => {
        const clickSpy = vi
            .spyOn(HTMLAnchorElement.prototype, 'click')
            .mockImplementation(() => {});

        const el = document.createElement('div');
        await exportAsPNG(el, 'card.png', 2);

        expect(toPng).toHaveBeenCalledOnce();
        const [, opts] = vi.mocked(toPng).mock.calls[0];
        expect(opts?.pixelRatio).toBe(2);
        expect(clickSpy).toHaveBeenCalledOnce();
    });

    it('defaults the filename and dpi', async () => {
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
            () => {},
        );
        await exportAsPNG(document.createElement('div'));
        const [, opts] = vi.mocked(toPng).mock.calls.at(-1)!;
        expect(opts?.pixelRatio).toBe(3);
    });
});
