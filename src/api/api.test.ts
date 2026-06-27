import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import * as auth from './auth';
import * as chapter from './chapter';
import * as event from './event';
import * as forgotPassword from './forgot-password';
import * as form from './form';
import * as profile from './profile';
import * as role from './role';
import * as setting from './setting';
import * as user from './user';

type Http = AxiosInstance & {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
};

function makeHttp(): Http {
    return {
        get: vi.fn().mockResolvedValue({ data: {} }),
        post: vi.fn().mockResolvedValue({ data: {} }),
        put: vi.fn().mockResolvedValue({ data: {} }),
        delete: vi.fn().mockResolvedValue({ data: {} }),
    } as unknown as Http;
}

let http: Http;
beforeEach(() => {
    http = makeHttp();
});

describe('auth api', () => {
    it('login posts credentials and returns user + access', async () => {
        http.post.mockResolvedValue({
            data: { user: { id: '1' }, access: { token: 't' } },
        });
        const data = await auth.login(http, 'a@b.com', 'secret');
        expect(http.post).toHaveBeenCalledWith('/v1/auth/login', {
            email: 'a@b.com',
            password: 'secret',
        });
        expect(data.user.id).toBe('1');
    });

    it('logout hits the logout endpoint', async () => {
        await auth.logout(http);
        expect(http.get).toHaveBeenCalledWith('/v1/auth/logout');
    });

    it('changePassword posts the payload and returns the user', async () => {
        http.post.mockResolvedValue({
            data: { user: { id: '1', force_password_change: false } },
        });
        const payload = {
            current_password: 'old',
            password: 'new',
            password_confirmation: 'new',
        };
        const data = await auth.changePassword(http, payload);
        expect(http.post).toHaveBeenCalledWith('/v1/profile/password', payload);
        expect(data.user.force_password_change).toBe(false);
    });

    it('designations maps to label/value options', async () => {
        http.get.mockResolvedValue({
            data: { designations: { a: 'Alpha', b: 'Bravo' } },
        });
        const opts = await auth.designations(http);
        expect(http.get).toHaveBeenCalledWith('/v1/auth/designations');
        expect(opts).toEqual([
            { label: 'Alpha', value: 'Alpha' },
            { label: 'Bravo', value: 'Bravo' },
        ]);
    });

    it('regions maps to label/value options', async () => {
        http.get.mockResolvedValue({
            data: { regions: { NCR: 'NCR', VIS: 'Visayas' } },
        });
        const opts = await auth.regions(http);
        expect(http.get).toHaveBeenCalledWith('/v1/auth/regions');
        expect(opts).toEqual([
            { label: 'NCR', value: 'NCR' },
            { label: 'Visayas', value: 'Visayas' },
        ]);
    });
});

describe('role api', () => {
    it('all returns the roles array', async () => {
        http.get.mockResolvedValue({
            data: { roles: [{ id: 'r1', name: 'member' }] },
        });
        expect(await role.all(http)).toEqual([{ id: 'r1', name: 'member' }]);
        expect(http.get).toHaveBeenCalledWith('/v1/roles');
    });
});

describe('chapter api', () => {
    it('all returns the chapters array', async () => {
        http.get.mockResolvedValue({ data: { chapters: [{ id: 'c1' }] } });
        expect(await chapter.all(http)).toEqual([{ id: 'c1' }]);
        expect(http.get).toHaveBeenCalledWith('/v1/chapters');
    });

    it('store posts multipart form data', async () => {
        await chapter.store(http, { name: 'Cebu' });
        const [url, body] = http.post.mock.calls[0];
        expect(url).toBe('/v1/chapters');
        expect(body).toBeInstanceOf(FormData);
        expect((body as FormData).get('name')).toBe('Cebu');
    });

    it('update spoofs PUT via _method', async () => {
        await chapter.update(http, { id: 'c1', name: 'New' });
        const [url, body] = http.post.mock.calls[0];
        expect(url).toBe('/v1/chapters/c1');
        expect((body as FormData).get('_method')).toBe('PUT');
    });

    it('remove deletes by id', async () => {
        await chapter.remove(http, 'c1');
        expect(http.delete).toHaveBeenCalledWith('/v1/chapters/c1');
    });

    it('pdf requests a blob', async () => {
        http.get.mockResolvedValue({ data: new Blob(['x']) });
        await chapter.pdf(http);
        expect(http.get).toHaveBeenCalledWith(
            '/v1/chapters/pdf',
            expect.objectContaining({ responseType: 'blob' }),
        );
    });
});

