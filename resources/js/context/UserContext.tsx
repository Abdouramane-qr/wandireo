import { router, usePage } from '@inertiajs/react';
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import { localizePath } from '@/lib/locale';
import { normalizeUser } from '@/lib/api-normalizers';
import type { Auth } from '@/types/auth';
import type { AdminUser, ClientUser, PartnerUser } from '@/types/wdr-user';

type CurrentUser = ClientUser | PartnerUser | AdminUser | null;

export interface UserContextValue {
    currentUser: CurrentUser;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

type SharedPageProps = {
    auth: Auth;
    [key: string]: unknown;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const page = usePage<SharedPageProps>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUser = useMemo<CurrentUser>(() => {
        const rawUser = page.props.auth?.user;

        return rawUser ? normalizeUser(rawUser) : null;
    }, [page.props.auth?.user]);

    const login = useCallback(
        async (email: string, password: string): Promise<boolean> => {
            setIsSubmitting(true);

            const success = await new Promise<boolean>((resolve) => {
                router.post(
                    localizePath('/connexion') ?? '/connexion',
                    {
                        email,
                        password,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => resolve(true),
                        onError: () => resolve(false),
                        onFinish: () => setIsSubmitting(false),
                    },
                );
            });

            return success;
        },
        [],
    );

    const logout = useCallback(() => {
        router.post('/logout');
    }, []);

    const value = useMemo<UserContextValue>(
        () => ({
            currentUser,
            isLoading: isSubmitting,
            login,
            logout,
        }),
        [currentUser, isSubmitting, login, logout],
    );

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};

export function useUser(): UserContextValue {
    const ctx = useContext(UserContext);

    if (!ctx) {
        throw new Error('useUser doit etre utilise dans un UserProvider');
    }

    return ctx;
}
