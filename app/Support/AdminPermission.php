<?php

namespace App\Support;

final class AdminPermission
{
    public const ALL = 'all';

    public const LEGACY_ALL = '*';

    public const AUDIT_LOG_VIEW = 'audit_log.view';

    public const PARTNER_GOVERNANCE_MANAGE = 'partner_governance.manage';

    public const PARTNER_DOCUMENT_REVIEW = 'partner_document.review';

    public const SERVICE_MODERATION_MANAGE = 'service_moderation.manage';

    public const SERVICE_STRUCTURE_MANAGE = 'service_structure.manage';

    public const SUPPORT_MANAGE = 'support.manage';

    public const CONTENT_MANAGE = 'content.manage';

    public const REVIEWS_MANAGE = 'reviews.manage';

    public const FAREHARBOR_MANAGE = 'fareharbor.manage';

    public const BOOKINGS_VIEW = 'bookings.view';

    public const FINANCE_VIEW = 'finance.view';

    public const ANALYTICS_VIEW = 'analytics.view';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return [
            self::ALL,
            self::LEGACY_ALL,
            self::AUDIT_LOG_VIEW,
            self::PARTNER_GOVERNANCE_MANAGE,
            self::PARTNER_DOCUMENT_REVIEW,
            self::SERVICE_MODERATION_MANAGE,
            self::SERVICE_STRUCTURE_MANAGE,
            self::SUPPORT_MANAGE,
            self::CONTENT_MANAGE,
            self::REVIEWS_MANAGE,
            self::FAREHARBOR_MANAGE,
            self::BOOKINGS_VIEW,
            self::FINANCE_VIEW,
            self::ANALYTICS_VIEW,
        ];
    }
}
