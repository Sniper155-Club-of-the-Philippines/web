import { atom } from 'jotai';

type ForgotPasswordAtom = {
    expires: string;
    forgot_password_id: string;
    email: string;
};

export const forgotPasswordAtom = atom<ForgotPasswordAtom | null>(null);
