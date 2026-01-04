import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Ambulance, Paperclip, Stethoscope } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PatientDetailsDialog } from '@/components/dashboard/patient-details-dialog';
import {
    PreliminaryExamsDialog,
    type PreliminaryExam,
} from '@/components/dashboard/preliminary-exams-dialog';
import { EmergenciesFilter } from '@/components/dashboard/emergencies-filter';
import {
    InvestigationStatusDialog,
    type InvestigationPerformed,
} from '@/components/dashboard/investigation-status-dialog';
import { patchJson, postJson } from '@/lib/api';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

type EmergencyItem = {
    id: number | string;
    patientId?: number | string;
    paziente: string;
    codice: 'Rosso' | 'Giallo' | 'Verde';
    arrivo: string;
    attesa: string;
    destinazione: string;
    stato: string;
    createdAt?: string;
    performedInvestigationIds: number[];
    performedInvestigations: InvestigationPerformed[];
};

type EmergenciesCardProps = {
    items: EmergencyItem[];
    investigations: PreliminaryExam[];
    onInvestigationsRecorded?: (emergencyId: number, records: InvestigationPerformed[]) => void;
};

const codiceBadgeClasses: Record<EmergencyItem['codice'], string> = {
    Rosso: 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/50 dark:text-red-200',
    Giallo:
        'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/50 dark:text-amber-200',
    Verde:
        'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-200',
};

export function EmergenciesCard({ items, investigations, onInvestigationsRecorded }: EmergenciesCardProps) {
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

    useEffect(() => {
        const interval = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(interval);
    }, []);

    const getDisplayStatus = (item: EmergencyItem) =>
        item.performedInvestigationIds.length > 0
            ? 'Accertamenti preliminari in corso'
            : item.stato;

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

    const filteredItems = useMemo(
        () =>
            items.filter(
                (item) =>
                    (codeFilter === 'all' || item.codice === codeFilter) &&
                    (statusFilter === 'all' ||
                        formatStatus(getDisplayStatus(item)) === statusFilter) &&
                    (waitFilter === 'all' || getWaitTone(item, now).tone === waitFilter),
            ),
        [items, codeFilter, statusFilter, waitFilter, now],
    );

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
                        <CardTitle>Emergenze in corso</CardTitle>
                        <CardDescription>
                            Monitoraggio arrivi, codice colore e destinazioni
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="border-blue-200 bg-blue-500/10 text-blue-700 dark:border-blue-900/50 dark:text-blue-200"
                        >
                            Tempo medio triage 07:10
                        </Badge>
                        <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-200"
                        >
                            Monitor continuo
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

                    {filteredItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nessuna emergenza presente</p>
                    ) : (
                        filteredItems.map((item) => {
                            const waitTone = getWaitTone(item, now);
                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background/70 p-3 shadow-xs md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="flex items-start gap-3">
                                        <Badge
                                            variant="outline"
                                            className={codiceBadgeClasses[item.codice]}
                                        >
                                            {item.codice}
                                        </Badge>
                                        <div className="space-y-1">
                                            <button
                                                type="button"
                                                className="text-sm font-semibold leading-tight text-left underline-offset-4 hover:underline"
                                                onClick={() => openPatientDetails(item.patientId, item.paziente)}
                                            >
                                                {item.paziente}
                                            </button>
                                            <p className="text-xs text-muted-foreground">{item.arrivo}</p>
                                            <div
                                                className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-[11px] font-semibold ${waitTone.className}`}
                                            >
                                                {waitTone.icon === 'alert' ? (
                                                    <AlertTriangle className="size-3.5" />
                                                ) : (
                                                    <Ambulance className="size-3.5" />
                                                )}
                                                <span>Attesa {formatElapsed(item.createdAt, now)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 text-sm text-muted-foreground md:items-end">
                                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-200">
                                            <Stethoscope className="size-3.5" />
                                            {formatStatus(getDisplayStatus(item))}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="mt-1 font-medium"
                                            onClick={() => handleOpenFlow(item)}
                                        >
                                            <Stethoscope className="mr-2 size-4" aria-hidden="true" />
                                            Richiesta accertamenti preliminari
                                        </Button>
                                        {item.performedInvestigationIds.length > 0 ? (
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="px-0 text-emerald-700 hover:text-emerald-600 dark:text-emerald-200"
                                                onClick={() => handleOpenStatus(item)}
                                            >
                                                Visualizza stato accertamenti
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

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
                onOpenChange={(open) => {
                    setStatusDialogOpen(open);
                }}
            />

            <PatientDetailsDialog
                open={patientDialogOpen}
                patientId={patientDialogId}
                patientName={patientDialogName}
                onOpenChange={setPatientDialogOpen}
            />
        </>
    );
}

function formatStatus(status: string) {
    if (!status) return '';
    const spaced = status.replace(/_/g, ' ').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
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

function getWaitTone(item: EmergencyItem, nowMs: number) {
    const elapsedMs = (() => {
        if (!item.createdAt) return null;
        const created = new Date(item.createdAt).getTime();
        return Number.isNaN(created) ? null : Math.max(0, nowMs - created);
    })();

    const thresholdsMs: Record<EmergencyItem['codice'], { green: number; yellow: number }> = {
        Rosso: { green: 5 * 60_000, yellow: 10 * 60_000 }, // immediato
        Giallo: { green: 10 * 60_000, yellow: 30 * 60_000 },
        Verde: { green: 60 * 60_000, yellow: 120 * 60_000 },
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
