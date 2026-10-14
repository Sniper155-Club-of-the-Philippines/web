import { renderToString } from 'react-dom/server';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useHydrated } from './hydrated';

function Probe() {
    return <span>{useHydrated() ? 'client' : 'server'}</span>;
}

describe('useHydrated', () => {
    it('is false while rendering on the server', () => {
        expect(renderToString(<Probe />)).toContain('server');
    });

    it('is true once mounted on the client', () => {
        const { result } = renderHook(() => useHydrated());

        expect(result.current).toBe(true);
    });
});
