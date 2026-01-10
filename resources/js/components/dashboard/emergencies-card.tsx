import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useMemo, useState } from 'react';
import { PatientDetailsDialog } from '@/components/dashboard/patient-details-dialog';
import {
    PreliminaryExamsDialog,
    type PreliminaryExam,
} from '@/components/dashboard/preliminary-exams-dialog';
import { EmergenciesFilter } from '@/components/dashboard/emergencies-filter';
import { InvestigationStatusDialog } from '@/components/dashboard/investigation-status-dialog';
import { type InvestigationPerformed, type SpecialistCallResult } from '@/components/dashboard/investigation-cards/types';
import { patchJson, postJson } from '@/lib/api';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import { DischargePreviewDialog } from '@/components/dashboard/discharge-preview-dialog';
import { AdmissionPreviewDialog } from '@/components/dashboard/admission-preview-dialog';
import { EmergencyCardItem } from '@/components/dashboard/emergency-card-item';
import type { EmergencyItem } from '@/components/dashboard/emergency-types';
import { EmergencyDetailsDialog } from '@/components/dashboard/emergency-details-dialog';

type EmergenciesCardProps = {
    items: EmergencyItem[];
    investigations: PreliminaryExam[];
    onInvestigationsRecorded?: (emergencyId: number, records: InvestigationPerformed[]) => void;
    onSpecialistCalled?: (payload: SpecialistCallResult) => void;
    onEmergencyUpdated?: (payload: {
        id: number | string;
        status?: string | null;
        admissionDepartment?: string | null;
        closedAt?: string;
    }) => void;
    title?: string;
    description?: string;
    showInvestigationActions?: boolean;
    showSpecialistActions?: boolean;
};

const codiceBadgeClasses: Record<EmergencyItem['codice'], string> = {
    Rosso: 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/50 dark:text-red-200',
    Arancio:
        'border-orange-200 bg-orange-500/10 text-orange-700 dark:border-orange-900/50 dark:text-orange-200',
    Giallo:
        'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/50 dark:text-amber-200',
    Verde:
        'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-200',
    Bianco: 'border-slate-200 bg-slate-200/50 text-slate-700 dark:border-slate-700 dark:text-slate-100',
};

const statusBadgeClasses: Record<string, string> = {
    'In triage': 'bg-sky-500/10 text-sky-700 dark:text-sky-200',
    'In valutazione': 'bg-amber-500/10 text-amber-700 dark:text-amber-200',
    'Dimesso': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
    'In trattamento': 'bg-purple-500/10 text-purple-700 dark:text-purple-200',
    'Emergenze in corso': 'bg-blue-500/10 text-blue-700 dark:text-blue-200',
    'Accertamenti preliminari in corso': 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-100',
    'Specialista chiamato': 'bg-blue-500/15 text-blue-800 dark:text-blue-100',
    'Risolto in ambulanza': 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-100',
    'Referto inviato': 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-100',
    Dimissione: 'bg-blue-500/10 text-blue-700 dark:text-blue-200',
    Ricovero: 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-100',
    Chiusura: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-100',
    'O.B.I.': 'bg-purple-500/15 text-purple-800 dark:text-purple-100',
};

