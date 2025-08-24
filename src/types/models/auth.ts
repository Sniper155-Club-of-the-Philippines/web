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
