/**
 * @file pages/TermsPage/index.tsx
 * @description Conditions générales d'utilisation de la plateforme Wandireo.
 */

import React from "react";
import { Breadcrumb } from "@/components/wdr";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import "../LegalPage/LegalPage.css";

export const TermsPage: React.FC = () => {
    const { navigate } = useRouter();
    const { t } = useTranslation();

    const bookingItems = Array.from({ length: 3 }, (_, index) =>
        t(`terms.section_5.item_${index + 1}`),
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
                        { label: t("terms.title") },
                    ]}
                />
            </div>

            <div className="wdr-legal__header">
                <div className="wdr-legal__header-inner">
                    <h1 className="wdr-legal__title">{t("terms.title")}</h1>
                    <p className="wdr-legal__updated">{t("terms.updated")}</p>
                </div>
            </div>

            <div className="wdr-legal__body">
                <div className="wdr-legal__inner">
                    <section className="wdr-legal__section">
                        <h2>{t("terms.section_1.title")}</h2>
                        <p>{t("terms.section_1.p1")}</p>
                        <p>{t("terms.section_1.p2")}</p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("terms.section_2.title")}</h2>
                        <p>{t("terms.section_2.p1")}</p>
                        <p>{t("terms.section_2.p2")}</p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("terms.section_3.title")}</h2>
                        <p>{t("terms.section_3.p1")}</p>
                        <p>{t("terms.section_3.p2")}</p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("terms.section_4.title")}</h2>
                        <p>{t("terms.section_4.p1")}</p>
                        <p>{t("terms.section_4.p2")}</p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("terms.section_5.title")}</h2>
                        <p>{t("terms.section_5.p1")}</p>
                        <ul>
                            {bookingItems.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("terms.section_6.title")}</h2>
                        <p>{t("terms.section_6.p1")}</p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("terms.section_7.title")}</h2>
                        <p>{t("terms.section_7.p1")}</p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("terms.section_8.title")}</h2>
                        <p>{t("terms.section_8.p1")}</p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("terms.section_9.title")}</h2>
                        <p>{t("terms.section_9.p1")}</p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>{t("terms.section_10.title")}</h2>
                        <p>
                            {t("terms.section_10.p1")}
                            <strong>wandireo.bookings@gmail.com</strong>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
