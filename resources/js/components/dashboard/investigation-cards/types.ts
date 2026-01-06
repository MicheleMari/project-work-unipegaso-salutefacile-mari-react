export type InvestigationPerformed = {
    id: number;
    emergency_id: number;
    investigation_id: number;
    performed_by: number;
    performed_at?: string | null;
    outcome?: string | null;
    notes?: string | null;
};

export type SpecialistProfile = {
    id: number;
    name: string;
    surname: string;
    department: string;
    avatar?: string;
    availability: 'available' | 'busy';
};

export type SpecialistCallDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    specialists: SpecialistProfile[];
    patientName?: string;
    loading?: boolean;
    error?: string | null;
    onCall: (specialistId: number) => Promise<void> | void;
    calling?: boolean;
    callError?: string | null;
};

export type SpecialistCallResult = {
    emergencyId: number | string;
    status?: string | null;
    specialist: {
        id: number;
        name: string;
        surname?: string;
        department?: string | null;
        avatar?: string | null;
        isAvailable?: boolean | null;
        calledAt?: string | null;
    } | null;
};

export type CallSpecialistResponse = {
    id: number;
    status?: string | null;
    specialist_called_at?: string | null;
    specialist?: {
        id: number;
        name: string;
        surname?: string | null;
        department?: {
            id: number;
            name?: string | null;
        } | null;
        avatar?: string | null;
        is_available?: boolean | null;
    } | null;
};

export type UserOption = {
    id: number;
    name: string;
    surname?: string;
    department_id?: number | null;
    avatar?: string | null;
    is_available?: boolean | null;
};

export type DepartmentOption = {
    id: number | string;
    name?: string | null;
};

export type SpecialistInvestigationOption = {
    id: number;
    title: string;
    description?: string | null;
    department_id?: number | null;
    department?: { id: number; name?: string | null } | null;
};

export type AdvancedInvestigationsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    options: SpecialistInvestigationOption[];
    loading?: boolean;
    error?: string | null;
    selected: Set<number>;
    onToggle: (id: number) => void;
    onConfirm: () => Promise<void> | void;
    submitting?: boolean;
};

export type InvestigationCardProps = {
    perf: InvestigationPerformed;
    title: string;
    value: string;
    files: File[];
    isUploadOpen: boolean;
    saving: boolean;
    lastOutcome?: string | null;
    onToggleUpload: () => void;
    onOutcomeChange: (value: string) => void;
    onSave: () => void;
    onFilesSelected: (files: File[]) => void;
};
