import { Access, Config } from '@/types/models/auth';
import { User } from '@/types/models/user';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const userAtom = atomWithStorage<User | null>('user', null);

export const configAtom = atom<Config | null>(null);

export const accessAtom = atomWithStorage<Access | null>('access', null);
