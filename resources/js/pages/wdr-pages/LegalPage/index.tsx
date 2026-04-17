/**
 * @file pages/LegalPage/index.tsx
 * @description Mentions légales de la plateforme Wandireo.
 */

import React from "react";
import { Breadcrumb } from "@/components/wdr";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import "./LegalPage.css";

export const LegalPage: React.FC = () => {
    const { navigate } = useRouter();
    const { t } = useTranslation();

    const editorFields = Array.from({ length: 8 }, (_, index) => ({
        label: t(`legal.section_1.field_${index + 1}.label`),
        value: t(`legal.section_1.field_${index + 1}.value`),
    }));

    const hostingFields = Array.from({ length: 3 }, (_, index) => ({
        label: t(`legal.section_2.field_${index + 1}.label`),
        value: t(`legal.section_2.field_${index + 1}.value`),
    }));

    return (
        <div className="wdr-legal">
            <div className="wdr-legal__breadcrumb-wrapper">
                <Breadcrumb
                    items={[
                        {
                            label: t("nav.home"),
                            onClick: () => navigate({ name: "home" }),
                        },
                        { label: t("legal.title") },
                    ]}
                />
            </div>

            <div className="wdr-legal__header">
                <div className="wdr-legal__header-inner">
                    <h1 className="wdr-legal__title">{t("legal.title")}</h1>
                    <p className="wdr-legal__updated">{t("legal.updated")}</p>
                </div>
            </div>

            <div className="wdr-legal__body">
                <div className="wdr-legal__inner">
                    <section className="wdr-legal__section">
                        <h2>{t("legal.section_1.title")}</h2>
                        <dl className="wdr-legal__dl">
                            {editorFields.map((field) => (
                                <div
                                    key={field.label}
                                    className="wdr-legal__dl-row"
                                >
                                    <dt>{field.label}</dt>
                                    <dd>{field.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("legal.section_2.title")}</h2>
                        <dl className="wdr-legal__dl">
                            {hostingFields.map((field) => (
                                <div
                                    key={field.label}
                                    className="wdr-legal__dl-row"
                                >
                                    <dt>{field.label}</dt>
                                    <dd>{field.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("legal.section_3.title")}</h2>
                        <p>{t("legal.section_3.p1")}</p>
                        <p>{t("legal.section_3.p2")}</p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("legal.section_4.title")}</h2>
                        <p>{t("legal.section_4.p1")}</p>
                        <p>{t("legal.section_4.p2")}</p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("legal.section_5.title")}</h2>
                        <p>{t("legal.section_5.p1")}</p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("legal.section_6.title")}</h2>
                        <p>{t("legal.section_6.p1")}</p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("legal.section_7.title")}</h2>
                        <p>
                            {t("legal.section_7.p1")}
                            <strong> {t("legal.section_7.mediator")}</strong>
                            {t("legal.section_7.address")}
                            <strong>{t("legal.section_7.website")}</strong>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;
