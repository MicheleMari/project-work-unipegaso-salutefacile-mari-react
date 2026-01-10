import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';
import codiciCatastali from '@/data/codici_catastali.json';
import type { EmergencyItem } from '@/components/dashboard/emergency-types';

type PatientDetails = {
    id: number;
    name: string;
    surname: string;
    fiscal_code?: string | null;
    residence_address?: string | null;
    phone?: string | null;
    email?: string | null;
};

type EmergencyDetailsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    emergency: EmergencyItem | null;
    investigationsById: Map<number, string>;
};

type CadastralCode = {
    codice: string;
    comune: string;
    provincia: string;
};

export function EmergencyDetailsDialog({
    open,
    onOpenChange,
    emergency,
    investigationsById,
}: EmergencyDetailsDialogProps) {
    const [patient, setPatient] = useState<PatientDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const codiceComuneMap = useMemo(() => {
        const entries = (codiciCatastali as CadastralCode[]).map((item) => [
            item.codice.toUpperCase(),
            { comune: item.comune, provincia: item.provincia },
        ]);
        return new Map(entries);
    }, []);

    const decodedCf = useMemo(
        () => decodeCodiceFiscale(patient?.fiscal_code ?? '', codiceComuneMap),
        [patient?.fiscal_code, codiceComuneMap],
    );

    useEffect(() => {
        if (!open) {
            setPatient(null);
            setError(null);
            setLoading(false);
            return;
        }

        if (!emergency?.patientId) {
            setPatient(null);
            setError('Anagrafica non disponibile');
            return;
        }

        setLoading(true);
        setError(null);
        apiRequest<PatientDetails>(`/api/patients/${emergency.patientId}`)
            .then((data) => {
                setPatient(data);
            })
            .catch((err) => {
                setError(err instanceof Error ? err.message : 'Errore nel caricamento anagrafica');
                setPatient(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [open, emergency?.patientId]);

    if (!emergency) return null;

    const patientLabel = emergency.paziente || 'Paziente sconosciuto';
    const accessReason = emergency.arrivo || 'Motivo accesso non indicato';
    const arrivalAt = formatDateTime(emergency.createdAt) || 'Non disponibile';
    const closedAt = formatDateTime(emergency.closedAt) || 'Non disponibile';
    const statusLabel = formatStatus(emergency.stato ?? '');
    const investigations = emergency.performedInvestigations ?? [];
    const specialistName = emergency.specialist
        ? `${emergency.specialist.name ?? ''} ${emergency.specialist.surname ?? ''}`.trim()
        : 'Non assegnato';
    const specialistDepartment = emergency.specialist?.department ?? 'Reparto non indicato';
    const specialistReport = emergency.result ?? null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Dettagli emergenza ER #{emergency.id}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-2">
                    <section className="rounded-lg border border-border/70 bg-muted/30 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold">Anagrafica paziente</h3>
                            <Badge variant="outline">{patientLabel}</Badge>
                        </div>
                        {loading ? (
                            <p className="mt-2 text-sm text-muted-foreground">Caricamento dati paziente...</p>
                        ) : error ? (
                            <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
                        ) : patient ? (
                            <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                                <DetailField label="Nome" value={patient.name} />
                                <DetailField label="Cognome" value={patient.surname} />
                                <DetailField label="Codice fiscale" value={patient.fiscal_code} />
                                <DetailField label="Data di nascita" value={decodedCf?.birthDateFormatted} />
                                <DetailField label="Eta" value={decodedCf?.age ? `${decodedCf.age} anni` : undefined} />
                                <DetailField label="Sesso" value={decodedCf?.gender} />
                                <DetailField label="Comune di nascita" value={decodedCf?.birthPlace} />
                                <DetailField label="Indirizzo" value={patient.residence_address} />
                                <DetailField label="Telefono" value={patient.phone} />
                                <DetailField label="Email" value={patient.email} />
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">Nessun dato disponibile.</p>
                        )}
                    </section>

                    <section className="rounded-lg border border-border/70 bg-background p-4">
                        <h3 className="text-sm font-semibold">Dettagli emergenza</h3>
                        <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                            <DetailField label="Codice ingresso" value={emergency.codice} />
                            <DetailField label="Stato" value={statusLabel || 'Non disponibile'} />
                            <DetailField label="Motivo accesso" value={accessReason} />
                            <DetailField label="Data/ora arrivo" value={arrivalAt} />
                            <DetailField label="Data/ora chiusura" value={closedAt} />
                            <DetailField
                                label="Destinazione"
                                value={emergency.destinazione || 'Non disponibile'}
                            />
                            <DetailField
                                label="Reparto ricovero"
                                value={emergency.admissionDepartment || 'Non indicato'}
                            />
                            <DetailField
                                label="Arrivo da 118"
                                value={emergency.isFrom118 ? 'Si' : 'No'}
                            />
                        </div>
                    </section>

                    <section className="rounded-lg border border-border/70 bg-background p-4">
                        <h3 className="text-sm font-semibold">Accertamenti preliminari</h3>
                        <div className="mt-3 space-y-2 text-sm">
                            {investigations.length === 0 ? (
                                <p className="text-muted-foreground">Nessun accertamento registrato.</p>
                            ) : (
                                investigations.map((inv) => {
                                    const title =
                                        investigationsById.get(inv.investigation_id) ??
                                        `Accertamento #${inv.investigation_id}`;
                                    return (
                                        <div
                                            key={inv.id}
                                            className="rounded-md border border-border/60 bg-muted/30 p-3"
                                        >
                                            <p className="font-medium">{title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Eseguito: {formatDateTime(inv.performed_at) || 'Non disponibile'}
                                            </p>
                                            <p className="mt-1">Esito: {inv.outcome?.trim() || 'In attesa'}</p>
                                            {inv.notes ? (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Note: {inv.notes}
                                                </p>
                                            ) : null}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    <section className="rounded-lg border border-border/70 bg-background p-4">
                        <h3 className="text-sm font-semibold">Specialista e referto</h3>
                        <div className="mt-2 space-y-2 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs text-muted-foreground">Specialista</span>
                                <span className="font-medium">{specialistName}</span>
                                <span className="text-xs text-muted-foreground">|</span>
                                <span className="text-xs text-muted-foreground">{specialistDepartment}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Data referto: {formatDateTime(specialistReport?.reported_at) || 'Non disponibile'}
                            </p>
                            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
                                <p className="text-xs text-muted-foreground">Referto</p>
                                <p className="font-medium">
                                    {specialistReport?.notes?.trim() || 'Non disponibile'}
                                </p>
                            </div>
                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="rounded-md border border-border/60 bg-muted/30 p-3">
                                    <p className="text-xs text-muted-foreground">Indicazioni</p>
                                    <p className="font-medium">
                                        {specialistReport?.disposition?.trim() || 'Non disponibili'}
                                    </p>
                                </div>
                                <div className="rounded-md border border-border/60 bg-muted/30 p-3">
                                    <p className="text-xs text-muted-foreground">Follow up</p>
                                    <p className="font-medium">
                                        {specialistReport?.needs_follow_up ? 'Si' : 'No'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="grid gap-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{value || 'Non disponibile'}</p>
        </div>
    );
}

type DecodedCodiceFiscale = {
    birthDateFormatted: string;
    age: number;
    gender: 'M' | 'F';
    birthPlace: string;
};

function decodeCodiceFiscale(
    cf: string,
    cadastralMap: Map<string, { comune: string; provincia: string }>,
): DecodedCodiceFiscale | null {
    const cleaned = cf.trim().toUpperCase();
    if (cleaned.length < 16) return null;

    const yearPart = cleaned.slice(6, 8);
    const monthLetter = cleaned.charAt(8);
    const dayPart = cleaned.slice(9, 11);
    const comuneCode = cleaned.slice(11, 15);

    const months: Record<string, number> = {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
        E: 5,
        H: 6,
        L: 7,
        M: 8,
        P: 9,
        R: 10,
        S: 11,
        T: 12,
    };

    const yearNum = Number.parseInt(yearPart, 10);
    const monthNum = months[monthLetter];
    const dayNumRaw = Number.parseInt(dayPart, 10);

    if (!Number.isFinite(yearNum) || !monthNum || !Number.isFinite(dayNumRaw)) return null;

    const isFemale = dayNumRaw > 40;
    const day = isFemale ? dayNumRaw - 40 : dayNumRaw;
    const currentYear = new Date().getFullYear();
    const currentYearTwoDigits = currentYear % 100;
    const century = yearNum <= currentYearTwoDigits ? 2000 : 1900;
    const year = century + yearNum;

    const birthDate = new Date(year, monthNum - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
    }

    const comuneData = cadastralMap.get(comuneCode);
    const birthPlace = comuneData
        ? `${comuneData.comune} (${comuneData.provincia})`
        : comuneCode || 'ND';

    const birthDateFormatted = birthDate.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    return {
        birthDateFormatted,
        age,
        gender: isFemale ? 'F' : 'M',
        birthPlace,
    };
}

function formatStatus(status: string) {
    if (!status) return '';
    if (status === 'referto_inviato') return 'Referto inviato';
    const normalized = status.replace(/\./g, '').toLowerCase();
    if (normalized === 'ricovero') return 'Ricovero';
    if (normalized === 'chiusura') return 'Chiusura';
    if (normalized === 'obi') return 'O.B.I.';
    const spaced = status.replace(/_/g, ' ').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatDateTime(dateStr?: string | null) {
    if (!dateStr) return '';
    const value = new Date(dateStr);
    if (Number.isNaN(value.getTime())) return '';
    return value.toLocaleString('it-IT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}
