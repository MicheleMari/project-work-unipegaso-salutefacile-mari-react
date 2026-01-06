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
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Stato accertamenti {patientName ? `- ${patientName}` : ''}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
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
                {allOutcomesProvided ? (
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button variant="outline" onClick={() => setSpecialistDialogOpen(true)}>
                            Chiama Specialista
                        </Button>
                        <Button onClick={() => setAdvancedDialogOpen(true)}>Accertamenti Approfonditi</Button>
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
                onConfirm={async () => {
                    if (advancedSelected.size && onAdvancedInvestigationsSelect) {
                        await onAdvancedInvestigationsSelect(Array.from(advancedSelected));
                    }
                    setAdvancedDialogOpen(false);
                }}
            />
        </Dialog>
    );
}
