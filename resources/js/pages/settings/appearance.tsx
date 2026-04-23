import { Head } from "@inertiajs/react";
import AppearanceTabs from "@/components/appearance-tabs";
import Heading from "@/components/heading";
import { useTranslation } from "@/hooks/useTranslation";
import { edit as editAppearance } from "@/routes/appearance";

export default function Appearance() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t("settings.appearance.page_title")} />

            <h1 className="sr-only">{t("settings.appearance.page_title")}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t("settings.appearance.heading_title")}
                    description={t("settings.appearance.heading_description")}
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: "Paramètres d’apparence",
            translationKey: "settings.appearance.page_title",
            href: editAppearance(),
        },
    ],
};
