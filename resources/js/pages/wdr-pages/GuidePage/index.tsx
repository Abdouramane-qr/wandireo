import React from 'react';
import { Breadcrumb, Button } from '@/components/wdr';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from '@/hooks/useWdrRouter';
import './GuidePage.css';

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
        | { name: 'search'; query?: string; category?: string; dateFrom?: string; dateTo?: string }
        | { name: 'dashboard' }
        | { name: 'partner-dashboard' }
        | { name: 'admin-dashboard' }
        | { name: 'partner-register' };
}

export const GuidePage: React.FC = () => {
    const { navigate } = useRouter();
    const { t } = useTranslation();

    const steps: GuideStep[] = [
        {
            id: 'discover',
            number: '01',
            title: 'Recherchez par verticale',
            text: 'La home et la recherche publique permettent de filtrer par destination, dates et type de service: activites, bateaux, voitures ou hebergements.',
        },
        {
            id: 'compare',
            number: '02',
            title: 'Comparez les fiches',
            text: 'Chaque service presente ses points forts, prix, extras, informations pratiques, disponibilites et avis afin de prendre une decision rapidement.',
        },
        {
            id: 'book',
            number: '03',
            title: 'Reservez sans friction',
            text: 'Le panier, le paiement et la confirmation conservent les informations utiles. Selon le service, le reglement peut se faire en ligne, partiellement en ligne ou sur place.',
        },
    ];

    const panels: GuidePanel[] = [
        {
            id: 'traveler',
            eyebrow: 'Voyageur',
            title: 'Parcours client',
            text: 'Apres inscription ou connexion, vous revenez sur la home publique connecte. Vous pouvez rechercher, ajouter des favoris, reserver puis suivre votre historique et votre profil.',
            bullets: [
                'Home publique + recherche unifiee',
                'Favoris et detail service',
                'Panier, paiement et confirmation',
                'Dashboard client, profil et reservations',
            ],
            ctaLabel: 'Explorer la recherche',
            ctaRoute: { name: 'search' },
        },
        {
            id: 'partner',
            eyebrow: 'Partenaire',
            title: 'Parcours partenaire',
            text: "Les partenaires validés accedent a leur dashboard, au catalogue, aux reservations et a leur profil. La creation de service suit la structure admin et peut maintenant etre geree proprement avec images et edition pre-remplie.",
            bullets: [
                'Validation du compte et contrat',
                'Dashboard partenaire et reservations',
                'Catalogue et formulaire service',
                'Profil partenaire et suivi commercial',
            ],
            ctaLabel: 'Devenir partenaire',
            ctaRoute: { name: 'partner-register' },
        },
        {
            id: 'admin',
            eyebrow: 'Administration',
            title: 'Pilotage global',
            text: "L'admin centralise les utilisateurs, services, structure, avis, transactions, blog et support. Les surfaces critiques ont ete reprises pour rester lisibles et coherentes en mode clair comme en mode sombre.",
            bullets: [
                'Utilisateurs et roles',
                'Catalogue services et structure',
                'Avis, transactions et support',
                'Blog, publication et moderation',
            ],
            ctaLabel: 'Aller au dashboard admin',
            ctaRoute: { name: 'admin-dashboard' },
        },
    ];

    return (
        <div className="wdr-guide">
            <div className="wdr-guide__breadcrumb-wrapper">
                <Breadcrumb
                    items={[
                        {
                            label: t('nav.home'),
                            onClick: () => navigate({ name: 'home' }),
                        },
                        { label: t('footer.help_center') },
                    ]}
                />
            </div>

            <section className="wdr-guide__hero">
                <div className="wdr-guide__hero-inner">
                    <div className="wdr-guide__hero-copy">
                        <p className="wdr-guide__eyebrow">Guide Wandireo</p>
                        <h1 className="wdr-guide__title">
                            Une page claire pour comprendre la plateforme sans
                            chercher partout
                        </h1>
                        <p className="wdr-guide__subtitle">
                            Ce guide resume les parcours principaux, les zones
                            utiles et les bons points d&apos;entree pour les
                            voyageurs, partenaires et administrateurs.
                        </p>
                        <div className="wdr-guide__hero-actions">
                            <Button
                                variant="primary"
                                onClick={() => navigate({ name: 'search' })}
                            >
                                Commencer par la recherche
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate({ name: 'blog' })}
                            >
                                Voir le blog
                            </Button>
                        </div>
                    </div>

                    <div className="wdr-guide__hero-card">
                        <p className="wdr-guide__hero-card-label">
                            Ce que vous retrouvez ici
                        </p>
                        <ul className="wdr-guide__hero-list">
                            <li>Parcours client, partenaire et admin</li>
                            <li>Fonctionnement de la recherche et de la reservation</li>
                            <li>Acces utiles selon votre role</li>
                            <li>Repere rapide pour les modules blog et support</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="wdr-guide__section">
                <div className="wdr-guide__section-inner">
                    <div className="wdr-guide__section-head">
                        <p className="wdr-guide__section-kicker">
                            Parcours principal
                        </p>
                        <h2 className="wdr-guide__section-title">
                            Comment utiliser Wandireo en 3 etapes
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
                            Par profil
                        </p>
                        <h2 className="wdr-guide__section-title">
                            Les bons acces selon votre usage
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
                            Repères utiles
                        </p>
                        <h2 className="wdr-guide__section-title">
                            Points importants a connaitre
                        </h2>
                    </div>

                    <div className="wdr-guide__facts">
                        <article className="wdr-guide__fact">
                            <h3>Recherche unique</h3>
                            <p>
                                Toutes les verticales passent par une meme
                                entree `/recherche`, avec filtres et cartes
                                adaptes au type de service.
                            </p>
                        </article>
                        <article className="wdr-guide__fact">
                            <h3>Theme public</h3>
                            <p>
                                Le site public prend en charge `light`, `dark`
                                et `system`, avec une palette alignee sur
                                l&apos;identite Wandireo.
                            </p>
                        </article>
                        <article className="wdr-guide__fact">
                            <h3>Blog et support</h3>
                            <p>
                                Le blog est public avec edition admin. Le
                                support V1 reste admin-only pour le suivi
                                interne.
                            </p>
                        </article>
                        <article className="wdr-guide__fact">
                            <h3>Services et images</h3>
                            <p>
                                Le flux d&apos;upload local et l&apos;edition de
                                service ont ete stabilises afin d&apos;afficher
                                correctement les images cote public.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="wdr-guide__cta">
                <div className="wdr-guide__cta-inner">
                    <div>
                        <p className="wdr-guide__section-kicker">
                            Besoin d&apos;aller plus vite
                        </p>
                        <h2 className="wdr-guide__cta-title">
                            Choisissez votre point d&apos;entree
                        </h2>
                    </div>
                    <div className="wdr-guide__cta-actions">
                        <Button
                            variant="primary"
                            onClick={() => navigate({ name: 'search' })}
                        >
                            Ouvrir la recherche
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate({ name: 'partner-register' })}
                        >
                            Ouvrir l&apos;espace partenaire
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default GuidePage;
