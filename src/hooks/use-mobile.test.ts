import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

function setupMatchMedia() {
    const listeners = new Set<() => void>();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: (_: string, cb: () => void) => listeners.add(cb),
        removeEventListener: (_: string, cb: () => void) =>
            listeners.delete(cb),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })) as never;
    return {
        fireChange: () => listeners.forEach((cb) => cb()),
    };
}

function setWidth(width: number) {
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
    });
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useIsMobile', () => {
    it('is true below the 768px breakpoint', () => {
        setupMatchMedia();
        setWidth(500);
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
    });

    it('is false at or above the breakpoint', () => {
        setupMatchMedia();
        setWidth(1024);
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
    });

    it('reacts to media query changes', () => {
        const mql = setupMatchMedia();
        setWidth(1024);
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);

        setWidth(400);
        act(() => mql.fireChange());
        expect(result.current).toBe(true);
    });
});
