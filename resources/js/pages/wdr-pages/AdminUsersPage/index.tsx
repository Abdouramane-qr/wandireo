import React, { useEffect, useMemo, useState } from 'react';
import { AdminSectionNav, Button, Input, Modal, useToast } from '@/components/wdr';
import { useUser } from '@/context/UserContext';
import { useAdminBookingsData } from '@/hooks/useBookingsData';
import {
    useAdminCreateUserData,
    useAdminUploadPartnerContractData,
    useAdminUpdateUserData,
    useAdminUsersData,
} from '@/hooks/useUsersData';
import { useRouter } from '@/hooks/useWdrRouter';
import { formatPrice } from '@/lib/formatters';
import { BookingStatusNames } from '@/types/booking';
import type {
    AdminUser,
    ClientUser,
    UserRole,
    MandateContractStatus,
    PartnerStatus,
    PartnerUser,
} from '@/types/wdr-user';
import './AdminUsersPage.css';

type PartnerEditForm = {
    commissionRate: string;
    stripeConnectedAccountId: string;
    businessAddress: string;
    partnerStatus: PartnerStatus;
    partnerRejectionReason: string;
    mandateContractStatus: MandateContractStatus;
    mandateContractFilePath: string;
};

type GeneralEditForm = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    language: string;
    preferredCurrency: string;
};

type PartnerCreateForm = {
    role: UserRole;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName: string;
    phoneNumber: string;
    businessAddress: string;
    language: string;
    preferredCurrency: string;
    commissionRate: string;
    partnerStatus: PartnerStatus;
    mandateContractStatus: MandateContractStatus;
};

const DEFAULT_CREATE_FORM: PartnerCreateForm = {
    role: 'PARTNER',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    phoneNumber: '',
    businessAddress: '',
    language: 'fr',
    preferredCurrency: 'EUR',
    commissionRate: '20',
    partnerStatus: 'PENDING',
    mandateContractStatus: 'NOT_SENT',
};

const statusLabel = (status: PartnerStatus): string =>
    ({
        APPROVED: 'Valide',
        REJECTED: 'Refuse',
        SUSPENDED: 'Suspendu',
        PENDING: 'En attente',
    })[status];

const statusClass = (status: PartnerStatus): string =>
    ({
        APPROVED: 'wdr-admin-users__partner-status--active',
        REJECTED: 'wdr-admin-users__partner-status--inactive',
        SUSPENDED: 'wdr-admin-users__partner-status--inactive',
        PENDING: 'wdr-admin-users__partner-status--pending',
    })[status];

const contractStatusLabel = (status: MandateContractStatus): string =>
    ({
        NOT_SENT: 'Non envoye',
        PENDING_SIGNATURE: 'En attente de signature',
        SIGNED: 'Signe',
        REJECTED: 'Refuse',
    })[status];

