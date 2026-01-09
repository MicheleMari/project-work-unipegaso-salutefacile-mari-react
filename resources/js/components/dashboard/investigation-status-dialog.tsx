import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest, postJson } from '@/lib/api';
import { InvestigationCard } from '@/components/dashboard/investigation-cards/investigation-card';
import { AdvancedInvestigationsDialog } from '@/components/dashboard/investigation-cards/advanced-investigations-dialog';
import { SpecialistCallDialog } from '@/components/dashboard/investigation-cards/specialist-call-dialog';
import {
    InvestigationPerformed,
    SpecialistCallResult,
    SpecialistProfile,
    CallSpecialistResponse,
    UserOption,
    DepartmentOption,
    SpecialistInvestigationOption,
} from '@/components/dashboard/investigation-cards/types';
import { getSpecialistRequestStatusClass } from '@/components/dashboard/specialist-request-status';

type InvestigationStatusDialogProps = {
    open: boolean;
    emergencyId?: number | string;
    patientName?: string;
    investigations: { id: number | string; title: string }[];
    performed: InvestigationPerformed[];
    outcomeDrafts: Record<number, string>;
    onOutcomeChange: (id: number, value: string) => void;
    onSave: (performed: InvestigationPerformed) => Promise<void> | void;
    onSpecialistCalled?: (payload: SpecialistCallResult) => void;
    onAdvancedInvestigationsSelect?: (ids: number[]) => Promise<void> | void;
    onOpenChange: (open: boolean) => void;
};

type SpecialistInvestigationRequestRecord = {
    id: number;
    emergency_id: number | null;
    specialist_investigation_id: number;
    status?: string | null;
    requested_at?: string | null;
    scheduled_at?: string | null;
    report_expected_at?: string | null;
    report_received_at?: string | null;
    outcome?: string | null;
    notes?: string | null;
    follow_up_action?: string | null;
    disposition?: string | null;
    requester?: {
        id: number;
        name: string;
        surname?: string | null;
    } | null;
    specialist_investigation?: {
        id: number;
        title?: string | null;
        description?: string | null;
    } | null;
    specialistInvestigation?: {
        id: number;
        title?: string | null;
        description?: string | null;
    } | null;
};

