/**
 * @file components/ui/index.ts
 * @description Point d'entree unique du design system Wandireo.
 *   Toutes les re-exportations sont listees explicitement pour faciliter
 *   le tree-shaking et maintenir la lisibilite des imports dans le projet.
 *
 * @example
 * import { Button, Input, ServiceCard, Modal, useToast } from '@/components/ui';
 */

// ---- Bouton -----------------------------------------------------------
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

// ---- Lien -----------------------------------------------------------
export { Link } from './Link';
export type { LinkProps, LinkVariant } from './Link';

// ---- Formulaire : Input -------------------------------------------
export { Input } from './Form/Input';
export type { InputProps, InputType } from './Form/Input';

// ---- Formulaire : Select -----------------------------------------
export { Select } from './Form/Select';
export type { SelectProps, SelectOption } from './Form/Select';

// ---- Formulaire : DatePicker ------------------------------------
export { DatePicker } from './Form/DatePicker';
export type { DatePickerProps, DatePickerMode } from './Form/DatePicker';

// ---- Carte de service -------------------------------------------
export { ServiceCard } from './ServiceCard';
export type { ServiceCardProps, ServiceCardVariant } from './ServiceCard';

// ---- Modale -------------------------------------------------------
export { Modal } from './Modal';
export type { ModalProps, ModalSize } from './Modal';

// ---- Toasts -------------------------------------------------------
export { ToastProvider, useToast } from './Toast';
export type {
    ToastType,
    ToastPosition,
    ToastOptions,
    ToastProviderProps,
} from './Toast';

// ---- Navigation : Header -----------------------------------------
export { Header } from './Header';
export type { HeaderProps } from './Header';

// ---- Navigation : Footer -----------------------------------------
export { Footer } from './Footer';

// ---- Navigation : Sidebar ----------------------------------------
export { Sidebar } from './Sidebar';
export type { SidebarProps } from './Sidebar';

// ---- Étoiles de notation -----------------------------------------
export { RatingStars } from './RatingStars';
export type {
    RatingStarsProps,
    RatingStarsMode,
    RatingValue,
} from './RatingStars';

// ---- Carte avis client ------------------------------------------
export { ReviewCard } from './ReviewCard';
export type { ReviewCardProps } from './ReviewCard';

// ---- Carte article de blog --------------------------------------
export { BlogCard } from './BlogCard';
export type { BlogCardProps } from './BlogCard';

// ---- Pagination -------------------------------------------------
export { Pagination } from './Pagination';
export type { PaginationProps } from './Pagination';

// ---- État vide --------------------------------------------------
export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

// ---- Fil d'Ariane -----------------------------------------------
export { Breadcrumb } from './Breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb';

// ---- Navigation admin -------------------------------------------
export { AdminSectionNav } from './AdminSectionNav';

// ---- Carte geo ---------------------------------------------------
export { GeoMap } from './GeoMap';
export type { GeoMapMarker } from './GeoMap';
