import { afterEach, describe, expect, it } from 'vitest';
import { createStore } from 'jotai';
import { accessAtom, configAtom, userAtom } from './auth';
import { forgotPasswordAtom } from './forgot-password';
import { formIdAtom } from './form';
import { loadingAtom } from './misc';

afterEach(() => {
    localStorage.clear();
});

describe('auth atoms', () => {
    it('default to null / unset', () => {
        const store = createStore();
        expect(store.get(userAtom)).toBeNull();
        expect(store.get(accessAtom)).toBeNull();
        expect(store.get(configAtom)).toBeNull();
    });

    it('userAtom and accessAtom persist to localStorage', () => {
        const store = createStore();
        store.set(userAtom, { id: 'u1' } as never);
        store.set(accessAtom, { type: 'Bearer', token: 't' } as never);

        expect(JSON.parse(localStorage.getItem('user')!)).toEqual({ id: 'u1' });
        expect(JSON.parse(localStorage.getItem('access')!)).toEqual({
            type: 'Bearer',
            token: 't',
        });
    });

    it('atomWithStorage hydrates from existing localStorage once mounted', () => {
        localStorage.setItem('user', JSON.stringify({ id: 'hydrated' }));
        const store = createStore();
        // atomWithStorage only reads storage when the atom is subscribed.
        store.sub(userAtom, () => {});
        expect(store.get(userAtom)).toEqual({ id: 'hydrated' });
    });

    it('configAtom holds in-memory config without persisting', () => {
        const store = createStore();
        store.set(configAtom, { title: 'S155' } as never);
        expect(store.get(configAtom)).toEqual({ title: 'S155' });
        expect(localStorage.getItem('config')).toBeNull();
    });
});

describe('misc atoms', () => {
    it('forgotPasswordAtom defaults to null and updates', () => {
        const store = createStore();
        expect(store.get(forgotPasswordAtom)).toBeNull();
        store.set(forgotPasswordAtom, {
            expires: 'soon',
            forgot_password_id: 'fp1',
            email: 'a@b.com',
        });
        expect(store.get(forgotPasswordAtom)?.forgot_password_id).toBe('fp1');
    });

    it('formIdAtom defaults to null', () => {
        const store = createStore();
        expect(store.get(formIdAtom)).toBeNull();
        store.set(formIdAtom, 'f1');
        expect(store.get(formIdAtom)).toBe('f1');
    });

    it('loadingAtom defaults to false', () => {
        const store = createStore();
        expect(store.get(loadingAtom)).toBe(false);
        store.set(loadingAtom, true);
        expect(store.get(loadingAtom)).toBe(true);
    });
});