const formatDate = (date?: Date): string =>
    date
        ? new Intl.DateTimeFormat('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          }).format(date)
        : 'Non renseignee';

export const AdminUsersPage: React.FC = () => {
    const { currentUser } = useUser();
    const { navigate } = useRouter();
    const { success, error } = useToast();
    const [partnerStatusFilter, setPartnerStatusFilter] = useState<
        PartnerStatus | 'all'
    >('all');
    const [searchTerm, setSearchTerm] = useState('');
    const { users: allUsers } = useAdminUsersData(
        {
            ...(partnerStatusFilter === 'all'
                ? {}
                : { role: 'PARTNER', partnerStatus: partnerStatusFilter }),
            ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
        },
    );
    const { bookings } = useAdminBookingsData();
    const updateUserMutation = useAdminUpdateUserData();
    const createUserMutation = useAdminCreateUserData();
    const uploadContractMutation = useAdminUploadPartnerContractData();

    const partners = useMemo(
        () =>
            allUsers.filter(
                (user) => user.role === 'PARTNER',
            ) as PartnerUser[],
        [allUsers],
    );
    const clients = useMemo(
        () =>
            partnerStatusFilter === 'all'
                ? (allUsers.filter(
                      (user) => user.role === 'CLIENT',
                  ) as ClientUser[])
                : [],
        [allUsers, partnerStatusFilter],
    );
    const admins = useMemo(
        () =>
            partnerStatusFilter === 'all'
                ? (allUsers.filter(
                      (user) => user.role === 'ADMIN',
                  ) as AdminUser[])
                : [],
        [allUsers, partnerStatusFilter],
    );

    const [editingPartnerId, setEditingPartnerId] = useState<string | null>(
        null,
    );
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<PartnerEditForm>({
        commissionRate: '',
        stripeConnectedAccountId: '',
        businessAddress: '',
        partnerStatus: 'PENDING',
        partnerRejectionReason: '',
        mandateContractStatus: 'NOT_SENT',
        mandateContractFilePath: '',
    });
    const [contractFile, setContractFile] = useState<File | null>(null);
    const [generalEditForm, setGeneralEditForm] = useState<GeneralEditForm>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        language: 'fr',
        preferredCurrency: 'EUR',
    });
    const [createForm, setCreateForm] =
        useState<PartnerCreateForm>(DEFAULT_CREATE_FORM);

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: 'home' });
            return;
        }
        if (currentUser.role !== 'ADMIN') {
            navigate({ name: 'dashboard' });
        }
    }, [currentUser, navigate]);

    const editingPartner = editingPartnerId
        ? (partners.find((partner) => partner.id === editingPartnerId) ?? null)
        : null;
    const editingUser = editingUserId
        ? (allUsers.find((user) => user.id === editingUserId) ?? null)
        : null;

    const partnerRevenue = useMemo(
        () =>
            Object.fromEntries(
                partners.map((partner) => {
                    const confirmed = bookings.filter(
                        (booking) =>
                            booking.partnerId === partner.id &&
                            booking.status === BookingStatusNames.CONFIRMED,
                    );
                    const total = confirmed.reduce(
                        (sum, booking) => sum + booking.totalPrice,
                        0,
                    );
                    const commission =
                        (total * partner.commissionRate) /
                        (1 + partner.commissionRate);

                    return [
                        partner.id,
                        {
                            total,
                            commission,
                            partnerNet: total - commission,
                            bookingsCount: confirmed.length,
                        },
                    ];
                }),
            ),
        [bookings, partners],
    );

    const openEditModal = (partner: PartnerUser): void => {
        setEditingPartnerId(partner.id);
        setEditForm({
            commissionRate: String(Math.round(partner.commissionRate * 100)),
            stripeConnectedAccountId: partner.stripeConnectedAccountId ?? '',
            businessAddress: partner.businessAddress ?? '',
            partnerStatus: partner.partnerStatus,
            partnerRejectionReason: partner.partnerRejectionReason ?? '',
            mandateContractStatus: partner.mandateContractStatus,
            mandateContractFilePath: partner.mandateContractFilePath ?? '',
        });
        setContractFile(null);
    };

    const openGeneralEditModal = (user: ClientUser | AdminUser): void => {
        setEditingUserId(user.id);
        setGeneralEditForm({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber ?? '',
            language: user.language ?? 'fr',
            preferredCurrency:
                user.role === 'CLIENT' ? user.preferredCurrency ?? 'EUR' : '',
        });
    };

    const savePartner = async (): Promise<void> => {
        if (!editingPartnerId) {
            return;
        }

        const ratePercent = Number.parseFloat(editForm.commissionRate);

        if (Number.isNaN(ratePercent) || ratePercent < 20 || ratePercent > 30) {
            error('Le taux de commission partenaire doit etre entre 20 % et 30 %.');
            return;
        }

        const stripeId = editForm.stripeConnectedAccountId.trim();
        if (stripeId && !stripeId.startsWith('acct_')) {
            error('L identifiant Stripe Connect doit commencer par acct_.');
            return;
        }

        try {
            await updateUserMutation.mutateAsync({
                id: editingPartnerId,
                data: {
                    commissionRate: ratePercent / 100,
                    stripeConnectedAccountId: stripeId || undefined,
                    businessAddress:
                        editForm.businessAddress.trim() || undefined,
                    partnerStatus: editForm.partnerStatus,
                    partnerRejectionReason:
                        editForm.partnerRejectionReason.trim() || undefined,
                    mandateContractStatus: editForm.mandateContractStatus,
                    mandateContractFilePath:
                        editForm.mandateContractFilePath.trim() || undefined,
                },
            });
            success('Partenaire mis a jour.');
            setEditingPartnerId(null);
        } catch {
            error('Impossible de sauvegarder les informations du partenaire.');
        }
    };

    const saveGeneralUser = async (): Promise<void> => {
        if (!editingUser) {
            return;
        }

        if (
            !generalEditForm.firstName.trim() ||
            !generalEditForm.lastName.trim() ||
            !generalEditForm.email.trim()
        ) {
            error('Le prenom, le nom et l email sont obligatoires.');
            return;
        }

        try {
            await updateUserMutation.mutateAsync({
                id: editingUser.id,
                data: {
                    firstName: generalEditForm.firstName.trim(),
                    lastName: generalEditForm.lastName.trim(),
                    email: generalEditForm.email.trim(),
                    phoneNumber: generalEditForm.phoneNumber.trim() || undefined,
                    language: generalEditForm.language.trim() || undefined,
                    preferredCurrency:
                        editingUser.role === 'CLIENT'
                            ? generalEditForm.preferredCurrency.trim() ||
                              undefined
                            : undefined,
                },
            });
            success('Compte mis a jour.');
            setEditingUserId(null);
        } catch {
            error('Impossible de mettre a jour ce compte.');
        }
    };

    const uploadContract = async (): Promise<void> => {
        if (!editingPartnerId || !contractFile) {
            error('Selectionnez un fichier PDF avant de lancer l upload.');
            return;
        }

        try {
            const updatedPartner = await uploadContractMutation.mutateAsync({
                id: editingPartnerId,
                file: contractFile,
            });

            setEditForm((form) => ({
                ...form,
                mandateContractFilePath:
                    updatedPartner.role === 'PARTNER'
                        ? updatedPartner.mandateContractFilePath ?? ''
                        : form.mandateContractFilePath,
                mandateContractStatus:
                    updatedPartner.role === 'PARTNER'
                        ? updatedPartner.mandateContractStatus
                        : form.mandateContractStatus,
            }));
            setContractFile(null);
            success('Contrat partenaire televerse.');
        } catch {
            error('Impossible de televerser le contrat partenaire.');
        }
    };

    const createUser = async (): Promise<void> => {
        const ratePercent = Number.parseFloat(createForm.commissionRate);

        if (
            !createForm.firstName.trim() ||
            !createForm.lastName.trim() ||
            !createForm.email.trim() ||
            !createForm.password.trim()
        ) {
            error('Completez les champs obligatoires du compte.');
            return;
        }

        if (
            createForm.role === 'PARTNER' &&
            !createForm.companyName.trim()
        ) {
            error('Le nom de societe est obligatoire pour un partenaire.');
            return;
        }

        if (
            createForm.role === 'PARTNER' &&
            (Number.isNaN(ratePercent) || ratePercent < 20 || ratePercent > 30)
        ) {
            error('Le taux de commission partenaire doit etre entre 20 % et 30 %.');
            return;
        }

        try {
            await createUserMutation.mutateAsync({
                firstName: createForm.firstName.trim(),
                lastName: createForm.lastName.trim(),
                email: createForm.email.trim(),
                password: createForm.password,
                role: createForm.role,
                companyName: createForm.companyName.trim() || undefined,
                phoneNumber: createForm.phoneNumber.trim() || undefined,
                businessAddress: createForm.businessAddress.trim() || undefined,
                language: createForm.language.trim() || undefined,
                preferredCurrency:
                    createForm.role === 'CLIENT'
                        ? createForm.preferredCurrency.trim() || undefined
                        : undefined,
                commissionRate:
                    createForm.role === 'PARTNER'
                        ? ratePercent / 100
                        : undefined,
                partnerStatus:
                    createForm.role === 'PARTNER'
                        ? createForm.partnerStatus
                        : undefined,
                mandateContractStatus:
                    createForm.role === 'PARTNER'
                        ? createForm.mandateContractStatus
                        : undefined,
            });
            success('Compte cree.');
            setCreateForm(DEFAULT_CREATE_FORM);
            setIsCreateModalOpen(false);
        } catch {
            error('Impossible de creer ce compte.');
        }
    };

    const exportPartnersCsv = (): void => {
        const rows = [
            [
                'id',
                'societe',
                'prenom',
                'nom',
                'email',
                'statut_partenaire',
                'statut_contrat',
                'commission',
                'stripe_connect_id',
                'adresse',
            ],
            ...partners.map((partner) => [
                partner.id,
                partner.companyName,
                partner.firstName,
                partner.lastName,
                partner.email,
                partner.partnerStatus,
                partner.mandateContractStatus,
                String(partner.commissionRate),
                partner.stripeConnectedAccountId ?? '',
                partner.businessAddress ?? '',
            ]),
        ];
        const csv = rows
            .map((row) =>
                row
                    .map((value) => `"${String(value).replaceAll('"', '""')}"`)
                    .join(','),
            )
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'wandireo-partenaires.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const applyQuickUpdate = async (
        partner: PartnerUser,
        data: {
            partnerStatus?: PartnerStatus;
            mandateContractStatus?: MandateContractStatus;
            partnerRejectionReason?: string;
        },
        successMessage: string,
    ): Promise<void> => {
        try {
            await updateUserMutation.mutateAsync({
                id: partner.id,
                data: {
                    commissionRate: partner.commissionRate,
                    stripeConnectedAccountId:
                        partner.stripeConnectedAccountId ?? undefined,
                    businessAddress: partner.businessAddress ?? undefined,
                    partnerStatus: data.partnerStatus ?? partner.partnerStatus,
                    mandateContractStatus:
                        data.mandateContractStatus ??
                        partner.mandateContractStatus,
                    partnerRejectionReason:
                        data.partnerRejectionReason ??
                        partner.partnerRejectionReason ??
                        undefined,
                    mandateContractFilePath:
                        partner.mandateContractFilePath ?? undefined,
                },
            });
            success(successMessage);
        } catch {
            error('Impossible d appliquer cette action rapide.');
        }
    };

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return null;
    }

    const isPartnerCreation = createForm.role === 'PARTNER';
    const isClientCreation = createForm.role === 'CLIENT';

    return (
        <div className="wdr-admin-users">
            <section className="wdr-admin-users__hero">
                <div className="wdr-admin-users__hero-content">
                    <p className="wdr-admin-users__hero-badge">
                        Administration
                    </p>
                    <h1 className="wdr-admin-users__hero-title">
                        Gestion des utilisateurs
                    </h1>
                    <p className="wdr-admin-users__hero-subtitle">
                        Validation partenaires, contrat de mandat et creation de
                        compte depuis l admin.
                    </p>
                </div>
            </section>

            <AdminSectionNav active="users" />

            <div className="wdr-admin-users__body">
                <section>
                    <div className="wdr-admin-users__partner-actions">
                        <h2 className="wdr-admin-users__section-title">
                            Comptes Partenaires ({partners.length})
                        </h2>
                        <div className="wdr-admin-users__toolbar">
                            <Input
                                placeholder="Rechercher un partenaire"
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                }
                            />
                            <select
                                className="wdr-admin-users__input"
                                value={partnerStatusFilter}
                                onChange={(e) =>
                                    setPartnerStatusFilter(
                                        e.target.value as PartnerStatus | 'all',
                                    )
                                }
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="PENDING">En attente</option>
                                <option value="APPROVED">Valides</option>
                                <option value="REJECTED">Refuses</option>
                                <option value="SUSPENDED">Suspendus</option>
                            </select>
                            <Button
                                variant="primary"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                Creer un utilisateur
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={exportPartnersCsv}
                            >
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    <div className="wdr-admin-users__partners-grid">
                        {partners.map((partner) => {
                            const revenue = partnerRevenue[partner.id] ?? {
                                total: 0,
                                commission: 0,
                                partnerNet: 0,
                                bookingsCount: 0,
                            };

                            return (
                                <article
                                    key={partner.id}
                                    className="wdr-admin-users__partner-card"
                                >
                                    <div className="wdr-admin-users__partner-header">
                                        <div
                                            className="wdr-admin-users__partner-avatar"
                                            aria-hidden="true"
                                        >
                                            {partner.companyName[0]?.toUpperCase() ??
                                                'P'}
                                        </div>
                                        <div className="wdr-admin-users__partner-info">
                                            <span className="wdr-admin-users__partner-company">
                                                {partner.companyName}
                                            </span>
                                            <span className="wdr-admin-users__partner-name">
                                                {partner.firstName}{' '}
                                                {partner.lastName}
                                            </span>
                                            <span className="wdr-admin-users__partner-email">
                                                {partner.email}
                                            </span>
                                        </div>
                                        <span
                                            className={[
                                                'wdr-admin-users__partner-status',
                                                statusClass(
                                                    partner.partnerStatus,
                                                ),
                                            ].join(' ')}
                                        >
                                            {statusLabel(
                                                partner.partnerStatus,
                                            )}
                                        </span>
                                    </div>

                                    <div className="wdr-admin-users__partner-metrics">
                                        <div className="wdr-admin-users__partner-metric">
                                            <span className="wdr-admin-users__partner-metric-label">
                                                Volume confirme
                                            </span>
                                            <span className="wdr-admin-users__partner-metric-value">
                                                {formatPrice(
                                                    revenue.total,
                                                    'EUR',
                                                )}
                                            </span>
                                        </div>
                                        <div className="wdr-admin-users__partner-metric">
                                            <span className="wdr-admin-users__partner-metric-label">
                                                Commission
                                            </span>
                                            <span className="wdr-admin-users__partner-metric-value">
                                                {(partner.commissionRate * 100).toFixed(0)} %
                                            </span>
                                        </div>
                                        <div className="wdr-admin-users__partner-metric">
                                            <span className="wdr-admin-users__partner-metric-label">
                                                Net partenaire
                                            </span>
                                            <span className="wdr-admin-users__partner-metric-value">
                                                {formatPrice(
                                                    revenue.partnerNet,
                                                    'EUR',
                                                )}
                                            </span>
                                        </div>
                                        <div className="wdr-admin-users__partner-metric">
                                            <span className="wdr-admin-users__partner-metric-label">
                                                Reservations
                                            </span>
                                            <span className="wdr-admin-users__partner-metric-value">
                                                {revenue.bookingsCount}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="wdr-admin-users__stripe-row">
                                        <span className="wdr-admin-users__stripe-label">
                                            Dossier
                                        </span>
                                        <code className="wdr-admin-users__stripe-id">
                                            {statusLabel(partner.partnerStatus)} /
                                            contrat{' '}
                                            {contractStatusLabel(
                                                partner.mandateContractStatus,
                                            )}
                                        </code>
                                    </div>

                                    <div className="wdr-admin-users__stripe-row">
                                        <span className="wdr-admin-users__stripe-label">
                                            Stripe Connect ID
                                        </span>
                                        <code className="wdr-admin-users__stripe-id">
                                            {partner.stripeConnectedAccountId ||
                                                '— non configure —'}
                                        </code>
                                    </div>

                                    {partner.businessAddress && (
                                        <p className="wdr-admin-users__partner-address">
                                            {partner.businessAddress}
                                        </p>
                                    )}

                                    {partner.mandateContractFilePath && (
                                        <p className="wdr-admin-users__partner-address">
                                            Contrat: {partner.mandateContractFilePath}
                                        </p>
                                    )}

                                    <p className="wdr-admin-users__partner-address">
                                        Validation admin:{' '}
                                        {formatDate(partner.partnerValidatedAt)}
                                    </p>

                                    <p className="wdr-admin-users__partner-address">
                                        Signature contrat:{' '}
                                        {formatDate(partner.mandateSignedAt)}
                                    </p>

                                    {partner.partnerRejectionReason && (
                                        <p className="wdr-admin-users__partner-address">
                                            Motif: {partner.partnerRejectionReason}
                                        </p>
                                    )}

                                    <div className="wdr-admin-users__partner-actions">
                                        {partner.partnerStatus !== 'APPROVED' && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() =>
                                                    void applyQuickUpdate(
                                                        partner,
                                                        {
                                                            partnerStatus:
                                                                'APPROVED',
                                                        },
                                                        'Partenaire valide.',
                                                    )
                                                }
                                                disabled={
                                                    updateUserMutation.isPending
                                                }
                                            >
                                                Valider
                                            </Button>
                                        )}
                                        {partner.mandateContractStatus !==
                                            'SIGNED' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    void applyQuickUpdate(
                                                        partner,
                                                        {
                                                            mandateContractStatus:
                                                                'SIGNED',
                                                        },
                                                        'Contrat marque comme signe.',
                                                    )
                                                }
                                                disabled={
                                                    updateUserMutation.isPending
                                                }
                                            >
                                                Marquer signe
                                            </Button>
                                        )}
                                        {partner.partnerStatus !==
                                            'SUSPENDED' && (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() =>
                                                    void applyQuickUpdate(
                                                        partner,
                                                        {
                                                            partnerStatus:
                                                                'SUSPENDED',
                                                        },
                                                        'Partenaire suspendu.',
                                                    )
                                                }
                                                disabled={
                                                    updateUserMutation.isPending
                                                }
                                            >
                                                Suspendre
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                openEditModal(partner)
                                            }
                                        >
                                            Modifier
                                        </Button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                {partnerStatusFilter === 'all' && (
                <section>
                    <h2 className="wdr-admin-users__section-title">
                        Comptes Clients ({clients.length})
                    </h2>
                    <div className="wdr-admin-users__table-wrapper">
                        <table className="wdr-admin-users__table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Email</th>
                                    <th>Langue</th>
                                    <th>Devise</th>
                                    <th>Reservations</th>
                                    <th>Avis</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client.id}>
                                        <td>
                                            {client.firstName} {client.lastName}
                                        </td>
                                        <td>{client.email}</td>
                                        <td>
                                            {client.language?.toUpperCase() ??
                                                '—'}
                                        </td>
                                        <td>
                                            {client.preferredCurrency ?? '—'}
                                        </td>
                                        <td>{client.bookingsCount ?? 0}</td>
                                        <td>{client.reviewsCount ?? 0}</td>
                                        <td>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    openGeneralEditModal(client)
                                                }
                                            >
                                                Modifier
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
                )}

                {partnerStatusFilter === 'all' && (
                    <section>
                        <h2 className="wdr-admin-users__section-title">
                            Comptes Admin ({admins.length})
                        </h2>
                        <div className="wdr-admin-users__table-wrapper">
                            <table className="wdr-admin-users__table">
                                <thead>
                                    <tr>
                                        <th>Nom</th>
                                        <th>Email</th>
                                        <th>Langue</th>
                                        <th>Permissions</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((admin) => (
                                        <tr key={admin.id}>
                                            <td>
                                                {admin.firstName}{' '}
                                                {admin.lastName}
                                            </td>
                                            <td>{admin.email}</td>
                                            <td>
                                                {admin.language?.toUpperCase() ??
                                                    '—'}
                                            </td>
                                            <td>
                                                {admin.permissions.length > 0
                                                    ? admin.permissions.join(
                                                          ', ',
                                                      )
                                                    : '—'}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        openGeneralEditModal(
                                                            admin,
                                                        )
                                                    }
                                                >
                                                    Modifier
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>

            {editingPartner && (
                <Modal
                    isOpen={!!editingPartnerId}
                    onClose={() => setEditingPartnerId(null)}
                    title={`Modifier - ${editingPartner.companyName}`}
                    size="md"
                >
                    <div className="wdr-admin-users__edit-form">
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                Commission (%)
                            </label>
                            <Input
                                type="number"
                                min={20}
                                max={30}
                                step={1}
                                value={editForm.commissionRate}
                                onChange={(e) =>
                                    setEditForm((form) => ({
                                        ...form,
                                        commissionRate: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                Statut partenaire
                            </label>
                            <select
                                className="wdr-admin-users__input"
                                value={editForm.partnerStatus}
                                onChange={(e) =>
                                    setEditForm((form) => ({
                                        ...form,
                                        partnerStatus: e.target
                                            .value as PartnerStatus,
                                    }))
                                }
                            >
                                <option value="PENDING">En attente</option>
                                <option value="APPROVED">Valide</option>
                                <option value="REJECTED">Refuse</option>
                                <option value="SUSPENDED">Suspendu</option>
                            </select>
                        </div>
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                Statut contrat
                            </label>
                            <select
                                className="wdr-admin-users__input"
                                value={editForm.mandateContractStatus}
                                onChange={(e) =>
                                    setEditForm((form) => ({
                                        ...form,
                                        mandateContractStatus: e.target
                                            .value as MandateContractStatus,
                                    }))
                                }
                            >
                                <option value="NOT_SENT">Non envoye</option>
                                <option value="PENDING_SIGNATURE">
                                    En attente de signature
                                </option>
                                <option value="SIGNED">Signe</option>
                                <option value="REJECTED">Refuse</option>
                            </select>
                        </div>
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                Stripe Connected Account ID
                            </label>
                            <Input
                                value={editForm.stripeConnectedAccountId}
                                onChange={(e) =>
                                    setEditForm((form) => ({
                                        ...form,
                                        stripeConnectedAccountId:
                                            e.target.value,
                                    }))
                                }
                                placeholder="acct_..."
                            />
                        </div>
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                Adresse professionnelle
                            </label>
                            <Input
                                value={editForm.businessAddress}
                                onChange={(e) =>
                                    setEditForm((form) => ({
                                        ...form,
                                        businessAddress: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                Contrat
                            </label>
                            <Input
                                value={editForm.mandateContractFilePath}
                                onChange={(e) =>
                                    setEditForm((form) => ({
                                        ...form,
                                        mandateContractFilePath:
                                            e.target.value,
                                    }))
                                }
                                placeholder="storage/contracts/mandat.pdf"
                            />
                            {editForm.mandateContractFilePath && (
                                <a
                                    className="wdr-admin-users__contract-link"
                                    href={editForm.mandateContractFilePath}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Ouvrir le contrat actuel
                                </a>
                            )}
                            {editingPartner && (
                                <p className="wdr-admin-users__edit-hint">
                                    Validation admin:{' '}
                                    {formatDate(
                                        editingPartner.partnerValidatedAt,
                                    )} | Signature:{' '}
                                    {formatDate(editingPartner.mandateSignedAt)}
                                </p>
                            )}
                        </div>
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                Televerser un PDF de contrat
                            </label>
                            <input
                                className="wdr-admin-users__input"
                                type="file"
                                accept="application/pdf"
                                onChange={(e) =>
                                    setContractFile(
                                        e.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            <div className="wdr-admin-users__edit-actions">
                                <Button
                                    variant="ghost"
                                    onClick={() => setContractFile(null)}
                                    disabled={uploadContractMutation.isPending}
                                >
                                    Reinitialiser
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => void uploadContract()}
                                    disabled={
                                        uploadContractMutation.isPending ||
                                        !contractFile
                                    }
                                >
                                    {uploadContractMutation.isPending
                                        ? 'Upload...'
                                        : 'Televerser le PDF'}
                                </Button>
                            </div>
                        </div>
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                Motif
                            </label>
                            <textarea
                                className="wdr-admin-users__input"
                                value={editForm.partnerRejectionReason}
                                onChange={(e) =>
                                    setEditForm((form) => ({
                                        ...form,
                                        partnerRejectionReason:
                                            e.target.value,
                                    }))
                                }
                                rows={3}
                            />
                        </div>
                        <div className="wdr-admin-users__edit-actions">
                            <Button
                                variant="ghost"
                                onClick={() => setEditingPartnerId(null)}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => void savePartner()}
                            >
                                {updateUserMutation.isPending
                                    ? 'Enregistrement...'
                                    : 'Enregistrer'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {editingUser && (
                <Modal
                    isOpen={!!editingUserId}
                    onClose={() => setEditingUserId(null)}
                    title={`Modifier - ${editingUser.firstName} ${editingUser.lastName}`}
                    size="md"
                >
                    <div className="wdr-admin-users__edit-form">
                        <Input
                            placeholder="Prenom"
                            value={generalEditForm.firstName}
                            onChange={(e) =>
                                setGeneralEditForm((form) => ({
                                    ...form,
                                    firstName: e.target.value,
                                }))
                            }
                        />
                        <Input
                            placeholder="Nom"
                            value={generalEditForm.lastName}
                            onChange={(e) =>
                                setGeneralEditForm((form) => ({
                                    ...form,
                                    lastName: e.target.value,
                                }))
                            }
                        />
                        <Input
                            type="email"
                            placeholder="Email"
                            value={generalEditForm.email}
                            onChange={(e) =>
                                setGeneralEditForm((form) => ({
                                    ...form,
                                    email: e.target.value,
                                }))
                            }
                        />
                        <Input
                            placeholder="Telephone"
                            value={generalEditForm.phoneNumber}
                            onChange={(e) =>
                                setGeneralEditForm((form) => ({
                                    ...form,
                                    phoneNumber: e.target.value,
                                }))
                            }
                        />
                        <Input
                            placeholder="Langue"
                            value={generalEditForm.language}
                            onChange={(e) =>
                                setGeneralEditForm((form) => ({
                                    ...form,
                                    language: e.target.value,
                                }))
                            }
                        />
                        {editingUser.role === 'CLIENT' && (
                            <Input
                                placeholder="Devise preferee"
                                value={generalEditForm.preferredCurrency}
                                onChange={(e) =>
                                    setGeneralEditForm((form) => ({
                                        ...form,
                                        preferredCurrency: e.target.value,
                                    }))
                                }
                            />
                        )}
                        <div className="wdr-admin-users__edit-actions">
                            <Button
                                variant="ghost"
                                onClick={() => setEditingUserId(null)}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => void saveGeneralUser()}
                            >
                                {updateUserMutation.isPending
                                    ? 'Enregistrement...'
                                    : 'Enregistrer'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Creer un compte utilisateur"
                size="md"
            >
                <div className="wdr-admin-users__edit-form">
                    <p className="wdr-admin-users__edit-intro">
                        Choisissez le type de compte puis completez les
                        informations utiles. Les champs partenaires
                        n’apparaissent que si le compte cree est un partenaire.
                    </p>

                    <div className="wdr-admin-users__form-section">
                        <div className="wdr-admin-users__form-section-head">
                            <h3 className="wdr-admin-users__form-section-title">
                                Type de compte
                            </h3>
                            <span className="wdr-admin-users__role-pill">
                                {createForm.role}
                            </span>
                        </div>
                        <select
                            className="wdr-admin-users__input"
                            value={createForm.role}
                            onChange={(e) =>
                                setCreateForm((form) => ({
                                    ...form,
                                    role: e.target.value as UserRole,
                                }))
                            }
                        >
                            <option value="PARTNER">Partenaire</option>
                            <option value="CLIENT">Client</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="wdr-admin-users__form-section">
                        <h3 className="wdr-admin-users__form-section-title">
                            Identite
                        </h3>
                        <div className="wdr-admin-users__form-grid">
                            <Input
                                placeholder="Prenom"
                                value={createForm.firstName}
                                onChange={(e) =>
                                    setCreateForm((form) => ({
                                        ...form,
                                        firstName: e.target.value,
                                    }))
                                }
                            />
                            <Input
                                placeholder="Nom"
                                value={createForm.lastName}
                                onChange={(e) =>
                                    setCreateForm((form) => ({
                                        ...form,
                                        lastName: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className="wdr-admin-users__form-section">
                        <h3 className="wdr-admin-users__form-section-title">
                            Compte
                        </h3>
                        <div className="wdr-admin-users__form-grid">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={createForm.email}
                                onChange={(e) =>
                                    setCreateForm((form) => ({
                                        ...form,
                                        email: e.target.value,
                                    }))
                                }
                            />
                            <Input
                                type="password"
                                placeholder="Mot de passe initial"
                                value={createForm.password}
                                onChange={(e) =>
                                    setCreateForm((form) => ({
                                        ...form,
                                        password: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className="wdr-admin-users__form-section">
                        <h3 className="wdr-admin-users__form-section-title">
                            Profil
                        </h3>
                        <div className="wdr-admin-users__form-grid">
                            <Input
                                placeholder="Langue"
                                value={createForm.language}
                                onChange={(e) =>
                                    setCreateForm((form) => ({
                                        ...form,
                                        language: e.target.value,
                                    }))
                                }
                            />
                            {isClientCreation && (
                                <Input
                                    placeholder="Devise preferee"
                                    value={createForm.preferredCurrency}
                                    onChange={(e) =>
                                        setCreateForm((form) => ({
                                            ...form,
                                            preferredCurrency: e.target.value,
                                        }))
                                    }
                                />
                            )}
                        </div>
                    </div>

                    {isPartnerCreation && (
                        <div className="wdr-admin-users__form-section wdr-admin-users__form-section--partner">
                            <div className="wdr-admin-users__form-section-head">
                                <h3 className="wdr-admin-users__form-section-title">
                                    Parametres partenaire
                                </h3>
                                <span className="wdr-admin-users__form-section-copy">
                                    Structure commerciale, commission et statut
                                    initial du partenaire.
                                </span>
                            </div>
                            <div className="wdr-admin-users__form-grid">
                                <Input
                                    placeholder="Societe"
                                    value={createForm.companyName}
                                    onChange={(e) =>
                                        setCreateForm((form) => ({
                                            ...form,
                                            companyName: e.target.value,
                                        }))
                                    }
                                />
                                <Input
                                    placeholder="Telephone"
                                    value={createForm.phoneNumber}
                                    onChange={(e) =>
                                        setCreateForm((form) => ({
                                            ...form,
                                            phoneNumber: e.target.value,
                                        }))
                                    }
                                />
                                <Input
                                    placeholder="Adresse professionnelle"
                                    value={createForm.businessAddress}
                                    onChange={(e) =>
                                        setCreateForm((form) => ({
                                            ...form,
                                            businessAddress: e.target.value,
                                        }))
                                    }
                                />
                                <Input
                                    type="number"
                                    min={20}
                                    max={30}
                                    step={1}
                                    placeholder="Commission (%)"
                                    value={createForm.commissionRate}
                                    onChange={(e) =>
                                        setCreateForm((form) => ({
                                            ...form,
                                            commissionRate: e.target.value,
                                        }))
                                    }
                                />
                                <select
                                    className="wdr-admin-users__input"
                                    value={createForm.partnerStatus}
                                    onChange={(e) =>
                                        setCreateForm((form) => ({
                                            ...form,
                                            partnerStatus: e.target
                                                .value as PartnerStatus,
                                        }))
                                    }
                                >
                                    <option value="PENDING">En attente</option>
                                    <option value="APPROVED">Valide</option>
                                    <option value="REJECTED">Refuse</option>
                                    <option value="SUSPENDED">Suspendu</option>
                                </select>
                                <select
                                    className="wdr-admin-users__input"
                                    value={createForm.mandateContractStatus}
                                    onChange={(e) =>
                                        setCreateForm((form) => ({
                                            ...form,
                                            mandateContractStatus: e.target
                                                .value as MandateContractStatus,
                                        }))
                                    }
                                >
                                    <option value="NOT_SENT">
                                        Contrat non envoye
                                    </option>
                                    <option value="PENDING_SIGNATURE">
                                        Contrat en attente de signature
                                    </option>
                                    <option value="SIGNED">
                                        Contrat signe
                                    </option>
                                    <option value="REJECTED">
                                        Contrat refuse
                                    </option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="wdr-admin-users__edit-actions">
                        <Button
                            variant="ghost"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => void createUser()}
                        >
                            {createUserMutation.isPending
                                ? 'Creation...'
                                : 'Creer le compte'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
