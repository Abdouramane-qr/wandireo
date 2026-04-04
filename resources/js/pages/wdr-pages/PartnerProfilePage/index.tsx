/**
 * @file pages/PartnerProfilePage/index.tsx
 * @description Profil du partenaire connecte.
 */

import React, { useMemo } from 'react';
import { Breadcrumb, Button, ServiceCard } from '@/components/wdr';
import { useUser } from '@/context/UserContext';
import { usePartnerApprovalGuard } from '@/hooks/usePartnerApprovalGuard';
import { useServicesData } from '@/hooks/useServicesData';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from '@/hooks/useWdrRouter';
import { formatPrice } from '@/lib/formatters';
import { toServiceCardData } from '@/lib/serviceAdapter';
import type { PartnerUser } from '@/types/wdr-user';
import './PartnerProfilePage.css';

export const PartnerProfilePage: React.FC = () => {
    const { navigate } = useRouter();
    const { currentUser } = useUser();
    const { isBlocked } = usePartnerApprovalGuard();
    const { t } = useTranslation();

    if (isBlocked || !currentUser || currentUser.role !== 'PARTNER') {
        return null;
    }

    const partner = currentUser as PartnerUser;
    const { services } = useServicesData();

    const partnerServices = useMemo(
        () =>
            services
                .filter((s) => s.partnerId === partner.id)
                .map(toServiceCardData),
        [services, partner.id],
    );

    const activeCount = partnerServices.length;
    const avgRating = useMemo(() => {
        const rated = services.filter(
            (s) => s.partnerId === partner.id && s.rating !== undefined,
        );

        if (rated.length === 0) {
            return null;
        }

        return (
            rated.reduce((sum, s) => sum + (s.rating ?? 0), 0) / rated.length
        );
    }, [services, partner.id]);

    const joinYear = partner.createdAt.getFullYear();

    return (
        <div className="wdr-pprofile">
            <div className="wdr-pprofile__breadcrumb-wrapper">
                <Breadcrumb
                    items={[
                        {
                            label: t('nav.home'),
                            onClick: () => navigate({ name: 'home' }),
                        },
                        {
                            label: t('partner.dashboard.title'),
                            onClick: () =>
                                navigate({ name: 'partner-dashboard' }),
                        },
                        { label: t('partner.profile.title') },
                    ]}
                />
            </div>

            <div className="wdr-pprofile__hero">
                <div className="wdr-pprofile__hero-inner">
                    <div className="wdr-pprofile__avatar" aria-hidden="true">
                        {partner.profilePicture ? (
                            <img
                                src={partner.profilePicture}
                                alt={partner.companyName}
                            />
                        ) : (
                            <span>
                                {partner.companyName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="wdr-pprofile__hero-info">
                        <h1 className="wdr-pprofile__company-name">
                            {partner.companyName}
                        </h1>
                        <p className="wdr-pprofile__full-name">
                            {partner.firstName} {partner.lastName}
                        </p>
                        {partner.businessAddress && (
                            <p className="wdr-pprofile__address">
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                {partner.businessAddress}
                            </p>
                        )}
                        <p className="wdr-pprofile__since">
                            {t('partner.profile.since').replace(
                                '{year}',
                                String(joinYear),
                            )}
                        </p>
                    </div>

                    <div className="wdr-pprofile__hero-actions">
                        <Button
                            variant="primary"
                            onClick={() =>
                                navigate({ name: 'partner-service-form' })
                            }
                        >
                            + {t('partner.profile.add_service')}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="wdr-pprofile__stats-bar">
                <div className="wdr-pprofile__stats-inner">
                    <div className="wdr-pprofile__stat">
                        <span className="wdr-pprofile__stat-value">
                            {activeCount}
                        </span>
                        <span className="wdr-pprofile__stat-label">
                            {activeCount === 1 ? 'service' : 'services'}
                        </span>
                    </div>
                    <div
                        className="wdr-pprofile__stat-divider"
                        aria-hidden="true"
                    />
                    <div className="wdr-pprofile__stat">
                        <span className="wdr-pprofile__stat-value">
                            {avgRating !== null ? avgRating.toFixed(1) : '-'}
                        </span>
                        <span className="wdr-pprofile__stat-label">
                            {t('partner.profile.rating')}
                        </span>
                    </div>
                    <div
                        className="wdr-pprofile__stat-divider"
                        aria-hidden="true"
                    />
                    <div className="wdr-pprofile__stat">
                        <span className="wdr-pprofile__stat-value">
                            {formatPrice(partner.totalSales, 'EUR')}
                        </span>
                        <span className="wdr-pprofile__stat-label">
                            {t('partner.profile.sales')}
                        </span>
                    </div>
                    <div
                        className="wdr-pprofile__stat-divider"
                        aria-hidden="true"
                    />
                    <div className="wdr-pprofile__stat">
                        <span className="wdr-pprofile__stat-value">
                            {(partner.commissionRate * 100).toFixed(0)} %
                        </span>
                        <span className="wdr-pprofile__stat-label">
                            {t('partner.profile.commission')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="wdr-pprofile__catalog">
                <div className="wdr-pprofile__catalog-inner">
                    <div className="wdr-pprofile__catalog-header">
                        <h2 className="wdr-pprofile__catalog-title">
                            {t('partner.profile.catalog_title')}
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                navigate({ name: 'partner-catalog' })
                            }
                        >
                            {t('partner.profile.catalog_manage')}
                        </Button>
                    </div>

                    {partnerServices.length === 0 ? (
                        <div className="wdr-pprofile__empty">
                            <p>{t('partner.profile.empty')}</p>
                            <Button
                                variant="primary"
                                onClick={() =>
                                    navigate({ name: 'partner-service-form' })
                                }
                            >
                                {t('partner.profile.first_service')}
                            </Button>
                        </div>
                    ) : (
                        <div className="wdr-pprofile__service-grid">
                            {partnerServices.map((s) => (
                                <ServiceCard
                                    key={s.id}
                                    service={s}
                                    variant="default"
                                    onBookClick={(id) =>
                                        navigate({ name: 'service', id })
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartnerProfilePage;
