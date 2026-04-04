/**
 * @file pages/LegalPage/index.tsx
 * @description Mentions Legales de la plateforme Wandireo.
 */

import React from 'react';
import { Breadcrumb } from '@/components/wdr';
import { useRouter } from '@/hooks/useWdrRouter';
import './LegalPage.css';

export const LegalPage: React.FC = () => {
    const { navigate } = useRouter();

    return (
        <div className="wdr-legal">
            <div className="wdr-legal__breadcrumb-wrapper">
                <Breadcrumb
                    items={[
                        {
                            label: 'Accueil',
                            onClick: () => navigate({ name: 'home' }),
                        },
                        { label: 'Mentions legales' },
                    ]}
                />
            </div>

            <div className="wdr-legal__header">
                <div className="wdr-legal__header-inner">
                    <h1 className="wdr-legal__title">Mentions Legales</h1>
                    <p className="wdr-legal__updated">
                        Derniere mise a jour : 1er janvier 2026
                    </p>
                </div>
            </div>

            <div className="wdr-legal__body">
                <div className="wdr-legal__inner">
                    <section className="wdr-legal__section">
                        <h2>1. Editeur du site</h2>
                        <dl className="wdr-legal__dl">
                            <div className="wdr-legal__dl-row">
                                <dt>Raison sociale</dt>
                                <dd>Wandireo SAS</dd>
                            </div>
                            <div className="wdr-legal__dl-row">
                                <dt>Forme juridique</dt>
                                <dd>Societe par Actions Simplifiee (SAS)</dd>
                            </div>
                            <div className="wdr-legal__dl-row">
                                <dt>Capital social</dt>
                                <dd>10 000 €</dd>
                            </div>
                            <div className="wdr-legal__dl-row">
                                <dt>Siege social</dt>
                                <dd>
                                    12 Rue de l'Innovation, 75001 Paris, France
                                </dd>
                            </div>
                            <div className="wdr-legal__dl-row">
                                <dt>RCS</dt>
                                <dd>Paris — 123 456 789</dd>
                            </div>
                            <div className="wdr-legal__dl-row">
                                <dt>N° TVA intracommunautaire</dt>
                                <dd>FR12 123456789</dd>
                            </div>
                            <div className="wdr-legal__dl-row">
                                <dt>Directeur de publication</dt>
                                <dd>Wandireo Admin</dd>
                            </div>
                            <div className="wdr-legal__dl-row">
                                <dt>Contact</dt>
                                <dd>wandireo.bookings@gmail.com</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>2. Hebergement</h2>
                        <dl className="wdr-legal__dl">
                            <div className="wdr-legal__dl-row">
                                <dt>Hebergeur</dt>
                                <dd>Amazon Web Services EMEA SARL</dd>
                            </div>
                            <div className="wdr-legal__dl-row">
                                <dt>Adresse</dt>
                                <dd>
                                    38 Avenue John F. Kennedy, L-1855 Luxembourg
                                </dd>
                            </div>
                            <div className="wdr-legal__dl-row">
                                <dt>Region</dt>
                                <dd>eu-west-3 (Paris)</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>3. Propriete intellectuelle</h2>
                        <p>
                            L'ensemble des elements composant le site Wandireo
                            (marque, logo, textes, images, graphismes, code
                            source, structure) sont proteges par les lois
                            francaises et internationales relatives a la
                            propriete intellectuelle et sont la propriete
                            exclusive de Wandireo SAS, sauf mention contraire.
                        </p>
                        <p>
                            Toute reproduction, representation, modification,
                            publication, transmission ou denaturation, totale ou
                            partielle, du site ou de son contenu, par quelque
                            procede que ce soit et sur quelque support que ce
                            soit, est interdite sans l'autorisation ecrite
                            prealable de Wandireo SAS.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>4. Limitation de responsabilite</h2>
                        <p>
                            Wandireo SAS s'efforce d'assurer l'exactitude et la
                            mise a jour des informations diffusees sur ce site.
                            Toutefois, la societe ne peut garantir
                            l'exhaustivite ni l'exactitude de ces informations,
                            et decline toute responsabilite pour toute
                            inexactitude, erreur ou omission.
                        </p>
                        <p>
                            Wandireo SAS ne saurait etre tenue responsable des
                            dommages directs ou indirects resultant de
                            l'utilisation du site ou de l'impossibilite d'y
                            acceder.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>5. Liens hypertextes</h2>
                        <p>
                            Le site Wandireo peut contenir des liens vers des
                            sites tiers. Ces liens sont fournis uniquement pour
                            la commodite des utilisateurs. Wandireo SAS n'exerce
                            aucun controle sur ces sites et decline toute
                            responsabilite quant a leur contenu.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>6. Droit applicable</h2>
                        <p>
                            Le present site est regi par le droit francais. En
                            cas de litige relatif a l'interpretation ou
                            l'execution des presentes mentions legales,
                            competence exclusive est attribuee aux tribunaux de
                            Paris.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>7. Mediateur de la consommation</h2>
                        <p>
                            Conformement a l'article L.616-1 du Code de la
                            consommation, Wandireo SAS propose un dispositif de
                            mediation de la consommation. Le mediateur designe
                            est :
                            <strong>
                                {' '}
                                CMAP (Centre de Mediation et d'Arbitrage de
                                Paris)
                            </strong>
                            , 39 avenue Franklin D. Roosevelt, 75008 Paris —
                            <strong> www.cmap.fr</strong>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;
