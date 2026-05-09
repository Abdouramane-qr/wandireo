import { router, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { useBooking } from "@/context/BookingContext";
import { useUser } from "@/context/UserContext";
import {
    getBookingAuthResumePath,
    isAuthPath,
    isBookingFinalizedPath,
    isBookingTunnelPath,
    toComparableBookingPath,
} from "@/lib/bookingIntent";

type SharedPageProps = {
    [key: string]: unknown;
};

export default function BookingIntentSync() {
    const page = usePage<SharedPageProps>();
    const { currentUser } = useUser();
    const {
        draft,
        hasPendingAuthResume,
        completeAuthResume,
        setResumePath,
    } = useBooking();

    const currentPath = page.url.startsWith("/") ? page.url : `/${page.url}`;

    useEffect(() => {
        if (draft && isBookingTunnelPath(currentPath)) {
            setResumePath(currentPath);
        }
    }, [currentPath, draft, setResumePath]);

    useEffect(() => {
        if (isBookingFinalizedPath(currentPath)) {
            completeAuthResume();
        }
    }, [completeAuthResume, currentPath]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== "CLIENT") {
            return;
        }

        if (!draft || !hasPendingAuthResume) {
            return;
        }

        if (isBookingTunnelPath(currentPath)) {
            completeAuthResume();

            return;
        }

        const comparablePath = toComparableBookingPath(currentPath);

        if (
            isAuthPath(currentPath) ||
            comparablePath === "/" ||
            comparablePath === "/mon-espace"
        ) {
            const resumeTarget = getBookingAuthResumePath();

            completeAuthResume();

            if (resumeTarget) {
                router.visit(resumeTarget, { replace: true });
            }
        }
    }, [
        completeAuthResume,
        currentPath,
        currentUser,
        draft,
        hasPendingAuthResume,
    ]);

    return null;
}
