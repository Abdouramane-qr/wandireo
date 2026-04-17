import { Link as InertiaLink } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { localizePath } from '@/lib/locale';
import './Footer.css';

interface FooterLinkItem {
    label: string;
    href: string;
}

interface FooterSection {
    title: string;
    links: FooterLinkItem[];
}

interface SocialLink {
    id: 'whatsapp' | 'instagram' | 'tiktok';
    labelKey: string;
    href: string;
    icon: React.ReactNode;
}

const SOCIAL_LINKS: SocialLink[] = [
    {
        id: 'whatsapp',
        labelKey: 'footer.social.whatsapp',
        href: 'https://wa.me/351928282231',
        icon: (
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
            >
                <path d="M16.04 13.72c-.21-.11-1.24-.61-1.44-.67-.19-.07-.33-.1-.48.1-.14.21-.54.67-.66.81-.12.14-.24.15-.45.05-.21-.11-.88-.33-1.67-1.05-.61-.55-1.03-1.24-1.15-1.45-.12-.21-.02-.33.09-.43.09-.09.21-.24.32-.36.11-.12.14-.21.21-.35.07-.14.04-.26-.02-.36-.05-.11-.47-1.15-.65-1.58-.17-.41-.35-.35-.48-.36h-.4c-.14 0-.36.05-.56.26-.19.21-.74.72-.74 1.76 0 1.04.76 2.05.86 2.18.11.14 1.49 2.27 3.59 3.18.5.22.9.34 1.21.43.51.16.99.14 1.36.08.41-.06 1.24-.5 1.42-.99.17-.48.17-.89.12-.98-.05-.09-.19-.14-.39-.25Z" />
                <path d="M21 12a9 9 0 0 1-13.36 7.87L3 21l1.21-4.51A9 9 0 1 1 21 12Zm-9-7.16A7.16 7.16 0 0 0 5.87 15.5l.18.28-.75 2.8 2.86-.75.26.15A7.16 7.16 0 1 0 12 4.84Z" />
            </svg>
        ),
    },
    {
        id: 'instagram',
        labelKey: 'footer.social.instagram',
        href: 'https://www.instagram.com/experiences.algarve?igsh=aWVndGNpanA4cGVh&utm_source=qr',
        icon: (
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
        ),
    },
    {
        id: 'tiktok',
        labelKey: 'footer.social.tiktok',
        href: 'https://www.tiktok.com/@experiences.algarve?_r=1&_t=ZN-94paV1xX9B0',
        icon: (
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
            >
                <path d="M14.5 3c.4 1.9 1.5 3.1 3.5 3.5v2.6c-1.2 0-2.4-.3-3.5-.9v5.4a5.6 5.6 0 1 1-5.6-5.6c.3 0 .7 0 1 .1v2.8a2.9 2.9 0 1 0 1.8 2.7V3h2.8z" />
            </svg>
        ),
    },
];

const FooterLogo: React.FC<{ ariaLabel: string }> = ({ ariaLabel }) => (
    <InertiaLink
        href={localizePath('/') ?? '/'}
        className="wdr-footer__logo"
        aria-label={ariaLabel}
    >
        <img
            src="/wandireo.png"
            alt=""
            className="wdr-footer__logo-image"
            aria-hidden="true"
        />
    </InertiaLink>
);

function FooterLink({ link }: { link: FooterLinkItem }) {
    if (link.href.startsWith('https://') || link.href.startsWith('mailto:')) {
        return (
            <a
                href={link.href}
                className="wdr-footer__link"
                target="_blank"
                rel="noopener noreferrer"
            >
                {link.label}
            </a>
        );
    }

    return (
        <InertiaLink href={localizePath(link.href) ?? link.href} className="wdr-footer__link">
            {link.label}
        </InertiaLink>
    );
}

export const Footer: React.FC = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    const sections: FooterSection[] = [
        {
            title: t('footer.explore'),
            links: [
                { label: t('footer.all_destinations'), href: '/recherche' },
                { label: t('search.activities'), href: '/recherche?category=ACTIVITE' },
                { label: t('footer.boats'), href: '/recherche?category=BATEAU' },
                {
                    label: t('search.accommodations'),
                    href: '/recherche?category=HEBERGEMENT',
                },
                { label: t('footer.cars'), href: '/recherche?category=VOITURE' },
                { label: t('footer.blog'), href: '/blog' },
            ],
        },
        {
            title: t('footer.services'),
            links: [
                { label: t('footer.how_it_works'), href: '/#faq' },
                { label: t('nav.become_partner'), href: '/partenaire/inscription' },
                { label: t('nav.login'), href: '/connexion' },
                { label: t('nav.register'), href: '/inscription' },
            ],
        },
        {
            title: t('footer.help'),
            links: [
                { label: t('footer.help_center'), href: '/guide' },
                { label: t('footer.whatsapp'), href: 'https://wa.me/351928282231' },
                { label: t('footer.faq'), href: '/#faq' },
                {
                    label: t('footer.booking_email'),
                    href: 'mailto:wandireo.bookings@gmail.com',
                },
            ],
        },
        {
            title: t('footer.legal'),
            links: [
                { label: t('footer.terms'), href: '/conditions-utilisation' },
                {
                    label: t('footer.privacy'),
                    href: '/politique-de-confidentialite',
                },
                { label: t('footer.legal_notice'), href: '/mentions-legales' },
            ],
        },
    ];

    return (
        <footer className="wdr-footer" role="contentinfo">
            <div className="wdr-footer__inner">
                <div className="wdr-footer__top">
                    <div className="wdr-footer__brand">
                        <FooterLogo ariaLabel={t('footer.logo_aria')} />
                        <p className="wdr-footer__tagline">{t('footer.tagline')}</p>
                        <nav
                            className="wdr-footer__socials"
                            aria-label={t('footer.socials')}
                        >
                            {SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.href}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="wdr-footer__social-link"
                                    data-social={social.id}
                                    aria-label={t(social.labelKey)}
                                    title={t(social.labelKey)}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </nav>
                    </div>

                    {sections.map((section) => (
                        <nav
                            key={section.title}
                            className="wdr-footer__col"
                            aria-label={section.title}
                        >
                            <h3 className="wdr-footer__col-title">
                                {section.title}
                            </h3>
                            <ul className="wdr-footer__links">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <FooterLink link={link} />
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <hr className="wdr-footer__divider" />

                <div className="wdr-footer__bottom">
                    <p className="wdr-footer__copyright">
                        {currentYear} {t('footer.copyright')}
                    </p>
                    <nav
                        className="wdr-footer__legal-links"
                        aria-label={t('footer.legal')}
                    >
                        <InertiaLink
                            href={localizePath('/conditions-utilisation') ?? '/conditions-utilisation'}
                            className="wdr-footer__link"
                        >
                            {t('footer.terms')}
                        </InertiaLink>
                        <InertiaLink
                            href={localizePath('/politique-de-confidentialite') ?? '/politique-de-confidentialite'}
                            className="wdr-footer__link"
                        >
                            {t('footer.privacy')}
                        </InertiaLink>
                        <InertiaLink
                            href={localizePath('/mentions-legales') ?? '/mentions-legales'}
                            className="wdr-footer__link"
                        >
                            {t('footer.legal_notice')}
                        </InertiaLink>
                    </nav>
                </div>
            </div>
        </footer>
    );
};
