const COUNTRY_NAME_MAP: Record<string, string> = {
    pt: "Portugal",
    portugal: "Portugal",
};

function normalizeCountryKey(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}

export function normalizeCountryName(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
        return "";
    }

    return COUNTRY_NAME_MAP[normalizeCountryKey(trimmed)] ?? trimmed;
}
