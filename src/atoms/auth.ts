import { Access } from '@/types/auth';
import { User } from '@/types/user';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const userAtom = atomWithStorage<User | null>('user', null);

export const accessAtom = atomWithStorage<Access | null>('access', null);

export const tokenInterceptorAtom = atom<(() => void) | null>(null);