export function EmergenciesCard({
    items,
    investigations,
    onInvestigationsRecorded,
    onSpecialistCalled,
    onEmergencyUpdated,
    title = 'Emergenze in corso',
    description = 'Monitoraggio arrivi, codice colore e destinazioni',
    showInvestigationActions = true,
    showSpecialistActions = true,
}: EmergenciesCardProps) {
    const page = usePage<{ props: SharedData }>();
    const currentUserId = page?.props?.auth?.user?.id ?? null;
    const [flowOpen, setFlowOpen] = useState(false);
    const [selected, setSelected] = useState<EmergencyItem | null>(null);
    const [patientDialogOpen, setPatientDialogOpen] = useState(false);
    const [patientDialogId, setPatientDialogId] = useState<number | string | undefined>();
    const [patientDialogName, setPatientDialogName] = useState('');
    const [codeFilter, setCodeFilter] = useState<'all' | EmergencyItem['codice']>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
    const [waitFilter, setWaitFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
    const [now, setNow] = useState(() => Date.now());
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [outcomeDrafts, setOutcomeDrafts] = useState<Record<number, string>>({});
    const [calledSpecialist, setCalledSpecialist] = useState<{
        emergencyId: number | string;
        specialist: NonNullable<EmergencyItem['specialist']>;
    } | null>(null);
    const [calledSpecialistDialogOpen, setCalledSpecialistDialogOpen] = useState(false);
    const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false);
    const [dischargeItem, setDischargeItem] = useState<EmergencyItem | null>(null);
    const [dischargeAt, setDischargeAt] = useState<string>('');
    const [dischargeEmail, setDischargeEmail] = useState('');
    const [dischargeEmailError, setDischargeEmailError] = useState<string | null>(null);
    const [admissionDialogOpen, setAdmissionDialogOpen] = useState(false);
    const [admissionItem, setAdmissionItem] = useState<EmergencyItem | null>(null);
    const [admissionAt, setAdmissionAt] = useState<string>('');
    const [admissionEmail, setAdmissionEmail] = useState('');
    const [admissionEmailError, setAdmissionEmailError] = useState<string | null>(null);
    const [omiUpdatingId, setOmiUpdatingId] = useState<number | null>(null);
    const [omiError, setOmiError] = useState<string | null>(null);
    const [ricoveriDialogOpen, setRicoveriDialogOpen] = useState(false);
    const [dimissioniDialogOpen, setDimissioniDialogOpen] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [detailsItem, setDetailsItem] = useState<EmergencyItem | null>(null);

    const isOmi = (item: EmergencyItem) =>
        (item.stato ?? '').replace(/\./g, '').toLowerCase() === 'obi';
    const isRicovero = (item: EmergencyItem) =>
        (item.stato ?? '').replace(/\./g, '').toLowerCase() === 'ricovero';
    const isDimissione = (item: EmergencyItem) =>
        (item.stato ?? '').replace(/\./g, '').toLowerCase().includes('dimissione');
    const isClosing = (item: EmergencyItem) =>
        (item.stato ?? '').replace(/\./g, '').toLowerCase() === 'chiusura' || isOmi(item);

    useEffect(() => {
        const interval = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(interval);
    }, []);

    const averageTriageTime = useMemo(() => {
        const durations = items
            .map((item) => {
                if (!item.createdAt) return null;
                const created = new Date(item.createdAt).getTime();
                if (Number.isNaN(created)) return null;
                return Math.max(0, now - created);
            })
            .filter((value): value is number => value !== null);

        if (durations.length === 0) return '--:--';
        const avg = durations.reduce((sum, ms) => sum + ms, 0) / durations.length;
        return formatDuration(avg);
    }, [items, now]);

    const getDisplayStatus = (item: EmergencyItem) => {
        const normalized = (item.stato ?? '').replace(/\./g, '').toLowerCase();
        if (normalized === 'ricovero') return 'ricovero';
        if (normalized === 'chiusura') return 'Chiusura';
        if (normalized === 'obi') return 'obi';
        if (normalized.includes('dimission')) return 'Dimissione';
        if (item.specialist?.id) return 'Specialista chiamato';
        if (item.performedInvestigationIds.length > 0) return 'Accertamenti preliminari in corso';
        return item.stato;
    };

    const codiceOptions = useMemo(
        () => Array.from(new Set(items.map((item) => item.codice))) as EmergencyItem['codice'][],
        [items],
    );
    const statusOptions = useMemo(
        () =>
            Array.from(
                new Set(
                    items.map((item) => formatStatus(getDisplayStatus(item))),
                ),
            ).filter(Boolean),
        [items],
    );
    const investigationsById = useMemo(() => {
        const entries = investigations.map((exam) => [Number(exam.id), exam.title] as const);
        return new Map<number, string>(entries);
    }, [investigations]);

    const filteredItems = useMemo(
        () =>
            items.filter(
                (item) =>
                    !isRicovero(item) &&
                    !isDimissione(item) &&
                    (codeFilter === 'all' || item.codice === codeFilter) &&
                    (statusFilter === 'all' ||
                        formatStatus(getDisplayStatus(item)) === statusFilter) &&
                    (waitFilter === 'all' || getWaitTone(item, now).tone === waitFilter),
            ),
        [items, codeFilter, statusFilter, waitFilter, now],
    );
    const ricoveriItems = useMemo(() => items.filter(isRicovero), [items]);
    const dimissioniItems = useMemo(() => items.filter(isDimissione), [items]);

    const openPatientDetails = (patientId?: number | string, patientName?: string) => {
        setPatientDialogId(patientId);
        setPatientDialogName(patientName ?? '');
        setPatientDialogOpen(true);
    };

    const handleOpenFlow = (item: EmergencyItem) => {
        setSelected(item);
        setFlowOpen(true);
    };

    const handleOpenStatus = (item: EmergencyItem) => {
        setSelected(item);
        const drafts = Object.fromEntries(
            (item.performedInvestigations ?? []).map((perf) => [perf.id, perf.outcome ?? '']),
        );
        setOutcomeDrafts(drafts);
        setStatusDialogOpen(true);
    };

    const handleSpecialistCalled = (payload: SpecialistCallResult) => {
        const specialist =
            payload.specialist && payload.specialist.id
                ? {
                      id: payload.specialist.id,
                      name: payload.specialist.name,
                      surname: payload.specialist.surname ?? '',
                      department: payload.specialist.department ?? null,
                      avatar: payload.specialist.avatar ?? null,
                      isAvailable: payload.specialist.isAvailable ?? null,
                      calledAt: payload.specialist.calledAt ?? undefined,
                  }
                : null;

        setSelected((prev) =>
            prev && prev.id === payload.emergencyId
                ? { ...prev, specialist, stato: payload.status ?? prev.stato }
                : prev,
        );
        onSpecialistCalled?.(payload);
    };

    const handleAdmissionUpdated = (payload: {
        id: number | string;
        status?: string | null;
        admissionDepartment?: string | null;
        closedAt?: string;
    }) => {
        onEmergencyUpdated?.(payload);
    };

    const openSpecialistDetails = (item: EmergencyItem) => {
        if (!item.specialist) return;
        setCalledSpecialist({ emergencyId: item.id, specialist: item.specialist });
        setCalledSpecialistDialogOpen(true);
    };
    const openDischargePreview = (item: EmergencyItem) => {
        setDischargeItem(item);
        setDischargeAt(new Date().toISOString());
        setDischargeEmail('');
        setDischargeEmailError(null);
        setDischargeDialogOpen(true);
    };
    const openAdmissionPreview = (item: EmergencyItem) => {
        setAdmissionItem(item);
        setAdmissionAt(new Date().toISOString());
        setAdmissionEmail('');
        setAdmissionEmailError(null);
        setAdmissionDialogOpen(true);
    };
    const openEmergencyDetails = (item: EmergencyItem) => {
        setDetailsItem(item);
        setDetailsDialogOpen(true);
        setRicoveriDialogOpen(false);
    };

    const handleSetOmi = async (item: EmergencyItem) => {
        const emergencyId = Number(item.id);
        if (Number.isNaN(emergencyId)) {
            setOmiError('Identificativo emergenza non valido');
            return;
        }

        setOmiUpdatingId(emergencyId);
        setOmiError(null);
        try {
            const updated = await patchJson<{ id: number | string; status?: string | null }>(
                `/api/emergencies/${emergencyId}`,
                { status: 'obi' },
            );
            const updatedStatus = updated.status ?? 'obi';
            onEmergencyUpdated?.({ id: updated.id ?? emergencyId, status: updatedStatus });
            setSelected((prev) =>
                prev && Number(prev.id) === emergencyId ? { ...prev, stato: updatedStatus } : prev,
            );
        } catch (err) {
            setOmiError(err instanceof Error ? err.message : 'Errore durante l aggiornamento');
        } finally {
            setOmiUpdatingId(null);
        }
    };

    const handleConfirmInvestigations = async (examIds: string[]) => {
        if (!selected?.id) {
            throw new Error('Emergenza non selezionata');
        }
        if (!currentUserId) {
            throw new Error('Sessione non valida: effettua di nuovo il login');
        }

        const emergencyId = Number(selected.id);
        if (Number.isNaN(emergencyId)) {
            throw new Error('Identificativo emergenza non valido');
        }

        const alreadyRequested = new Set(
            (selected.performedInvestigations ?? []).map((inv) => Number(inv.investigation_id)),
        );
        const duplicateIds = examIds.filter((id) => alreadyRequested.has(Number(id)));
        if (duplicateIds.length > 0) {
            throw new Error('Hai selezionato accertamenti già richiesti');
        }

        const created = await Promise.all(
            examIds.map((examId) =>
                postJson<InvestigationPerformed>('/api/investigations-performed', {
                    emergency_id: emergencyId,
                    investigation_id: Number(examId),
                    performed_by: currentUserId,
                }),
            ),
        );

        setSelected((prev) =>
            prev
                ? {
                      ...prev,
                      performedInvestigationIds: [
                          ...prev.performedInvestigationIds,
                          ...created.map((c) => c.investigation_id),
                      ],
                      performedInvestigations: [...prev.performedInvestigations, ...created],
                  }
                : prev,
        );
        onInvestigationsRecorded?.(emergencyId, created);
    };

    const handleAdvancedInvestigationsRequest = async (investigationIds: number[]) => {
        if (!investigationIds.length) {
            return;
        }
        if (!selected?.id) {
            throw new Error('Emergenza non selezionata');
        }
        if (!currentUserId) {
            throw new Error('Sessione non valida: effettua di nuovo il login');
        }

        const emergencyId = Number(selected.id);
        if (Number.isNaN(emergencyId)) {
            throw new Error('Identificativo emergenza non valido');
        }

        await Promise.all(
            investigationIds.map((investigationId) =>
                postJson('/api/specialist-investigation-requests', {
                    emergency_id: emergencyId,
                    specialist_investigation_id: Number(investigationId),
                    requested_by: currentUserId,
                    status: 'requested',
                    requested_at: new Date().toISOString(),
                }),
            ),
        );
    };

    const handleSaveOutcome = async (performed: InvestigationPerformed) => {
        if (!currentUserId) {
            throw new Error('Sessione non valida: effettua di nuovo il login');
        }
        const emergencyId = Number(performed.emergency_id);
        try {
            const updated = await patchJson<InvestigationPerformed>(
                `/api/investigations-performed/${performed.id}`,
                {
                    emergency_id: emergencyId,
                    investigation_id: performed.investigation_id,
                    performed_by: currentUserId,
                    performed_at: performed.performed_at ?? null,
                    outcome: outcomeDrafts[performed.id] ?? '',
                    notes: performed.notes ?? null,
                },
            );

            setSelected((prev) => {
                if (!prev) return prev;
                const list = prev.performedInvestigations.map((item) =>
                    item.id === performed.id ? updated : item,
                );
                return {
                    ...prev,
                    performedInvestigations: list,
                };
            });
            if (emergencyId && onInvestigationsRecorded) {
                onInvestigationsRecorded(emergencyId, [updated]);
            }
        } catch (err) {
            throw err;
        }
    };

    return (
        <>
            <Card className="xl:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setRicoveriDialogOpen(true)}
                        >
                            Ricoveri
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setDimissioniDialogOpen(true)}
                        >
                            Dimissioni
                        </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            className="border-blue-200 bg-blue-500/10 text-blue-700 dark:border-blue-900/50 dark:text-blue-200"
                        >
                            Tempo medio triage {averageTriageTime}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <EmergenciesFilter
                        codeFilter={codeFilter}
                        statusFilter={statusFilter}
                        waitFilter={waitFilter}
                        codiceOptions={codiceOptions}
                        statusOptions={statusOptions}
                        onCodeChange={setCodeFilter}
                        onStatusChange={setStatusFilter}
                        onWaitChange={setWaitFilter}
                    />
                    {omiError ? <p className="text-xs font-medium text-red-600">{omiError}</p> : null}

                    {filteredItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nessuna emergenza presente</p>
                    ) : (
                        filteredItems.map((item) => {
                            const waitTone = getWaitTone(item, now);
                            const displayStatus = formatStatus(getDisplayStatus(item));
                            return (
                                <EmergencyCardItem
                                    key={item.id}
                                    item={item}
                                    codiceClassName={codiceBadgeClasses[item.codice]}
                                    statusClassName={statusBadgeClasses[displayStatus] ?? ''}
                                    displayStatus={displayStatus}
                                    waitElapsed={formatElapsed(item.createdAt, now)}
                                    waitTone={waitTone}
                                    showInvestigationActions={showInvestigationActions}
                                    allowInvestigationActions={showInvestigationActions && (!isClosing(item) || isOmi(item))}
                                    showSpecialistActions={showSpecialistActions}
                                    isClosing={isClosing(item)}
                                    showSpecialistOutcomeLink={showInvestigationActions}
                                    showOmiAction={(item.stato ?? '').replace(/\./g, '').toLowerCase() !== 'obi'}
                                    omiLoading={omiUpdatingId === Number(item.id)}
                                    onOpenPatientDetails={openPatientDetails}
                                    onOpenFlow={handleOpenFlow}
                                    onOpenStatus={handleOpenStatus}
                                    onOpenSpecialist={openSpecialistDetails}
                                    onOpenDetails={openEmergencyDetails}
                                    onOpenDischarge={openDischargePreview}
                                    onOpenAdmission={openAdmissionPreview}
                                    onSetOmi={handleSetOmi}
                                />
                            );
                        })
                    )}
                </CardContent>
            </Card>

            {showInvestigationActions ? (
                <>
                    <PreliminaryExamsDialog
                        open={flowOpen}
                        patientName={selected?.paziente ?? ''}
                        investigations={investigations}
                        onConfirm={handleConfirmInvestigations}
                        onOpenChange={(open) => {
                            setFlowOpen(open);
                            if (!open) {
                                setSelected(null);
                            }
                        }}
                    />

                    <InvestigationStatusDialog
                        open={statusDialogOpen}
                        emergencyId={selected?.id}
                        patientName={selected?.paziente ?? ''}
                        investigations={investigations}
                        performed={selected?.performedInvestigations ?? []}
                        outcomeDrafts={outcomeDrafts}
                        onOutcomeChange={(id, value) =>
                            setOutcomeDrafts((prev) => ({
                                ...prev,
                                [id]: value,
                            }))
                        }
                        onSave={handleSaveOutcome}
                        onSpecialistCalled={handleSpecialistCalled}
                        onAdvancedInvestigationsSelect={handleAdvancedInvestigationsRequest}
                        onOpenChange={(open) => {
                            setStatusDialogOpen(open);
                        }}
                    />
                </>
            ) : null}

            <PatientDetailsDialog
                open={patientDialogOpen}
                patientId={patientDialogId}
                patientName={patientDialogName}
                onOpenChange={setPatientDialogOpen}
            />
            {showSpecialistActions ? (
                <SpecialistDetailsDialog
                    open={calledSpecialistDialogOpen}
                    onOpenChange={setCalledSpecialistDialogOpen}
                    specialistData={calledSpecialist}
                />
            ) : null}
            <DischargePreviewDialog
                open={dischargeDialogOpen}
                onOpenChange={(open) => {
                    setDischargeDialogOpen(open);
                    if (!open) {
                        setDischargeItem(null);
                    }
                }}
                emergency={dischargeItem}
                dischargeAt={dischargeAt}
                investigationsById={investigationsById}
                operatorName={formatUserName(page?.props?.auth?.user)}
                operatorEmail={page?.props?.auth?.user?.email ?? ''}
                emailValue={dischargeEmail}
                emailError={dischargeEmailError}
                onEmailChange={setDischargeEmail}
                onEmailError={setDischargeEmailError}
                onEmergencyUpdated={onEmergencyUpdated}
            />
            <AdmissionPreviewDialog
                open={admissionDialogOpen}
                onOpenChange={(open) => {
                    setAdmissionDialogOpen(open);
                    if (!open) {
                        setAdmissionItem(null);
                    }
                }}
                emergency={admissionItem}
                admissionAt={admissionAt}
                admissionDepartment={admissionItem?.admissionDepartment ?? null}
                readOnly={
                    (admissionItem?.stato ?? '').replace(/\./g, '').toLowerCase() === 'ricovero'
                }
                investigationsById={investigationsById}
                operatorName={formatUserName(page?.props?.auth?.user)}
                operatorEmail={page?.props?.auth?.user?.email ?? ''}
                emailValue={admissionEmail}
                emailError={admissionEmailError}
                onEmailChange={setAdmissionEmail}
                onEmailError={setAdmissionEmailError}
                onEmergencyUpdated={handleAdmissionUpdated}
            />
            <StatusListDialog
                open={ricoveriDialogOpen}
                onOpenChange={setRicoveriDialogOpen}
                title="Ricoveri"
                items={ricoveriItems}
                onItemClick={openEmergencyDetails}
            />
            <StatusListDialog
                open={dimissioniDialogOpen}
                onOpenChange={setDimissioniDialogOpen}
                title="Dimissioni"
                items={dimissioniItems}
                onItemClick={openEmergencyDetails}
            />
            <EmergencyDetailsDialog
                open={detailsDialogOpen}
                onOpenChange={(open) => {
                    setDetailsDialogOpen(open);
                    if (!open) {
                        setDetailsItem(null);
                    }
                }}
                emergency={detailsItem}
                investigationsById={investigationsById}
            />
        </>
    );
}

