/**
 * @file components/ProtectedRoute.tsx
 * @description Garde de route : redirige vers /connexion si l'utilisateur
 * n'est pas authentifié.
 *
 * Attend la fin de la restauration de session (isLoading) avant de rediriger,
 * évitant un flash de redirection au rechargement de page avec un JWT valide.
 */

import React, { useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from '@/hooks/useWdrRouter';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { currentUser, isLoading } = useUser();
    const { t } = useTranslation();
    const { navigate } = useRouter();

    useEffect(() => {
        if (!isLoading && !currentUser) {
            navigate({ name: 'login' });
        }
    }, [currentUser, isLoading, navigate]);

    if (isLoading) {
return (
            <div
                className="wdr-protected-loading"
                aria-label={t('common.loading_aria')}
            />
        );
}

    if (!currentUser) {
return null;
}

    return <>{children}</>;
};