describe('event api', () => {
    it('all / show return events', async () => {
        http.get.mockResolvedValueOnce({ data: { events: [{ id: 'e1' }] } });
        expect(await event.all(http)).toEqual([{ id: 'e1' }]);

        http.get.mockResolvedValueOnce({ data: { event: { id: 'e2' } } });
        expect(await event.show(http, 'e2')).toEqual({ id: 'e2' });
        expect(http.get).toHaveBeenLastCalledWith('/v1/events/e2');
    });

    it('store posts json', async () => {
        await event.store(http, { title: 'Ride' });
        expect(http.post).toHaveBeenCalledWith('/v1/events', { title: 'Ride' });
    });

    it('update puts json by id', async () => {
        await event.update(http, { id: 'e1', title: 'X' });
        expect(http.put).toHaveBeenCalledWith('/v1/events/e1', {
            id: 'e1',
            title: 'X',
        });
    });

    it('remove deletes by id', async () => {
        await event.remove(http, 'e1');
        expect(http.delete).toHaveBeenCalledWith('/v1/events/e1');
    });
});

describe('form api', () => {
    it('all passes params and returns forms', async () => {
        http.get.mockResolvedValue({ data: { forms: [{ id: 'f1' }] } });
        expect(await form.all(http, { active: true })).toEqual([{ id: 'f1' }]);
        expect(http.get).toHaveBeenCalledWith('/v1/forms', {
            params: { active: true },
        });
    });

    it('show returns a single form', async () => {
        http.get.mockResolvedValue({ data: { form: { id: 'f1' } } });
        expect(await form.show(http, 'f1')).toEqual({ id: 'f1' });
    });

    it('store / update hit the right verbs', async () => {
        await form.store(http, { title: 'T' } as never);
        expect(http.post).toHaveBeenCalledWith('/v1/forms', { title: 'T' });

        await form.update(http, { id: 'f1', title: 'U' } as never);
        expect(http.put).toHaveBeenCalledWith('/v1/forms/f1', {
            id: 'f1',
            title: 'U',
        });
    });

    it('toggle puts the active flag', async () => {
        await form.toggle(http, 'f1', false);
        expect(http.put).toHaveBeenCalledWith('/v1/forms/f1/toggle', {
            active: false,
        });
    });

    it('answer posts answers', async () => {
        await form.answer(http, 'f1', { q1: 'a' });
        expect(http.post).toHaveBeenCalledWith('/v1/forms/f1/answer', {
            answers: { q1: 'a' },
        });
    });

    it('status / answers / responses read endpoints', async () => {
        http.get.mockResolvedValueOnce({ data: { response: { id: 'r1' } } });
        expect(await form.status(http, 'f1')).toEqual({ id: 'r1' });

        http.get.mockResolvedValueOnce({ data: { data: { id: 'r2' } } });
        expect(await form.answers(http, 'r2')).toEqual({ id: 'r2' });

        http.get.mockResolvedValueOnce({ data: { responses: [{ id: 'r3' }] } });
        expect(await form.responses(http, 'f1')).toEqual([{ id: 'r3' }]);
    });

    it('remove deletes by id', async () => {
        await form.remove(http, 'f1');
        expect(http.delete).toHaveBeenCalledWith('/v1/forms/f1');
    });
});

describe('profile api', () => {
    it('all / show / store / remove', async () => {
        http.get.mockResolvedValueOnce({ data: { profiles: [{ id: 'p1' }] } });
        expect(await profile.all(http)).toEqual([{ id: 'p1' }]);

        http.get.mockResolvedValueOnce({ data: { profile: { id: 'p2' } } });
        expect(await profile.show(http, 'p2')).toEqual({ id: 'p2' });

        await profile.store(http, { user_id: 'u1' } as never);
        expect(http.post).toHaveBeenCalledWith('/v1/profiles', {
            user_id: 'u1',
        });

        await profile.remove(http, 'p1');
        expect(http.delete).toHaveBeenCalledWith('/v1/profiles/p1');
    });
});

