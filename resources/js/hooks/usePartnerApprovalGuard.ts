import { useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from '@/hooks/useWdrRouter';

export function usePartnerApprovalGuard(enabled = true): {
    isBlocked: boolean;
} {
    const { currentUser } = useUser();
    const { navigate } = useRouter();

    useEffect(() => {
        if (!enabled) {
            return;
        }

        if (!currentUser) {
            navigate({ name: 'home' });

            return;
        }

        if (currentUser.role !== 'PARTNER') {
            navigate({ name: 'dashboard' });

            return;
        }

        if (currentUser.partnerStatus !== 'APPROVED') {
            navigate({ name: 'partner-pending' });
        }
    }, [currentUser, enabled, navigate]);

    return {
        isBlocked: enabled
            ? !currentUser ||
              currentUser.role !== 'PARTNER' ||
              currentUser.partnerStatus !== 'APPROVED'
            : false,
    };
}
