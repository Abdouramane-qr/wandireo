import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import type { WdrRoute } from "@/hooks/useWdrRouter";
import "./AdminSectionNav.css";

type AdminNavSection =
    | "dashboard"
    | "users"
    | "services"
    | "structure"
    | "reviews"
    | "transactions"
    | "support";

interface AdminSectionNavProps {
    active: AdminNavSection;
}

const ShieldIcon: React.FC = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const UsersIcon: React.FC = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const GridIcon: React.FC = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const LayersIcon: React.FC = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

const StarIcon: React.FC = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const CreditCardIcon: React.FC = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
);

const SupportIcon: React.FC = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const ITEMS: Array<{
    key: AdminNavSection;
    route: WdrRoute;
    icon: React.ReactNode;
}> = [
    {
        key: "dashboard",
        route: { name: "admin-dashboard" },
        icon: <ShieldIcon />,
    },
    {
        key: "users",
        route: { name: "admin-users" },
        icon: <UsersIcon />,
    },
    {
        key: "services",
        route: { name: "admin-services" },
        icon: <GridIcon />,
    },
    {
        key: "structure",
        route: { name: "admin-service-structure" },
        icon: <LayersIcon />,
    },
    {
        key: "reviews",
        route: { name: "admin-reviews" },
        icon: <StarIcon />,
    },
    {
        key: "transactions",
        route: { name: "admin-transactions" },
        icon: <CreditCardIcon />,
    },
    {
        key: "support",
        route: { name: "admin-support" },
        icon: <SupportIcon />,
    },
];

export const AdminSectionNav: React.FC<AdminSectionNavProps> = ({ active }) => {
    const { t } = useTranslation();
    const { navigate } = useRouter();
    const labels: Record<AdminNavSection, string> = {
        dashboard: t("admin.nav.dashboard"),
        users: t("admin.nav.users"),
        services: t("admin.nav.services"),
        structure: t("admin.nav.structure"),
        reviews: t("admin.nav.reviews"),
        transactions: t("admin.nav.transactions"),
        support: t("admin.nav.support"),
    };

    return (
        <nav className="wdr-admin-nav" aria-label={t("admin.nav.aria")}>
            <div className="wdr-admin-nav__inner">
                <div className="wdr-admin-nav__intro">
                    <p className="wdr-admin-nav__eyebrow">
                        {t("admin.nav.eyebrow")}
                    </p>
                    <p className="wdr-admin-nav__title">
                        {t("admin.nav.title")}
                    </p>
                </div>
                {ITEMS.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={[
                            "wdr-admin-nav__item",
                            active === item.key
                                ? "wdr-admin-nav__item--active"
                                : "",
                        ]
                            .join(" ")
                            .trim()}
                        onClick={() => navigate(item.route)}
                    >
                        <span className="wdr-admin-nav__icon">{item.icon}</span>
                        <span className="wdr-admin-nav__label">
                            {labels[item.key]}
                        </span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default AdminSectionNav;
