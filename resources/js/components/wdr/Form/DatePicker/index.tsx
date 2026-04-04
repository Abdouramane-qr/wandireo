/**
 * @file Form/DatePicker/index.tsx
 * @description Selecteur de date du design system Wandireo.
 *   Concu pour le flux de reservation : supporte la selection d'une date unique
 *   ou d'une plage aller-retour (ex: check-in / check-out, aller / retour).
 *
 *   S'appuie sur l'input natif <input type="date"> pour la fiabilite cross-browser
 *   et l'accessibilite clavier native (pas de dependance externe).
 */

import React, { useId } from 'react';
import '../Form.css';

/** Mode de selection */
export type DatePickerMode = 'single' | 'range';

export interface DatePickerProps {
    /** Mode de selection. Par defaut: 'single' */
    mode?: DatePickerMode;
    /** Label du champ de debut (ou du champ unique) */
    label?: string;
    /** Label du champ de fin, uniquement en mode 'range'. Par defaut: 'Retour' */
    endLabel?: string;
    /** Valeur de la date de debut, format ISO YYYY-MM-DD (controlled) */
    startDate?: string;
    /** Valeur de la date de fin, format ISO YYYY-MM-DD (controlled, mode 'range' seulement) */
    endDate?: string;
    /** Date minimum selectionnna ble, format ISO YYYY-MM-DD */
    minDate?: string;
    /** Date maximum selectionnable, format ISO YYYY-MM-DD */
    maxDate?: string;
    /** Message d'erreur affiche sous le composant */
    error?: string;
    /** Message d'aide affiche sous le composant */
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    /** Callback sur changement de la date de debut */
    onStartDateChange?: (value: string) => void;
    /** Callback sur changement de la date de fin (mode 'range' seulement) */
    onEndDateChange?: (value: string) => void;
    className?: string;
    id?: string;
}

/** Icone calendrier SVG utilisee dans le composant */
const CalendarIcon: React.FC = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

/** Icone SVG d'erreur reutilisee dans le message */
const ErrorIcon: React.FC = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
    >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
);

/**
 * Selecteur de date Wandireo.
 *
 * @example
 * // Date unique (activite ponctuelle)
 * <DatePicker
 *   label="Date de l'activite"
 *   minDate={todayStr}
 *   onStartDateChange={setActivityDate}
 * />
 *
 * // Plage aller-retour (hebergement, location de voiture)
 * <DatePicker
 *   mode="range"
 *   label="Arrivee"
 *   endLabel="Depart"
 *   minDate={todayStr}
 *   startDate={checkIn}
 *   endDate={checkOut}
 *   onStartDateChange={setCheckIn}
 *   onEndDateChange={setCheckOut}
 *   required
 * />
 */
export const DatePicker: React.FC<DatePickerProps> = ({
    mode = 'single',
    label,
    endLabel = 'Retour',
    startDate = '',
    endDate = '',
    minDate,
    maxDate,
    error,
    hint,
    required,
    disabled,
    onStartDateChange,
    onEndDateChange,
    className = '',
    id: externalId,
}) => {
    const generatedId = useId();
    const baseId = externalId || generatedId;
    const startId = `${baseId}-start`;
    const endId = `${baseId}-end`;
    const errorId = `${baseId}-error`;
    const hintId = `${baseId}-hint`;

    const fieldClassNames = [
        'wdr-field',
        'wdr-datepicker',
        error ? 'wdr-field--error' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const describedBy = [error ? errorId : '', hint && !error ? hintId : '']
        .filter(Boolean)
        .join(' ');

    return (
        <div className={fieldClassNames}>
            {mode === 'single' ? (
                /* ---- Mode date unique ---- */
                <>
                    {label && (
                        <label htmlFor={startId} className="wdr-field__label">
                            {label}
                            {required && (
                                <span
                                    className="wdr-field__required"
                                    aria-hidden="true"
                                >
                                    *
                                </span>
                            )}
                        </label>
                    )}
                    <div className="wdr-field__control">
                        <span
                            className="wdr-field__icon wdr-field__icon--left"
                            aria-hidden="true"
                        >
                            <CalendarIcon />
                        </span>
                        <input
                            id={startId}
                            type="date"
                            className="wdr-datepicker__input wdr-input--has-left-icon"
                            value={startDate}
                            min={minDate}
                            max={maxDate}
                            required={required}
                            disabled={disabled}
                            aria-required={required}
                            aria-invalid={!!error}
                            aria-describedby={describedBy || undefined}
                            onChange={(e) =>
                                onStartDateChange?.(e.target.value)
                            }
                        />
                    </div>
                </>
            ) : (
                /* ---- Mode plage de dates ---- */
                <div className="wdr-datepicker__range">
                    {/* Date de debut */}
                    <div className="wdr-field">
                        {label && (
                            <label
                                htmlFor={startId}
                                className="wdr-field__label"
                            >
                                {label}
                                {required && (
                                    <span
                                        className="wdr-field__required"
                                        aria-hidden="true"
                                    >
                                        *
                                    </span>
                                )}
                            </label>
                        )}
                        <div className="wdr-field__control">
                            <span
                                className="wdr-field__icon wdr-field__icon--left"
                                aria-hidden="true"
                            >
                                <CalendarIcon />
                            </span>
                            <input
                                id={startId}
                                type="date"
                                className="wdr-datepicker__input wdr-input--has-left-icon"
                                value={startDate}
                                min={minDate}
                                /* La date de debut ne peut depasser la date de fin choisie */
                                max={endDate || maxDate}
                                required={required}
                                disabled={disabled}
                                aria-required={required}
                                aria-invalid={!!error}
                                aria-describedby={describedBy || undefined}
                                onChange={(e) =>
                                    onStartDateChange?.(e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Date de fin */}
                    <div className="wdr-field">
                        <label htmlFor={endId} className="wdr-field__label">
                            {endLabel}
                            {required && (
                                <span
                                    className="wdr-field__required"
                                    aria-hidden="true"
                                >
                                    *
                                </span>
                            )}
                        </label>
                        <div className="wdr-field__control">
                            <span
                                className="wdr-field__icon wdr-field__icon--left"
                                aria-hidden="true"
                            >
                                <CalendarIcon />
                            </span>
                            <input
                                id={endId}
                                type="date"
                                className="wdr-datepicker__input wdr-input--has-left-icon"
                                value={endDate}
                                /* La date de fin ne peut etre anterieure a la date de debut choisie */
                                min={startDate || minDate}
                                max={maxDate}
                                required={required}
                                disabled={disabled}
                                aria-required={required}
                                aria-invalid={!!error}
                                onChange={(e) =>
                                    onEndDateChange?.(e.target.value)
                                }
                            />
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <span id={errorId} className="wdr-field__error" role="alert">
                    <ErrorIcon />
                    {error}
                </span>
            )}

            {hint && !error && (
                <span id={hintId} className="wdr-field__hint">
                    {hint}
                </span>
            )}
        </div>
    );
};

export default DatePicker;