describe('setting api', () => {
    it('all passes group/key params', async () => {
        http.get.mockResolvedValue({ data: { settings: [{ id: 's1' }] } });
        expect(await setting.all(http, { group: 'general' })).toEqual([
            { id: 's1' },
        ]);
        expect(http.get).toHaveBeenCalledWith('/v1/settings', {
            params: { group: 'general' },
        });
    });

    it('store posts form data', async () => {
        await setting.store(http, {
            group: 'general',
            key: 'title',
            type: 'string',
            value: 'S155',
        } as never);
        const [url, body] = http.post.mock.calls[0];
        expect(url).toBe('/v1/settings');
        expect(body).toBeInstanceOf(FormData);
        expect((body as FormData).get('key')).toBe('title');
    });

    it('remove deletes by id', async () => {
        await setting.remove(http, 's1');
        expect(http.delete).toHaveBeenCalledWith('/v1/settings/s1');
    });
});

describe('user api', () => {
    it('all returns users', async () => {
        http.get.mockResolvedValue({ data: { users: [{ id: 'u1' }] } });
        expect(await user.all(http)).toEqual([{ id: 'u1' }]);
    });

    it('store posts multipart form data', async () => {
        await user.store(http, { first_name: 'Juan' });
        const [url, body] = http.post.mock.calls[0];
        expect(url).toBe('/v1/users');
        expect((body as FormData).get('first_name')).toBe('Juan');
    });

    it('update drops an empty password and spoofs PUT', async () => {
        await user.update(http, { id: 'u1', first_name: 'A', password: '' });
        const [url, body] = http.post.mock.calls[0];
        expect(url).toBe('/v1/users/u1');
        expect((body as FormData).get('_method')).toBe('PUT');
        expect((body as FormData).has('password')).toBe(false);
    });

    it('update keeps a real password', async () => {
        await user.update(http, { id: 'u1', password: 'secret' });
        const body = http.post.mock.calls[0][1] as FormData;
        expect(body.get('password')).toBe('secret');
    });

    it('assignRoles posts the role list to the roles endpoint', async () => {
        http.post.mockResolvedValue({ data: { user: { id: 'u1' } } });
        await user.assignRoles(http, 'u1', ['member', 'store-manager']);
        expect(http.post).toHaveBeenCalledWith('/v1/users/u1/roles', {
            roles: ['member', 'store-manager'],
        });
    });

    it('remove deletes by id', async () => {
        await user.remove(http, 'u1');
        expect(http.delete).toHaveBeenCalledWith('/v1/users/u1');
    });

    it('pdf requests a blob', async () => {
        http.get.mockResolvedValue({ data: new Blob(['x']) });
        await user.pdf(http);
        expect(http.get).toHaveBeenCalledWith(
            '/v1/users/pdf',
            expect.objectContaining({ responseType: 'blob' }),
        );
    });
});

describe('forgot-password api', () => {
    it('send returns the reset id + expiry', async () => {
        http.post.mockResolvedValue({
            data: { forgot_password_id: 'fp1', expires: 'soon' },
        });
        expect(await forgotPassword.send(http, 'a@b.com')).toEqual({
            forgot_password_id: 'fp1',
            expires: 'soon',
        });
        expect(http.post).toHaveBeenCalledWith(
            '/v1/auth/forgot-password/send',
            { email: 'a@b.com' },
        );
    });

    it('verify / finalize post their payloads', async () => {
        await forgotPassword.verify(http, {
            forgot_password_id: 'fp1',
            otp: '123456',
        } as never);
        expect(http.post).toHaveBeenCalledWith(
            '/v1/auth/forgot-password/verify',
            { forgot_password_id: 'fp1', otp: '123456' },
        );

        await forgotPassword.finalize(http, {
            forgot_password_id: 'fp1',
            password: 'x',
            password_confirmation: 'x',
        } as never);
        expect(http.post).toHaveBeenCalledWith(
            '/v1/auth/forgot-password/finalize',
            expect.objectContaining({ forgot_password_id: 'fp1' }),
        );
    });
});
