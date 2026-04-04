/**
 * @file components/RoleGuard.tsx
 * @description Garde de rôle : redirige vers l'accueil si le rôle de
 * l'utilisateur courant ne correspond pas au rôle requis.
 * Doit être utilisé à l'intérieur d'un ProtectedRoute.
 */

import React, { useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from '@/hooks/useWdrRouter';
import type { UserRole } from '@/types/wdr-user';

interface RoleGuardProps {
    role: UserRole;
    children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ role, children }) => {
    const { currentUser } = useUser();
    const { navigate } = useRouter();

    useEffect(() => {
        if (currentUser && currentUser.role !== role) {
            navigate({ name: 'home' });
        }
    }, [currentUser, role, navigate]);

    if (!currentUser || currentUser.role !== role) {
return null;
}

    return <>{children}</>;
};
