/**
 * @file Form/Input/index.tsx
 * @description Champ de saisie texte du design system Wandireo.
 *   Supporte les icones positionnees, les messages d'erreur/aide
 *   et tous les types d'input textuels pertinents pour une plateforme de voyage.
 */

import React, { useId } from 'react';
import '../Form.css';

export type InputType =
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'
    | 'search'
    | 'tel'
    | 'url';

export interface InputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type'
> {
    /** Type HTML de l'input. Par defaut: 'text' */
    type?: InputType;
    /** Label affiche au-dessus du champ */
    label?: string;
    /** Message d'erreur affiche en rouge sous le champ */
    error?: string;
    /** Message d'aide affiche en gris sous le champ (masque si une erreur est presente) */
    hint?: string;
    /** Ajoute un asterisque visuel au label et positionne aria-required */
    required?: boolean;
    /** Icone situee a gauche du champ (ex: icone de recherche, carte, calendrier) */
    leftIcon?: React.ReactNode;
    /** Icone situee a droite du champ (ex: oeil pour afficher/masquer un mot de passe) */
    rightIcon?: React.ReactNode;
}

/**
 * Composant Input du design system Wandireo.
 *
 * @example
 * <Input
 *   label="Destination"
 *   placeholder="Paris, Barcelone, Marrakech..."
 *   leftIcon={searchIcon}
 *   error={errors.destination?.message}
 * />
 */
export const Input: React.FC<InputProps> = ({
    type = 'text',
    label,
    error,
    hint,
    required,
    leftIcon,
    rightIcon,
    className = '',
    id: externalId,
    ...rest
}) => {
    const generatedId = useId();
    const id = externalId || generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const inputClassNames = [
        'wdr-input',
        leftIcon ? 'wdr-input--has-left-icon' : '',
        rightIcon ? 'wdr-input--has-right-icon' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const fieldClassNames = ['wdr-field', error ? 'wdr-field--error' : '']
        .filter(Boolean)
        .join(' ');

    const describedBy = [error ? errorId : '', hint && !error ? hintId : '']
        .filter(Boolean)
        .join(' ');

    return (
        <div className={fieldClassNames}>
            {label && (
                <label htmlFor={id} className="wdr-field__label">
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
                {leftIcon && (
                    <span
                        className="wdr-field__icon wdr-field__icon--left"
                        aria-hidden="true"
                    >
                        {leftIcon}
                    </span>
                )}

                <input
                    id={id}
                    type={type}
                    className={inputClassNames}
                    required={required}
                    aria-required={required}
                    aria-invalid={!!error}
                    aria-describedby={describedBy || undefined}
                    {...rest}
                />

                {rightIcon && (
                    <span
                        className="wdr-field__icon wdr-field__icon--right"
                        aria-hidden="true"
                    >
                        {rightIcon}
                    </span>
                )}
            </div>

            {error && (
                <span id={errorId} className="wdr-field__error" role="alert">
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

export default Input;
