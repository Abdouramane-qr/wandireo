import { usePage } from "@inertiajs/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

const LOCALIZED_QUERY_ROOTS = new Set(["blog", "search", "services"]);

export function LocalizedQuerySync(): null {
    const queryClient = useQueryClient();
    const { props } = usePage<{ locale?: string }>();
    const locale =
        typeof props.locale === "string" && props.locale.trim() !== ""
            ? props.locale
            : null;
    const previousLocaleRef = useRef<string | null>(locale);

    useEffect(() => {
        const previousLocale = previousLocaleRef.current;

        if (!locale || previousLocale === locale) {
            previousLocaleRef.current = locale;

            return;
        }

        queryClient.removeQueries({
            predicate: (query) => {
                const [root] = query.queryKey;

                return (
                    typeof root === "string"
                    && LOCALIZED_QUERY_ROOTS.has(root)
                );
            },
        });

        void Promise.all([
            queryClient.invalidateQueries({ queryKey: ["blog"] }),
            queryClient.invalidateQueries({ queryKey: ["search"] }),
            queryClient.invalidateQueries({ queryKey: ["services"] }),
        ]);

        previousLocaleRef.current = locale;
    }, [locale, queryClient]);

    return null;
}

export default LocalizedQuerySync;
