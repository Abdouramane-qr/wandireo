import React from 'react';
import { Check, Globe } from 'lucide-react';
import { LOCALE_LABELS, SUPPORTED_LOCALES } from '@/lib/locale';
import { type Locale, useTranslation } from '@/hooks/useTranslation';

interface LanguageSwitcherProps {
    className?: string;
    compactLabels?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
    className = '',
    compactLabels = false,
}) => {
    const { locale, setLocale, t } = useTranslation();
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className={['wdr-header__lang-selector', className].filter(Boolean).join(' ')}>
            <button
                className="wdr-header__tool-btn"
                onClick={() => setIsOpen((current) => !current)}
                title={t('language.change')}
                type="button"
            >
                <Globe size={18} />
                <span className="wdr-header__lang-code">
                    {locale.toUpperCase()}
                </span>
            </button>

            {isOpen && (
                <div className="wdr-header__lang-menu">
                    {SUPPORTED_LOCALES.map((candidate) => (
                        <button
                            key={candidate}
                            className={`wdr-header__lang-item ${locale === candidate ? 'active' : ''}`}
                            onClick={() => {
                                setLocale(candidate as Locale);
                                setIsOpen(false);
                            }}
                            type="button"
                        >
                            <span>
                                {compactLabels
                                    ? candidate.toUpperCase()
                                    : LOCALE_LABELS[candidate]}
                            </span>
                            {locale === candidate && <Check size={14} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
