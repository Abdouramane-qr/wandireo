import { Loader2Icon } from "lucide-react";

import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
    const { t } = useTranslation();

    return (
        <Loader2Icon
            role="status"
            aria-label={t("common.loading_aria")}
            className={cn("size-4 animate-spin", className)}
            {...props}
        />
    );
}

export { Spinner };
