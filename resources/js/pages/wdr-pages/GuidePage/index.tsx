import React from "react";
import { Breadcrumb, Button } from "@/components/wdr";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import "./GuidePage.css";

interface GuideStep {
    id: string;
    number: string;
    title: string;
    text: string;
}

interface GuidePanel {
    id: string;
    eyebrow: string;
    title: string;
    text: string;
    bullets: string[];
    ctaLabel: string;
    ctaRoute:
        | {
              name: "search";
              query?: string;
              category?: string;
              dateFrom?: string;
              dateTo?: string;
          }
        | { name: "dashboard" }
        | { name: "partner-dashboard" }
        | { name: "admin-dashboard" }
        | { name: "partner-register" };
}

export const GuidePage: React.FC = () => {
    const { navigate } = useRouter();
    const { t } = useTranslation();

    const steps: GuideStep[] = [
        {
            id: "discover",
            number: "01",
            title: t("guide.step.discover.title"),
            text: t("guide.step.discover.text"),
        },
        {
            id: "compare",
            number: "02",
            title: t("guide.step.compare.title"),
            text: t("guide.step.compare.text"),
        },
        {
            id: "book",
            number: "03",
            title: t("guide.step.book.title"),
            text: t("guide.step.book.text"),
        },
    ];

    const panels: GuidePanel[] = [
        {
            id: "traveler",
            eyebrow: t("guide.panel.traveler.eyebrow"),
            title: t("guide.panel.traveler.title"),
            text: t("guide.panel.traveler.text"),
            bullets: [
                t("guide.panel.traveler.bullet_1"),
                t("guide.panel.traveler.bullet_2"),
                t("guide.panel.traveler.bullet_3"),
                t("guide.panel.traveler.bullet_4"),
            ],
            ctaLabel: t("guide.panel.traveler.cta"),
            ctaRoute: { name: "search" },
        },
        {
            id: "partner",
            eyebrow: t("guide.panel.partner.eyebrow"),
            title: t("guide.panel.partner.title"),
            text: t("guide.panel.partner.text"),
            bullets: [
                t("guide.panel.partner.bullet_1"),
                t("guide.panel.partner.bullet_2"),
                t("guide.panel.partner.bullet_3"),
                t("guide.panel.partner.bullet_4"),
            ],
            ctaLabel: t("guide.panel.partner.cta"),
            ctaRoute: { name: "partner-register" },
        },
        {
            id: "admin",
            eyebrow: t("guide.panel.admin.eyebrow"),
            title: t("guide.panel.admin.title"),
            text: t("guide.panel.admin.text"),
            bullets: [
                t("guide.panel.admin.bullet_1"),
                t("guide.panel.admin.bullet_2"),
                t("guide.panel.admin.bullet_3"),
                t("guide.panel.admin.bullet_4"),
            ],
            ctaLabel: t("guide.panel.admin.cta"),
            ctaRoute: { name: "admin-dashboard" },
        },
    ];

    return (
        <div className="wdr-guide">
            <div className="wdr-guide__breadcrumb-wrapper">
                <Breadcrumb
                    items={[
                        {
                            label: t("nav.home"),
                            onClick: () => navigate({ name: "home" }),
                        },
                        { label: t("footer.help_center") },
                    ]}
                />
            </div>

            <section className="wdr-guide__hero">
                <div className="wdr-guide__hero-inner">
                    <div className="wdr-guide__hero-copy">
                        <p className="wdr-guide__eyebrow">
                            {t("guide.hero.eyebrow")}
                        </p>
                        <h1 className="wdr-guide__title">
                            {t("guide.hero.title")}
                        </h1>
                        <p className="wdr-guide__subtitle">
                            {t("guide.hero.subtitle")}
                        </p>
                        <div className="wdr-guide__hero-actions">
                            <Button
                                variant="primary"
                                onClick={() => navigate({ name: "search" })}
                            >
                                {t("guide.hero.cta_search")}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate({ name: "blog" })}
                            >
                                {t("guide.hero.cta_blog")}
                            </Button>
                        </div>
                    </div>

                    <div className="wdr-guide__hero-card">
                        <p className="wdr-guide__hero-card-label">
                            {t("guide.hero.card_label")}
                        </p>
                        <ul className="wdr-guide__hero-list">
                            <li>{t("guide.hero.card_item_1")}</li>
                            <li>{t("guide.hero.card_item_2")}</li>
                            <li>{t("guide.hero.card_item_3")}</li>
                            <li>{t("guide.hero.card_item_4")}</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="wdr-guide__section">
                <div className="wdr-guide__section-inner">
                    <div className="wdr-guide__section-head">
                        <p className="wdr-guide__section-kicker">
                            {t("guide.main.kicker")}
                        </p>
                        <h2 className="wdr-guide__section-title">
                            {t("guide.main.title")}
                        </h2>
                    </div>

                    <div className="wdr-guide__steps">
                        {steps.map((step) => (
                            <article key={step.id} className="wdr-guide__step">
                                <span className="wdr-guide__step-number">
                                    {step.number}
                                </span>
                                <h3 className="wdr-guide__step-title">
                                    {step.title}
                                </h3>
                                <p className="wdr-guide__step-text">
                                    {step.text}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="wdr-guide__section wdr-guide__section--alt">
                <div className="wdr-guide__section-inner">
                    <div className="wdr-guide__section-head">
                        <p className="wdr-guide__section-kicker">
                            {t("guide.profile.kicker")}
                        </p>
                        <h2 className="wdr-guide__section-title">
                            {t("guide.profile.title")}
                        </h2>
                    </div>

                    <div className="wdr-guide__panels">
                        {panels.map((panel) => (
                            <article
                                key={panel.id}
                                className="wdr-guide__panel"
                            >
                                <p className="wdr-guide__panel-eyebrow">
                                    {panel.eyebrow}
                                </p>
                                <h3 className="wdr-guide__panel-title">
                                    {panel.title}
                                </h3>
                                <p className="wdr-guide__panel-text">
                                    {panel.text}
                                </p>
                                <ul className="wdr-guide__panel-list">
                                    {panel.bullets.map((bullet) => (
                                        <li key={bullet}>{bullet}</li>
                                    ))}
                                </ul>
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate(panel.ctaRoute)}
                                >
                                    {panel.ctaLabel}
                                </Button>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="wdr-guide__section">
                <div className="wdr-guide__section-inner">
                    <div className="wdr-guide__section-head">
                        <p className="wdr-guide__section-kicker">
                            {t("guide.facts.kicker")}
                        </p>
                        <h2 className="wdr-guide__section-title">
                            {t("guide.facts.title")}
                        </h2>
                    </div>

                    <div className="wdr-guide__facts">
                        <article className="wdr-guide__fact">
                            <h3>{t("guide.fact.search.title")}</h3>
                            <p>{t("guide.fact.search.text")}</p>
                        </article>
                        <article className="wdr-guide__fact">
                            <h3>{t("guide.fact.theme.title")}</h3>
                            <p>{t("guide.fact.theme.text")}</p>
                        </article>
                        <article className="wdr-guide__fact">
                            <h3>{t("guide.fact.support.title")}</h3>
                            <p>{t("guide.fact.support.text")}</p>
                        </article>
                        <article className="wdr-guide__fact">
                            <h3>{t("guide.fact.services.title")}</h3>
                            <p>{t("guide.fact.services.text")}</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="wdr-guide__cta">
                <div className="wdr-guide__cta-inner">
                    <div>
                        <p className="wdr-guide__section-kicker">
                            {t("guide.cta.kicker")}
                        </p>
                        <h2 className="wdr-guide__cta-title">
                            {t("guide.cta.title")}
                        </h2>
                    </div>
                    <div className="wdr-guide__cta-actions">
                        <Button
                            variant="primary"
                            onClick={() => navigate({ name: "search" })}
                        >
                            {t("guide.cta.search")}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() =>
                                navigate({ name: "partner-register" })
                            }
                        >
                            {t("guide.cta.partner")}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default GuidePage;
