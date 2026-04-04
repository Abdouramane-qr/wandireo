/**
 * @file Modal/index.tsx
 * @description Fenetre modale accessible du design system Wandireo.
 *
 *   Fonctionnalites d'accessibilite implementees :
 *   - Rendu hors flux DOM via ReactDOM.createPortal (evite les conflits z-index).
 *   - role="dialog" et aria-modal="true" pour les lecteurs d'ecran.
 *   - Focus automatique sur le premier element focusable a l'ouverture.
 *   - Piegeage du focus (focus trap) avec Tab / Shift+Tab cycliques.
 *   - Fermeture par touche Echap.
 *   - Restauration du focus vers l'element declencheur a la fermeture.
 *   - Blocage du scroll du body pendant l'ouverture.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
    /** Controle la visibilite de la modale */
    isOpen: boolean;
    /** Callback appele lors de la demande de fermeture (ESC, clic overlay, bouton X) */
    onClose: () => void;
    /** Titre affiche dans l'en-tete */
    title: string;
    /** Taille maximale de la modale. Par defaut: 'md' */
    size?: ModalSize;
    /** Contenu principal de la modale */
    children: React.ReactNode;
    /** Actions affichees dans le pied (ex: boutons Annuler / Confirmer) */
    footer?: React.ReactNode;
    /** Ferme la modale lors d'un clic sur le fond assombri. Par defaut: true */
    closeOnOverlayClick?: boolean;
    /** Ferme la modale lors d'un appui sur la touche Echap. Par defaut: true */
    closeOnEsc?: boolean;
}

/** Selecteurs des elements focusables par le clavier (usage: focus trap) */
const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Modale accessible du design system Wandireo.
 *
 * @example
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmer la reservation"
 *   size="md"
 *   footer={
 *     <>
 *       <Button variant="ghost" onClick={() => setIsOpen(false)}>Annuler</Button>
 *       <Button variant="primary" onClick={handleConfirm}>Confirmer</Button>
 *     </>
 *   }
 * >
 *   <p>Etes-vous sur de vouloir reserver ce service ?</p>
 * </Modal>
 */
export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    size = 'md',
    children,
    footer,
    closeOnOverlayClick = true,
    closeOnEsc = true,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const titleId = `wdr-modal-title-${React.useId()}`;
    /** Sauvegarde l'element qui avait le focus avant l'ouverture */
    const previousFocusRef = useRef<Element | null>(null);

    /** Gestion du piegeage du focus (focus trap) */
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (closeOnEsc && e.key === 'Escape') {
                onClose();

                return;
            }

            if (e.key !== 'Tab' || !dialogRef.current) {
return;
}

            const focusableElements = Array.from(
                dialogRef.current.querySelectorAll<HTMLElement>(
                    FOCUSABLE_SELECTORS,
                ),
            ).filter((el) => !el.closest('[aria-hidden="true"]'));

            if (focusableElements.length === 0) {
return;
}

            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                /* Shift+Tab : si on est sur le premier element, aller au dernier */
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                /* Tab : si on est sur le dernier element, revenir au premier */
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        },
        [onClose, closeOnEsc],
    );

    useEffect(() => {
        if (!isOpen) {
return;
}

        /* Sauvegarde du focus actuel et blocage du scroll */
        previousFocusRef.current = document.activeElement;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);

        /* Focus sur le premier element focusable de la modale */
        const frame = requestAnimationFrame(() => {
            const focusable =
                dialogRef.current?.querySelector<HTMLElement>(
                    FOCUSABLE_SELECTORS,
                );
            focusable?.focus();
        });

        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';

            /* Restauration du focus vers l'element declencheur */
            if (previousFocusRef.current instanceof HTMLElement) {
                previousFocusRef.current.focus();
            }
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) {
return null;
}

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return ReactDOM.createPortal(
        <div
            className="wdr-modal-overlay"
            onClick={handleOverlayClick}
            aria-hidden={false}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={`wdr-modal wdr-modal--${size}`}
            >
                {/* En-tete */}
                <div className="wdr-modal__header">
                    <h2 id={titleId} className="wdr-modal__title">
                        {title}
                    </h2>
                    <button
                        className="wdr-modal__close-btn"
                        onClick={onClose}
                        aria-label="Fermer la fenetre"
                        type="button"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            aria-hidden="true"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Corps */}
                <div className="wdr-modal__body">{children}</div>

                {/* Pied (facultatif) */}
                {footer && <div className="wdr-modal__footer">{footer}</div>}
            </div>
        </div>,
        document.body,
    );
};

export default Modal;
