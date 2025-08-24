import type { TokenResponse } from '@react-oauth/google';

export type GoogleLoginResponse = Omit<
    TokenResponse,
    'error' | 'error_description' | 'error_uri'
>;

export type Token = string;

export type Access = {
    type: 'Bearer';
    expiry: number;
    token: Token;
};

export type Config = {
    google: {
        clientId: string;
        redirectUri?: string;
    };
};
