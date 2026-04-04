/**
 * @file pages/PrivacyPage/index.tsx
 * @description Politique de Confidentialite de la plateforme Wandireo.
 */

import React from 'react';
import { Breadcrumb } from '@/components/wdr';
import { useRouter } from '@/hooks/useWdrRouter';
import '../LegalPage/LegalPage.css';

export const PrivacyPage: React.FC = () => {
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
                        { label: 'Politique de confidentialite' },
                    ]}
                />
            </div>

            <div className="wdr-legal__header">
                <div className="wdr-legal__header-inner">
                    <h1 className="wdr-legal__title">
                        Politique de Confidentialite
                    </h1>
                    <p className="wdr-legal__updated">
                        Derniere mise a jour : 1er janvier 2026
                    </p>
                </div>
            </div>

            <div className="wdr-legal__body">
                <div className="wdr-legal__inner">
                    <section className="wdr-legal__section">
                        <h2>1. Responsable du traitement</h2>
                        <p>
                            Le responsable du traitement de vos donnees
                            personnelles est la societe
                            <strong> Wandireo SAS</strong>, societe par actions
                            simplifiee, dont le siege social est situe au 12 Rue
                            de l'Innovation, 75001 Paris, France.
                        </p>
                        <p>
                            Contact DPO : <strong>dpo@wandireo.com</strong>
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>2. Donnees collectees</h2>
                        <p>
                            Dans le cadre de l'utilisation de la plateforme
                            Wandireo, nous collectons les donnees suivantes :
                        </p>
                        <ul>
                            <li>
                                <strong>Donnees d'identification</strong> : nom,
                                prenom, adresse email, numero de telephone.
                            </li>
                            <li>
                                <strong>Donnees de connexion</strong> : adresse
                                IP, identifiants de session, logs d'acces.
                            </li>
                            <li>
                                <strong>Donnees de paiement</strong> :
                                informations de carte bancaire traitees de
                                maniere securisee via Stripe (nous ne stockons
                                pas les numeros de carte complets).
                            </li>
                            <li>
                                <strong>Donnees de navigation</strong> : pages
                                consultees, duree des sessions, type d'appareil.
                            </li>
                            <li>
                                <strong>Donnees transactionnelles</strong> :
                                historique des reservations, avis deposes,
                                favoris.
                            </li>
                        </ul>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>3. Finalites du traitement</h2>
                        <p>
                            Vos donnees sont traitees pour les finalites
                            suivantes :
                        </p>
                        <ul>
                            <li>
                                Gestion de votre compte utilisateur et
                                authentification.
                            </li>
                            <li>Traitement et suivi de vos reservations.</li>
                            <li>Traitement des paiements en ligne.</li>
                            <li>
                                Envoi de confirmations et de communications
                                transactionnelles.
                            </li>
                            <li>
                                Amelioration de nos services et personnalisation
                                de votre experience.
                            </li>
                            <li>
                                Respect de nos obligations legales et
                                reglementaires.
                            </li>
                            <li>
                                Prevention des fraudes et securisation des
                                transactions.
                            </li>
                        </ul>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>4. Base legale du traitement</h2>
                        <p>Les traitements sont fondes sur :</p>
                        <ul>
                            <li>
                                <strong>L'execution du contrat</strong> :
                                gestion des reservations, paiements.
                            </li>
                            <li>
                                <strong>L'obligation legale</strong> :
                                conservation des factures, conformite fiscale.
                            </li>
                            <li>
                                <strong>L'interet legitime</strong> : prevention
                                des fraudes, amelioration du service.
                            </li>
                            <li>
                                <strong>Votre consentement</strong> :
                                communications marketing (revocable a tout
                                moment).
                            </li>
                        </ul>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>5. Duree de conservation</h2>
                        <p>
                            Vos donnees sont conservees pendant la duree
                            necessaire a la realisation des finalites pour
                            lesquelles elles ont ete collectees :
                        </p>
                        <ul>
                            <li>
                                Donnees de compte actif : duree de la relation
                                contractuelle.
                            </li>
                            <li>
                                Donnees de paiement : 5 ans a des fins de
                                conformite fiscale et comptable.
                            </li>
                            <li>Logs de connexion : 12 mois.</li>
                            <li>
                                Apres fermeture du compte : archivage pendant 3
                                ans pour les besoins probatoires.
                            </li>
                        </ul>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>6. Partage des donnees</h2>
                        <p>Vos donnees peuvent etre partagees avec :</p>
                        <ul>
                            <li>
                                <strong>Les partenaires prestataires</strong> :
                                pour l'execution de votre reservation.
                            </li>
                            <li>
                                <strong>Stripe</strong> : pour le traitement
                                securise des paiements.
                            </li>
                            <li>
                                <strong>Nos sous-traitants techniques</strong> :
                                hebergement, emailing, analytics (lies par des
                                clauses de confidentialite strictes).
                            </li>
                            <li>
                                <strong>Les autorites competentes</strong> : si
                                requis par la loi.
                            </li>
                        </ul>
                        <p>
                            Nous ne vendons jamais vos donnees personnelles a
                            des tiers.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>7. Vos droits</h2>
                        <p>
                            Conformement au Reglement General sur la Protection
                            des Donnees (RGPD), vous disposez des droits
                            suivants sur vos donnees personnelles :
                        </p>
                        <ul>
                            <li>
                                <strong>Droit d'acces</strong> : obtenir une
                                copie de vos donnees.
                            </li>
                            <li>
                                <strong>Droit de rectification</strong> :
                                corriger des donnees inexactes.
                            </li>
                            <li>
                                <strong>Droit a l'effacement</strong> : demander
                                la suppression de vos donnees.
                            </li>
                            <li>
                                <strong>Droit a la portabilite</strong> :
                                recevoir vos donnees dans un format structure.
                            </li>
                            <li>
                                <strong>Droit d'opposition</strong> : vous
                                opposer a certains traitements.
                            </li>
                            <li>
                                <strong>Droit a la limitation</strong> : limiter
                                le traitement de vos donnees.
                            </li>
                        </ul>
                        <p>
                            Pour exercer ces droits, contactez notre DPO a{' '}
                            <strong>dpo@wandireo.com</strong>. Vous disposez
                            egalement du droit de deposer une reclamation aupres
                            de la CNIL.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>8. Cookies</h2>
                        <p>
                            La plateforme utilise des cookies techniques
                            necessaires a son fonctionnement, ainsi que des
                            cookies analytiques et de mesure d'audience. Vous
                            pouvez gerer vos preferences de cookies via les
                            parametres de votre navigateur.
                        </p>
                    </section>

                    <section className="wdr-legal__section">
                        <h2>9. Securite</h2>
                        <p>
                            Wandireo met en oeuvre des mesures techniques et
                            organisationnelles appropriees pour proteger vos
                            donnees contre tout acces non autorise, perte ou
                            alteration, notamment : chiffrement TLS en transit,
                            hachage des mots de passe, controle d'acces strict.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
