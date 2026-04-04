/**
 * @file pages/TermsPage/index.tsx
 * @description Conditions Generales d'Utilisation de la plateforme Wandireo.
 */

import React from 'react';
import { Breadcrumb } from '@/components/wdr';
import { useRouter } from '@/hooks/useWdrRouter';
import '../LegalPage/LegalPage.css';

export const TermsPage: React.FC = () => {
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
                        { label: "Conditions d'utilisation" },
                    ]}
                />
            </div>

            <div className="wdr-legal__header">
                <div className="wdr-legal__header-inner">
                    <h1 className="wdr-legal__title">
                        Conditions Generales d'Utilisation
                    </h1>
                    <p className="wdr-legal__updated">
                        Derniere mise a jour : 1er janvier 2026
                    </p>
                </div>
            </div>

            <div className="wdr-legal__body">
                <div className="wdr-legal__inner">
                    <section className="wdr-legal__section">
                        <h2>1. Objet</h2>
                        <p>
                            Les presentes Conditions Generales d'Utilisation
                            (CGU) regissent l'acces et l'utilisation de la
                            plateforme Wandireo, accessible a l'adresse
                            wandireo.com, editee par la societe Wandireo SAS,
                            societe par actions simplifiee au capital de 10 000
                            €, immatriculee au RCS de Paris sous le numero 123
                            456 789.
                        </p>
                        <p>
                            Toute utilisation de la plateforme implique
                            l'acceptation pleine et entiere des presentes CGU.
                            Si vous n'acceptez pas ces conditions, veuillez
                            cesser immediatement d'utiliser la plateforme.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>2. Description du service</h2>
                        <p>
                            Wandireo est une marketplace de services
                            touristiques permettant a des prestataires
                            (partenaires) de proposer leurs offres d'activites,
                            de location de bateaux, d'hebergements et de
                            voitures a des clients voyageurs.
                        </p>
                        <p>
                            Wandireo agit en qualite d'intermediaire entre les
                            clients et les partenaires prestataires.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>3. Acces a la plateforme</h2>
                        <p>
                            L'acces a la plateforme est ouvert a toute personne
                            physique majeure ou personne morale disposant d'une
                            adresse email valide et d'un acces a internet.
                        </p>
                        <p>
                            Wandireo se reserve le droit de suspendre ou
                            supprimer tout compte en cas de violation des
                            presentes CGU, sans preavis ni indemnite.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>4. Creation de compte</h2>
                        <p>
                            Pour acceder a l'ensemble des fonctionnalites de la
                            plateforme, l'utilisateur doit creer un compte en
                            fournissant des informations exactes et a jour.
                            L'utilisateur est responsable de la confidentialite
                            de ses identifiants de connexion.
                        </p>
                        <p>
                            Toute connexion effectuee avec les identifiants d'un
                            utilisateur est presumee effectuee par cet
                            utilisateur.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>5. Conditions de reservation</h2>
                        <p>
                            La reservation d'un service est ferme et definitive
                            des lors que le client a valide son panier et
                            procede au paiement conformement au mode de paiement
                            defini par le prestataire. Trois modes sont
                            disponibles :
                        </p>
                        <ul>
                            <li>
                                <strong>Paiement integral en ligne</strong> : le
                                montant total est preleve au moment de la
                                reservation.
                            </li>
                            <li>
                                <strong>
                                    Commission en ligne, solde sur place
                                </strong>{' '}
                                : seuls les frais de service Wandireo sont
                                preleves en ligne.
                            </li>
                            <li>
                                <strong>Paiement integral sur place</strong> :
                                aucun montant n'est preleve en ligne.
                            </li>
                        </ul>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>6. Commissions et tarification</h2>
                        <p>
                            Wandireo preleve une commission sur chaque
                            transaction realisee via la plateforme. Le taux de
                            commission est defini contractuellement avec chaque
                            partenaire. Le prix affiche au client inclut
                            toujours la commission Wandireo.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>7. Responsabilites</h2>
                        <p>
                            Wandireo agit en qualite d'intermediaire et ne peut
                            etre tenu responsable de la qualite, de la securite
                            ou de la conformite des services proposes par les
                            partenaires. Chaque partenaire est seul responsable
                            du contenu de ses offres et de l'execution de ses
                            prestations.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>8. Propriete intellectuelle</h2>
                        <p>
                            L'ensemble des elements de la plateforme (marque,
                            logos, textes, images, interface) sont la propriete
                            exclusive de Wandireo SAS et sont proteges par le
                            droit de la propriete intellectuelle. Toute
                            reproduction est interdite sans autorisation ecrite
                            prealable.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>9. Droit applicable et juridiction</h2>
                        <p>
                            Les presentes CGU sont soumises au droit francais.
                            En cas de litige, les parties s'efforceront de
                            trouver une solution amiable. A defaut, les
                            tribunaux competents de Paris seront seuls
                            competents.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>10. Contact</h2>
                        <p>
                            Pour toute question relative aux presentes CGU, vous
                            pouvez nous contacter a l'adresse suivante :{' '}
                            <strong>wandireo.bookings@gmail.com</strong>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
