/**
 * @file pages/NotFoundPage/index.tsx
 * @description Page 404 — rendue pour toute route non reconnue par le router.
 */

import React from "react";
import { Button } from "@/components/wdr";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import "./NotFoundPage.css";

export const NotFoundPage: React.FC = () => {
    const { t } = useTranslation();
    const { navigate } = useRouter();

    return (
        <div className="wdr-404">
            <div className="wdr-404__content">
                <span className="wdr-404__code" aria-hidden="true">
                    404
                </span>
                <h1 className="wdr-404__title">{t("not_found.title")}</h1>
                <p className="wdr-404__description">
                    {t("not_found.description")}
                </p>
                <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate({ name: "home" })}
                >
                    {t("not_found.cta")}
                </Button>
            </div>
        </div>
    );
};

export default NotFoundPage;
