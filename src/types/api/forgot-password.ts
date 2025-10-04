export type VerifyPayload = {
    forgot_password_id: string;
    otp: string;
};

export type FinalizePayload = {
    forgot_password_id: string;
    password: string;
    password_confirmation: string;
};
