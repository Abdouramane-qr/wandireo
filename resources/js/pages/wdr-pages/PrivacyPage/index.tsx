/**
 * @file pages/PrivacyPage/index.tsx
 * @description Politique de confidentialité de la plateforme Wandireo.
 */

import React from "react";
import { Breadcrumb } from "@/components/wdr";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import "../LegalPage/LegalPage.css";

export const PrivacyPage: React.FC = () => {
    const { navigate } = useRouter();
    const { t } = useTranslation();

    const dataItems = Array.from({ length: 5 }, (_, index) =>
        t(`privacy.section_2.item_${index + 1}`),
    );
    const purposeItems = Array.from({ length: 7 }, (_, index) =>
        t(`privacy.section_3.item_${index + 1}`),
    );
    const legalBasisItems = Array.from({ length: 4 }, (_, index) =>
        t(`privacy.section_4.item_${index + 1}`),
    );
    const retentionItems = Array.from({ length: 4 }, (_, index) =>
        t(`privacy.section_5.item_${index + 1}`),
    );
    const sharingItems = Array.from({ length: 4 }, (_, index) =>
        t(`privacy.section_6.item_${index + 1}`),
    );
    const rightsItems = Array.from({ length: 6 }, (_, index) =>
        t(`privacy.section_7.item_${index + 1}`),
    );

    return (
        <div className="wdr-legal">
            <div className="wdr-legal__breadcrumb-wrapper">
                <Breadcrumb
                    items={[
                        {
                            label: t("nav.home"),
                            onClick: () => navigate({ name: "home" }),
                        },
                        { label: t("privacy.title") },
                    ]}
                />
            </div>

            <div className="wdr-legal__header">
                <div className="wdr-legal__header-inner">
                    <h1 className="wdr-legal__title">{t("privacy.title")}</h1>
                    <p className="wdr-legal__updated">{t("privacy.updated")}</p>
                </div>
            </div>

            <div className="wdr-legal__body">
                <div className="wdr-legal__inner">
                    <section className="wdr-legal__section">
                        <h2>{t("privacy.section_1.title")}</h2>
                        <p>{t("privacy.section_1.p1")}</p>
                        <p>
                            {t("privacy.section_1.p2")}
                            <strong>dpo@wandireo.com</strong>
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("privacy.section_2.title")}</h2>
                        <p>{t("privacy.section_2.p1")}</p>
                        <ul>
                            {dataItems.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("privacy.section_3.title")}</h2>
                        <p>{t("privacy.section_3.p1")}</p>
                        <ul>
                            {purposeItems.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("privacy.section_4.title")}</h2>
                        <p>{t("privacy.section_4.p1")}</p>
                        <ul>
                            {legalBasisItems.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("privacy.section_5.title")}</h2>
                        <p>{t("privacy.section_5.p1")}</p>
                        <ul>
                            {retentionItems.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("privacy.section_6.title")}</h2>
                        <p>{t("privacy.section_6.p1")}</p>
                        <ul>
                            {sharingItems.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                        <p>{t("privacy.section_6.p2")}</p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("privacy.section_7.title")}</h2>
                        <p>{t("privacy.section_7.p1")}</p>
                        <ul>
                            {rightsItems.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                        <p>
                            {t("privacy.section_7.p2")}
                            <strong>dpo@wandireo.com</strong>
                            {t("privacy.section_7.p3")}
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("privacy.section_8.title")}</h2>
                        <p>{t("privacy.section_8.p1")}</p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("privacy.section_9.title")}</h2>
                        <p>{t("privacy.section_9.p1")}</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
