/**
 * @file Form/Select/index.tsx
 * @description Menu deroulant (select) du design system Wandireo.
 *   Utilise une fleche SVG personnalisee pour homogeneiser le rendu cross-browser.
 */

import React, { useId } from 'react';
import '../Form.css';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    'children'
> {
    /** Liste des options a afficher */
    options: SelectOption[];
    /** Label affiche au-dessus du champ */
    label?: string;
    /** Texte de l'option par defaut (valeur vide, non selectionnable) */
    placeholder?: string;
    /** Message d'erreur affiche sous le champ */
    error?: string;
    /** Message d'aide affiche sous le champ */
    hint?: string;
    required?: boolean;
}

/**
 * Menu deroulant du design system Wandireo.
 *
 * @example
 * <Select
 *   label="Type de service"
 *   placeholder="Choisir une categorie"
 *   options={[
 *     { value: 'ACTIVITE', label: 'Activite' },
 *     { value: 'BATEAU', label: 'Bateau' },
 *     { value: 'HEBERGEMENT', label: 'Hebergement' },
 *     { value: 'VOITURE', label: 'Voiture' },
 *   ]}
 *   value={category}
 *   onChange={handleChange}
 * />
 */
export const Select: React.FC<SelectProps> = ({
    options,
    label,
    placeholder,
    error,
    hint,
    required,
    className = '',
    id: externalId,
    ...rest
}) => {
    const generatedId = useId();
    const id = externalId || generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

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
                <select
                    id={id}
                    className={['wdr-select', className]
                        .filter(Boolean)
                        .join(' ')}
                    required={required}
                    aria-required={required}
                    aria-invalid={!!error}
                    aria-describedby={describedBy || undefined}
                    {...rest}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
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

export default Select;
