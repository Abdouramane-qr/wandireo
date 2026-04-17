import React from "react";
import {
    Bike,
    BookOpen,
    CarFront,
    Compass,
    ShipWheel,
    TentTree,
} from "lucide-react";
import { stripLocaleFromPath } from "@/lib/locale";

export interface WdrNavItemConfig {
    href: string;
    labelKey: string;
    icon?: React.ReactNode;
}

export const PUBLIC_NAV_ITEMS: WdrNavItemConfig[] = [
    {
        href: "/recherche",
        labelKey: "nav.search",
        icon: <Compass size={18} />,
    },
    {
        href: "/recherche?category=ACTIVITE",
        labelKey: "search.activities",
        icon: <Bike size={18} />,
    },
    {
        href: "/recherche?category=BATEAU",
        labelKey: "search.boats",
        icon: <ShipWheel size={18} />,
    },
    {
        href: "/recherche?category=HEBERGEMENT",
        labelKey: "search.accommodations",
        icon: <TentTree size={18} />,
    },
    {
        href: "/recherche?category=VOITURE",
        labelKey: "search.cars",
        icon: <CarFront size={18} />,
    },
    {
        href: "/blog",
        labelKey: "nav.blog",
        icon: <BookOpen size={18} />,
    },
];

function normalizePath(path: string): string {
    const normalized = stripLocaleFromPath(path);
    const [pathname = "/", search = ""] = normalized.split("?", 2);

    return pathname === "/" && !search ? "/" : `${pathname}${search ? `?${search}` : ""}`;
}

export function isNavItemActive(currentPath: string, href: string): boolean {
    const current = normalizePath(currentPath);
    const target = normalizePath(href);

    if (current === target) {
        return true;
    }

    if (href === "/recherche") {
        return current === "/recherche";
    }

    return false;
}
