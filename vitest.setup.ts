import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

process.env.NEXT_PUBLIC_API_URL ??= 'http://localhost:8000';
process.env.NEXT_PUBLIC_SITE_URL ??= 'http://localhost:3000';

// jsdom under Node 26 does not expose a working `localStorage`, which the
// `atomWithStorage` auth atoms depend on. Provide an in-memory implementation.
class MemoryStorage implements Storage {
    private store = new Map<string, string>();
    get length() {
        return this.store.size;
    }
    clear() {
        this.store.clear();
    }
    getItem(key: string) {
        return this.store.has(key) ? this.store.get(key)! : null;
    }
    setItem(key: string, value: string) {
        this.store.set(String(key), String(value));
    }
    removeItem(key: string) {
        this.store.delete(key);
    }
    key(index: number) {
        return Array.from(this.store.keys())[index] ?? null;
    }
}

for (const target of [globalThis, window] as const) {
    if (!('localStorage' in target) || !target.localStorage?.setItem) {
        Object.defineProperty(target, 'localStorage', {
            configurable: true,
            writable: true,
            value: new MemoryStorage(),
        });
    }
    if (!('sessionStorage' in target) || !target.sessionStorage?.setItem) {
        Object.defineProperty(target, 'sessionStorage', {
            configurable: true,
            writable: true,
            value: new MemoryStorage(),
        });
    }
}

// jsdom does not implement matchMedia; polyfill for useIsMobile / next-themes.
if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }),
    });
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});
