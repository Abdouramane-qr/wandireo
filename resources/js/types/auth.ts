import type { User as WdrUser } from '@/types/wdr-user';

export type User = WdrUser & {
    name?: string;
    avatar?: string;
    email_verified_at?: string | null;
    two_factor_enabled?: boolean;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
