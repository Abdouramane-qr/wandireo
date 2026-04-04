/**
 * @file utils/formatters.ts
 * @description Utilitaires de formatage pour les donnees affichees sur Wandireo.
 */

/**
 * Formate un montant en devise selon la locale francaise.
 *   (1250, "EUR") -> "1 250 €"
 *   (72.8,  "EUR") -> "73 €"
 */
export function formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Formate une duree en minutes en texte lisible.
 *   45    -> "45 min"
 *   90    -> "1h30"
 *   120   -> "2h"
 *   2880  -> "2 jours"
 */
export function formatDuration(minutes: number): string {
    if (minutes <= 0) {
return '';
}

    if (minutes < 60) {
return `${minutes} min`;
}

    if (minutes < 1440) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;

        return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
    }

    const d = Math.floor(minutes / 1440);

    return d === 1 ? '1 jour' : `${d} jours`;
}

/**
 * Calcule le nombre de jours entre deux dates ISO YYYY-MM-DD.
 *   ("2024-06-10", "2024-06-15") -> 5
 * Retourne 0 si l'une des dates est absente ou si l'ordre est inverse.
 */
export function calcDays(from: string, to: string): number {
    if (!from || !to) {
return 0;
}

    const a = new Date(from).getTime();
    const b = new Date(to).getTime();

    return Math.max(0, Math.round((b - a) / 86_400_000));
}

/**
 * Retourne la date du jour au format ISO YYYY-MM-DD.
 * Utilisee comme contrainte minimale sur les champs date.
 */
export function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}
