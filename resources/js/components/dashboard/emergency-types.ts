import type { InvestigationPerformed } from '@/components/dashboard/investigation-cards/types';

export type EmergencyItem = {
    id: number | string;
    patientId?: number | string;
    paziente: string;
    codice: 'Rosso' | 'Giallo' | 'Verde';
    arrivo: string;
    attesa: string;
    destinazione: string;
    stato: string;
    createdAt?: string;
    isFrom118?: boolean;
    performedInvestigationIds: number[];
    performedInvestigations: InvestigationPerformed[];
    specialist?: {
        id: number;
        name: string;
        surname?: string;
        department?: string | null;
        avatar?: string | null;
        isAvailable?: boolean | null;
        calledAt?: string | undefined;
    } | null;
    result?: {
        notes?: string | null;
        disposition?: string | null;
        needs_follow_up?: boolean | null;
        reported_at?: string | null;
    } | null;
};