function StatusListDialog({
    open,
    onOpenChange,
    title,
    items,
    onItemClick,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    items: EmergencyItem[];
    onItemClick?: (item: EmergencyItem) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                    {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nessuna emergenza presente.</p>
                    ) : (
                        items.map((item) => {
                            const content = (
                                <>
                                    <div className="space-y-1 text-left">
                                        <p className="text-sm font-semibold">{item.paziente}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.arrivo || 'Motivo accesso non indicato'}
                                        </p>
                                        {item.admissionDepartment ? (
                                            <p className="text-xs text-muted-foreground">
                                                Reparto: {item.admissionDepartment}
                                            </p>
                                        ) : null}
                                    </div>
                                    <Badge variant="outline" className={codiceBadgeClasses[item.codice]}>
                                        {item.codice}
                                    </Badge>
                                </>
                            );

                            if (onItemClick) {
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => onItemClick(item)}
                                        className="flex w-full flex-wrap items-start justify-between gap-3 rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-left transition hover:border-primary/40"
                                    >
                                        {content}
                                    </button>
                                );
                            }

                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border/70 bg-background/70 px-3 py-2"
                                >
                                    {content}
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

type SpecialistDetailsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    specialistData: {
        emergencyId: number | string;
        specialist: NonNullable<EmergencyItem['specialist']>;
    } | null;
};

function SpecialistDetailsDialog({ open, onOpenChange, specialistData }: SpecialistDetailsDialogProps) {
    const specialist = specialistData?.specialist;
    const [reminding, setReminding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!specialist) {
        return null;
    }

    const handleRemind = async () => {
        if (!specialistData) return;
        setReminding(true);
        setError(null);
        try {
            await postJson(`/api/emergencies/${specialistData.emergencyId}/remind-specialist`, {});
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante il sollecito');
        } finally {
            setReminding(false);
        }
    };

    const initials = `${specialist.name?.[0] ?? ''}${specialist.surname?.[0] ?? ''}`.trim() || '?';
    const calledAtText = formatSince(specialist.calledAt);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Specialista chiamato</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                        <AvatarImage src={specialist.avatar ?? undefined} alt={`${specialist.name} ${specialist.surname}`} />
                        <AvatarFallback className="text-base font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-foreground">
                            {specialist.name} {specialist.surname}
                        </p>
                        <p className="text-xs text-muted-foreground">{specialist.department ?? 'Reparto non indicato'}</p>
                        <p className="text-xs text-muted-foreground">
                            Chiamato {calledAtText ? `${calledAtText} fa` : '—'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span
                        className={`inline-flex w-fit items-center gap-2 rounded-full px-2 py-1 text-[11px] font-medium ${
                            specialist.isAvailable
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200'
                                : 'bg-amber-500/15 text-amber-800 dark:text-amber-100'
                        }`}
                    >
                        <span
                            className={`size-2 rounded-full ${
                                specialist.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                        />
                        {specialist.isAvailable ? 'Disponibile' : 'Occupato'}
                    </span>
                    <Button variant="outline" onClick={handleRemind} disabled={reminding}>
                        {reminding ? 'Invio...' : 'Sollecita'}
                    </Button>
                </div>
                {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
            </DialogContent>
        </Dialog>
    );
}

function formatStatus(status: string) {
    if (!status) return '';
    if (status === 'referto_inviato') return 'Referto inviato';
    const normalized = status.replace(/\./g, '').toLowerCase();
    if (normalized === 'ricovero') return 'Ricovero';
    if (normalized === 'chiusura') return 'Chiusura';
    if (normalized === 'obi') return 'O.B.I.';
    if (normalized.includes('dimission')) return 'Dimissione';
    const spaced = status.replace(/_/g, ' ').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatSince(date?: string) {
    if (!date) return '';
    const target = new Date(date).getTime();
    if (Number.isNaN(target)) return '';
    const diffMs = Date.now() - target;
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return 'pochi secondi';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    return remMinutes ? `${hours}h ${remMinutes}m` : `${hours}h`;
}

function formatElapsed(createdAt: EmergencyItem['createdAt'], nowMs: number) {
    if (!createdAt) return '--:--';
    const created = new Date(createdAt).getTime();
    if (Number.isNaN(created)) return '--:--';

    const diff = Math.max(0, nowMs - created);
    const hours = Math.floor(diff / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    const seconds = Math.floor((diff % 60_000) / 1_000);

    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatDuration(durationMs: number) {
    const safeDuration = Math.max(0, durationMs);
    const hours = Math.floor(safeDuration / 3_600_000);
    const minutes = Math.floor((safeDuration % 3_600_000) / 60_000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function formatUserName(user?: SharedData['auth']['user']) {
    if (!user) return 'Operatore pronto soccorso';
    return `${user.name ?? ''} ${user.surname ?? ''}`.trim() || 'Operatore pronto soccorso';
}


function getWaitTone(item: EmergencyItem, nowMs: number) {
    const elapsedMs = (() => {
        if (!item.createdAt) return null;
        const created = new Date(item.createdAt).getTime();
        return Number.isNaN(created) ? null : Math.max(0, nowMs - created);
    })();

    const thresholdsMs: Record<EmergencyItem['codice'], { green: number; yellow: number }> = {
        Rosso: { green: 5 * 60_000, yellow: 10 * 60_000 }, // immediato
        Arancio: { green: 7 * 60_000, yellow: 20 * 60_000 },
        Giallo: { green: 10 * 60_000, yellow: 30 * 60_000 },
        Verde: { green: 60 * 60_000, yellow: 120 * 60_000 },
        Bianco: { green: 120 * 60_000, yellow: 180 * 60_000 },
    };

    const { green, yellow } = thresholdsMs[item.codice];

    if (elapsedMs === null) {
        return { className: 'bg-muted text-muted-foreground', icon: 'none' as const, tone: 'yellow' as const };
    }

    if (elapsedMs <= green) {
        return {
            className: 'bg-emerald-500/20 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100',
            icon: 'none' as const,
            tone: 'green' as const,
        };
    }

    if (elapsedMs <= yellow) {
        return {
            className: 'bg-amber-500/20 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100',
            icon: 'none' as const,
            tone: 'yellow' as const,
        };
    }

    return {
        className: 'bg-red-500/20 text-red-900 dark:bg-red-500/10 dark:text-red-100',
        icon: 'alert' as const,
        tone: 'red' as const,
    };
}

export type { EmergencyItem, PreliminaryExam };
