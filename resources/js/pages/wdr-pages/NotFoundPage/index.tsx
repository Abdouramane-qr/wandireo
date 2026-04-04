/**
 * @file pages/NotFoundPage/index.tsx
 * @description Page 404 — rendue pour toute route non reconnue par le router.
 */

import React from 'react';
import { Button } from '@/components/wdr';
import { useRouter } from '@/hooks/useWdrRouter';
import './NotFoundPage.css';

export const NotFoundPage: React.FC = () => {
    const { navigate } = useRouter();

    return (
        <div className="wdr-404">
            <div className="wdr-404__content">
                <span className="wdr-404__code" aria-hidden="true">
                    404
                </span>
                <h1 className="wdr-404__title">Page introuvable</h1>
                <p className="wdr-404__description">
                    La page que vous recherchez n'existe pas ou a été déplacée.
                </p>
                <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate({ name: 'home' })}
                >
                    Retour à l'accueil
                </Button>
            </div>
        </div>
    );
};

export default NotFoundPage;