export function InvestigationStatusDialog({
    open,
    emergencyId,
    patientName,
    investigations,
    performed,
    outcomeDrafts,
    onOutcomeChange,
    onSave,
    onSpecialistCalled,
    onAdvancedInvestigationsSelect,
    onOpenChange,
}: InvestigationStatusDialogProps) {
    const [uploadBoxOpenId, setUploadBoxOpenId] = useState<number | null>(null);
    const [uploadSelections, setUploadSelections] = useState<Record<number, File[]>>({});
    const [savingId, setSavingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [specialistDialogOpen, setSpecialistDialogOpen] = useState(false);
    const [specialists, setSpecialists] = useState<SpecialistProfile[]>([]);
    const [loadingSpecialists, setLoadingSpecialists] = useState(false);
    const [specialistError, setSpecialistError] = useState<string | null>(null);
    const [callError, setCallError] = useState<string | null>(null);
    const [calling, setCalling] = useState(false);
    const [advancedDialogOpen, setAdvancedDialogOpen] = useState(false);
    const [advancedOptions, setAdvancedOptions] = useState<SpecialistInvestigationOption[]>([]);
    const [advancedSelected, setAdvancedSelected] = useState<Set<number>>(new Set());
    const [advancedLoading, setAdvancedLoading] = useState(false);
    const [advancedError, setAdvancedError] = useState<string | null>(null);
    const [advancedSubmitting, setAdvancedSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'preventive' | 'specialist'>('preventive');
    const [specialistRequests, setSpecialistRequests] = useState<SpecialistInvestigationRequestRecord[]>([]);
    const [loadingSpecialistRequests, setLoadingSpecialistRequests] = useState(false);
    const [specialistRequestsError, setSpecialistRequestsError] = useState<string | null>(null);

    const investigationTitles = useMemo(
        () =>
            new Map<number, string>(
                investigations.map((inv) => [Number(inv.id), inv.title ?? `Accertamento #${inv.id}`]),
            ),
        [investigations],
    );
    const getInvestigationTitle = (investigationId: number | string) =>
        investigationTitles.get(Number(investigationId)) ?? `Accertamento #${investigationId}`;

    const allOutcomesProvided = useMemo(
        () =>
            performed.length > 0 &&
            performed.every((perf) => {
                const value = outcomeDrafts[perf.id] ?? perf.outcome ?? '';
                return value.toString().trim().length > 0;
            }),
        [outcomeDrafts, performed],
    );

    const specialistRequestsForCurrentEmergency = useMemo(() => {
        if (!emergencyId) {
            return [];
        }
        const normalized = Number(emergencyId);
        if (Number.isNaN(normalized)) {
            return [];
        }
        return specialistRequests.filter((request) => Number(request.emergency_id) === normalized);
    }, [specialistRequests, emergencyId]);

    const requestedSpecialistInvestigationIds = useMemo(() => {
        const ids = new Set<number>();
        specialistRequestsForCurrentEmergency.forEach((request) => {
            if (request.specialist_investigation_id) {
                ids.add(Number(request.specialist_investigation_id));
            }
        });
        return ids;
    }, [specialistRequestsForCurrentEmergency]);

    const requestedSpecialistInvestigationTitles = useMemo(() => {
        const map = new Map<number, string>();
        specialistRequestsForCurrentEmergency.forEach((request) => {
            const id = Number(request.specialist_investigation_id);
            const title =
                request.specialistInvestigation?.title ??
                request.specialist_investigation?.title ??
                `Accertamento specialistico #${request.specialist_investigation_id}`;
            map.set(id, title);
        });
        return map;
    }, [specialistRequestsForCurrentEmergency]);

    useEffect(() => {
        if (!specialistDialogOpen || specialists.length) return;

        let active = true;
        const load = async () => {
            setLoadingSpecialists(true);
            setSpecialistError(null);
            try {
                const [users, departments] = await Promise.all([
                    apiRequest<UserOption[]>('/api/users'),
                    apiRequest<DepartmentOption[]>('/api/departments'),
                ]);

                if (!active) return;

                const departmentNames = new Map<number, string>(
                    departments.map((dept) => [Number(dept.id), dept.name ?? `Reparto #${dept.id}`]),
                );

                const mapped: SpecialistProfile[] = users
                    .filter((user) => user.department_id)
                    .map((user) => ({
                        id: user.id,
                        name: user.name,
                        surname: user.surname ?? '',
                        department: departmentNames.get(Number(user.department_id)) ?? 'Reparto',
                        avatar: user.avatar ?? undefined,
                        availability: user.is_available ? 'available' : 'busy',
                    }));

                setSpecialists(mapped);
            } catch (err) {
                if (!active) return;
                setSpecialistError(err instanceof Error ? err.message : 'Errore nel caricamento specialisti');
            } finally {
                if (active) {
                    setLoadingSpecialists(false);
                }
            }
        };

        load();

        return () => {
            active = false;
        };
    }, [specialistDialogOpen, specialists.length]);

    useEffect(() => {
        if (!advancedDialogOpen || advancedOptions.length) return;
        let active = true;
        const load = async () => {
            setAdvancedLoading(true);
            setAdvancedError(null);
            try {
                const data = await apiRequest<SpecialistInvestigationOption[]>('/api/specialist-investigations');
                if (!active) return;
                setAdvancedOptions(data);
            } catch (err) {
                if (!active) return;
                setAdvancedError(err instanceof Error ? err.message : 'Errore nel caricamento esami');
            } finally {
                if (active) setAdvancedLoading(false);
            }
        };
        load();
        return () => {
            active = false;
        };
    }, [advancedDialogOpen, advancedOptions.length]);

    useEffect(() => {
        if (!open) {
            setSpecialistRequests([]);
            setSpecialistRequestsError(null);
            setLoadingSpecialistRequests(false);
            return;
        }

        let active = true;
        const load = async () => {
            setLoadingSpecialistRequests(true);
            setSpecialistRequestsError(null);
            setSpecialistRequests([]);
            try {
                const data = await apiRequest<SpecialistInvestigationRequestRecord[]>(
                    '/api/specialist-investigation-requests',
                );
                if (!active) return;
                setSpecialistRequests(data);
            } catch (err) {
                if (!active) return;
                setSpecialistRequestsError(
                    err instanceof Error ? err.message : 'Errore nel caricamento delle richieste',
                );
            } finally {
                if (active) {
                    setLoadingSpecialistRequests(false);
                }
            }
        };

        load();

        return () => {
            active = false;
        };
    }, [open, emergencyId]);

    useEffect(() => {
        if (open) {
            setActiveTab('preventive');
        }
    }, [open]);

    const handleSave = async (perf: InvestigationPerformed) => {
        setSavingId(perf.id);
        setError(null);
        try {
            await onSave(perf);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore nel salvataggio del valore');
        } finally {
            setSavingId(null);
        }
    };

    const handleCallSpecialist = async (specialistId: number) => {
        if (!emergencyId) {
            setCallError('Emergenza non valida');
            return;
        }
        setCalling(true);
        setCallError(null);
        try {
            const response = await postJson<CallSpecialistResponse>(
                `/api/emergencies/${emergencyId}/call-specialist`,
                { specialist_id: specialistId },
            );

            const payload: SpecialistCallResult = {
                emergencyId: response.id,
                status: response.status ?? 'specialist_called',
                specialist: response.specialist
                    ? {
                          id: response.specialist.id,
                          name: response.specialist.name,
                          surname: response.specialist.surname ?? '',
                          department: response.specialist.department?.name ?? null,
                          avatar: response.specialist.avatar ?? null,
                          isAvailable: response.specialist.is_available ?? true,
                          calledAt: response.specialist_called_at ?? null,
                      }
                    : null,
            };

            onSpecialistCalled?.(payload);
            setSpecialistDialogOpen(false);
        } catch (err) {
            setCallError(err instanceof Error ? err.message : 'Errore durante la chiamata allo specialista');
        } finally {
            setCalling(false);
        }
    };

    const handleAdvancedConfirm = async () => {
        if (!advancedSelected.size) {
            setAdvancedDialogOpen(false);
            return;
        }
        const duplicateIds = Array.from(advancedSelected).filter((id) =>
            requestedSpecialistInvestigationIds.has(id),
        );
        if (duplicateIds.length) {
            const titles = Array.from(
                new Set(
                    duplicateIds.map(
                        (id) =>
                            requestedSpecialistInvestigationTitles.get(id) ??
                            `Accertamento specialistico #${id}`,
                    ),
                ),
            );
            const message =
                titles.length === 1
                    ? `${titles[0]} è già stato richiesto per questa emergenza.`
                    : `Gli accertamenti ${titles.join(', ')} sono già stati richiesti per questa emergenza.`;
            setAdvancedError(message);
            return;
        }
        if (!onAdvancedInvestigationsSelect) {
            setAdvancedDialogOpen(false);
            return;
        }

        setAdvancedError(null);
        setAdvancedSubmitting(true);

        try {
            await onAdvancedInvestigationsSelect(Array.from(advancedSelected));
            setAdvancedDialogOpen(false);
        } catch (err) {
            setAdvancedError(
                err instanceof Error ? err.message : 'Errore durante la richiesta degli accertamenti specialistici',
            );
        } finally {
            setAdvancedSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setSavingId(null);
                setError(null);
                setCallError(null);
                onOpenChange(next);
            }}
        >
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col gap-3">
                <DialogHeader>
                    <DialogTitle>Stato accertamenti {patientName ? `- ${patientName}` : ''}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
                <div className="flex flex-wrap gap-2 border-b border-border/70 pb-2">
                        <button
                            type="button"
                            className={`rounded-t-md border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
                                activeTab === 'preventive'
                                    ? 'border-b-blue-500 text-foreground'
                                    : 'border-b-transparent text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => setActiveTab('preventive')}
                        >
                            Accertamenti preventivi
                        </button>
                        <button
                            type="button"
                            className={`rounded-t-md border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
                                activeTab === 'specialist'
                                    ? 'border-b-blue-500 text-foreground'
                                    : 'border-b-transparent text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => setActiveTab('specialist')}
                        >
                            Accertamenti specialistici
                        </button>
                    </div>
                    {activeTab === 'preventive' ? (
                        <div className="space-y-4">
                            {performed.length ? (
                                performed.map((perf) => {
                                    const title = getInvestigationTitle(perf.investigation_id);
                                    const value = outcomeDrafts[perf.id] ?? perf.outcome ?? '';
                                    const files = uploadSelections[perf.id] ?? [];
                                    return (
                                        <InvestigationCard
                                            key={perf.id}
                                            perf={perf}
                                            title={title}
                                            value={value}
                                            files={files}
                                            isUploadOpen={uploadBoxOpenId === perf.id}
                                            onToggleUpload={() =>
                                                setUploadBoxOpenId((prev) => (prev === perf.id ? null : perf.id))
                                            }
                                            onOutcomeChange={(val) => onOutcomeChange(perf.id, val)}
                                            onSave={() => handleSave(perf)}
                                            saving={savingId === perf.id}
                                            onFilesSelected={(fileList) =>
                                                setUploadSelections((prev) => ({
                                                    ...prev,
                                                    [perf.id]: fileList,
                                                }))
                                            }
                                            lastOutcome={perf.outcome}
                                        />
                                    );
                                })
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Nessun accertamento registrato per questa emergenza.
                                </p>
                            )}
                            {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {loadingSpecialistRequests ? (
                                <p className="text-sm text-muted-foreground">Caricamento richieste specialistica...</p>
                            ) : null}
                            {specialistRequestsError ? (
                                <p className="text-sm font-medium text-red-600">{specialistRequestsError}</p>
                            ) : null}
                            {specialistRequestsForCurrentEmergency.map((request) => {
                                const title =
                                    request.specialistInvestigation?.title ??
                                    request.specialist_investigation?.title ??
                                    `Accertamento specialistico #${request.specialist_investigation_id}`;
                                const requester =
                                    request.requester && request.requester.name
                                        ? `${request.requester.name} ${request.requester.surname ?? ''}`.trim()
                                        : null;
                                const requestedText = formatDateTime(request.requested_at);
                                const scheduledText = formatDateTime(request.scheduled_at);
                                const reportExpectedText = formatDateTime(request.report_expected_at);
                                const reportReceivedText = formatDateTime(request.report_received_at);
                                return (
                                    <div
                                        key={request.id}
                                        className="space-y-2 rounded-md border border-border/70 bg-background/70 p-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold">{title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {requestedText ? `Richiesta il ${requestedText}` : 'Richiesta registrata'}
                                                    {requester ? ` da ${requester}` : ''}
                                                </p>
                                            </div>
                                            {request.status ? (
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${getSpecialistRequestStatusClass(
                                                        request.status,
                                                    )}`}
                                                >
                                                    {formatStatus(request.status)}
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                                            {scheduledText ? (
                                                <p>
                                                    <span className="font-medium text-foreground">Programmata</span> il {scheduledText}
                                                </p>
                                            ) : null}
                                            {reportExpectedText ? (
                                                <p>
                                                    <span className="font-medium text-foreground">Referto atteso</span> il {reportExpectedText}
                                                </p>
                                            ) : null}
                                            {reportReceivedText ? (
                                                <p>
                                                    <span className="font-medium text-foreground">Referto ricevuto</span> il {reportReceivedText}
                                                </p>
                                            ) : null}
                                        </div>
                                        {request.outcome ? (
                                            <p className="text-xs text-muted-foreground">
                                                <span className="font-medium text-foreground">Esito:</span> {request.outcome}
                                            </p>
                                        ) : null}
                                        {request.notes ? (
                                            <p className="text-xs text-muted-foreground">
                                                <span className="font-medium text-foreground">Note:</span> {request.notes}
                                            </p>
                                        ) : null}
                                        {request.follow_up_action ? (
                                            <p className="text-xs text-muted-foreground">
                                                <span className="font-medium text-foreground">Follow-up:</span>{' '}
                                                {request.follow_up_action}
                                            </p>
                                        ) : null}
                                        {request.disposition ? (
                                            <p className="text-xs text-muted-foreground">
                                                <span className="font-medium text-foreground">Disposizione:</span> {request.disposition}
                                            </p>
                                        ) : null}
                                    </div>
                                );
                            })}
                            {!loadingSpecialistRequests &&
                            !specialistRequestsError &&
                            specialistRequestsForCurrentEmergency.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Nessuna richiesta specialistica registrata per questa emergenza.
                                </p>
                            ) : null}
                        </div>
                    )}
                </div>
                {allOutcomesProvided || onAdvancedInvestigationsSelect ? (
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        {allOutcomesProvided ? (
                            <Button variant="outline" onClick={() => setSpecialistDialogOpen(true)}>
                                Chiama Specialista
                            </Button>
                        ) : null}
                        {onAdvancedInvestigationsSelect ? (
                            <Button onClick={() => setAdvancedDialogOpen(true)}>Accertamenti Approfonditi</Button>
                        ) : null}
                    </div>
                ) : null}
            </DialogContent>
            <SpecialistCallDialog
                open={specialistDialogOpen}
                onOpenChange={setSpecialistDialogOpen}
                specialists={specialists}
                patientName={patientName}
                loading={loadingSpecialists}
                error={specialistError}
                onCall={handleCallSpecialist}
                calling={calling}
                callError={callError}
            />
            <AdvancedInvestigationsDialog
                open={advancedDialogOpen}
                onOpenChange={(open) => {
                    if (!open) setAdvancedSelected(new Set());
                    if (open) setAdvancedError(null);
                    setAdvancedDialogOpen(open);
                }}
                options={advancedOptions}
                loading={advancedLoading}
                error={advancedError}
                selected={advancedSelected}
                onToggle={(id) =>
                    setAdvancedSelected((prev) => {
                        const next = new Set(prev);
                        if (next.has(id)) {
                            next.delete(id);
                        } else {
                            next.add(id);
                        }
                        return next;
                    })
                }
                onConfirm={handleAdvancedConfirm}
                submitting={advancedSubmitting}
            />
        </Dialog>
    );
}

function formatStatus(status: string) {
    if (!status) return '';
    if (status === 'requested') return 'Richiesto';
    const spaced = status.replace(/_/g, ' ').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatDateTime(value?: string | null) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleString('it-IT', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}
