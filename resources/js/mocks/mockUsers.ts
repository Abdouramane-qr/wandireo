/**
 * @file mockUsers.ts
 * @description Mock des données utilisateurs pour Wandireo.com.
 * Inclut des profils Clients, Partenaires et Administrateurs.
 */

import {
    UserRoleNames
    
    
    
    
} from '@/types/wdr-user';
import type {ClientUser, PartnerUser, AdminUser, User} from '@/types/wdr-user';

/**
 * Mock pour les Administrateurs
 * Capacité de modération, gestion des commissions, configuration Stripe,
 * et administration globale (langues, localisations).
 */
export const mockAdmins: AdminUser[] = [
    {
        id: 'admin_001',
        firstName: 'Wandireo',
        lastName: 'Admin',
        email: 'admin@wandireo.com',
        role: UserRoleNames.ADMIN,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-03-25'),
        permissions: ['all'],
        managedLanguages: ['fr', 'en', 'es', 'de'],
        managedLocations: ['France', 'Espagne', 'Italie', 'Grèce'],
        phoneNumber: '+33100000000',
    },
];

/**
 * Mock pour les Partenaires
 * Prestataires gérant leurs activités, services et produits.
 * Contient des informations sur Stripe Connect et les commissions.
 */
export const mockPartners: PartnerUser[] = [
    {
        id: 'partner_001',
        firstName: 'Jean',
        lastName: 'Expérience',
        email: 'contact@exp-travel.com',
        role: UserRoleNames.PARTNER,
        companyName: 'Exp-Travel Ltd',
        stripeConnectedAccountId: 'acct_1OuL01RG...',
        businessAddress: '12 Rue de la Découverte, 75001 Paris',
        activities: ['act_001', 'act_002'],
        commissionRate: 0.15, // 15% de commission
        totalSales: 4500.5,
        partnerStatus: 'APPROVED',
        mandateContractStatus: 'SIGNED',
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-03-20'),
        phoneNumber: '+33622334455',
    },
    {
        id: 'partner_002',
        firstName: 'Maria',
        lastName: 'Lanzarote',
        email: 'maria@canary-tours.es',
        role: UserRoleNames.PARTNER,
        companyName: 'Canary Tours',
        stripeConnectedAccountId: 'acct_1PuX22MH...',
        businessAddress: 'Calle San Bartolomé, 35500 Arrecife',
        activities: ['act_003'],
        commissionRate: 0.12, // 12% de commission
        totalSales: 12000.0,
        partnerStatus: 'APPROVED',
        mandateContractStatus: 'SIGNED',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-03-28'),
        phoneNumber: '+34600112233',
    },
];

/**
 * Mock pour les Clients
 * Utilisateurs qui réservent des activités et laissent des avis après participation.
 */
export const mockClients: ClientUser[] = [
    {
        id: 'client_001',
        firstName: 'Alice',
        lastName: 'Voyageuse',
        email: 'alice.v@gmail.com',
        role: UserRoleNames.CLIENT,
        bookings: ['book_101', 'book_102'],
        reviews: ['rev_201'],
        preferredCurrency: 'EUR',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-29'),
        phoneNumber: '+33688776655',
        language: 'fr',
    },
    {
        id: 'client_002',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: UserRoleNames.CLIENT,
        bookings: ['book_103'],
        reviews: [],
        preferredCurrency: 'USD',
        createdAt: new Date('2026-02-20'),
        updatedAt: new Date('2026-03-24'),
        language: 'en',
    },
];

/**
 * Export groupé de tous les utilisateurs
 */
export const mockUsers: User[] = [
    ...mockAdmins,
    ...mockPartners,
    ...mockClients,
];

/**
 * Credentials mock pour la simulation d'authentification.
 * Clé : email, Valeur : mot de passe en clair (contexte dev uniquement).
 */
export const mockCredentials: Record<string, string> = {
    'alice.v@gmail.com': 'alice123',
    'john.doe@example.com': 'john123',
    'contact@exp-travel.com': 'partner123',
    'maria@canary-tours.es': 'partner123',
    'admin@wandireo.com': 'admin123',
};
