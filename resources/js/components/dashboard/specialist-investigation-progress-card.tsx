import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';
import { getSpecialistRequestStatusClass } from '@/components/dashboard/specialist-request-status';

type SpecialistInvestigationPatient = {
    name?: string | null;
    surname?: string | null;
};

type SpecialistInvestigationRequestRecord = {
    id: number;
    status?: string | null;
    requested_at?: string | null;
    outcome?: string | null;
    emergency?: {
        patient?: SpecialistInvestigationPatient | null;
    } | null;
    specialist_investigation?: {
        id: number;
        title?: string | null;
    } | null;
    specialistInvestigation?: {
        id: number;
        title?: string | null;
    } | null;
};

type SpecialistInvestigationStatusCardProps = {
    requests: SpecialistInvestigationRequestRecord[];
};

export function SpecialistInvestigationStatusCard({ requests }: SpecialistInvestigationStatusCardProps) {
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const totalRequested = requests.length;
    const completedCount = requests.filter(isRequestCompleted).length;
    const pendingCount = totalRequested - completedCount;
    const completionRate = totalRequested > 0 ? Math.round((completedCount / totalRequested) * 100) : 0;

    const filtered = useMemo(
        () =>
            requests
                .slice()
                .sort((a, b) => {
                    const aTime = a.requested_at ? new Date(a.requested_at).getTime() : 0;
                    const bTime = b.requested_at ? new Date(b.requested_at).getTime() : 0;
                    return bTime - aTime;
                })
                .filter((item) => {
                    if (filter === 'completed') {
                        return isRequestCompleted(item);
                    }
                    if (filter === 'pending') {
                        return !isRequestCompleted(item);
                    }
                    return true;
                })
                .map((item) => ({
                    ...item,
                    exam:
                        item.specialistInvestigation?.title ??
                        item.specialist_investigation?.title ??
                        'Accertamento specialistico',
                    patient: formatPatientName(item.emergency?.patient ?? null),
                })),
        [filter, requests],
    );

    const filterLabel =
        filter === 'completed'
            ? 'Refertati'
            : filter === 'pending'
              ? 'In attesa esito'
              : 'Richiesti';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Stato accertamenti specialistici</CardTitle>
                    <CardDescription>Richieste e referti specialistici</CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs font-semibold">
                    <Stethoscope className="size-4 text-muted-foreground" />
                    <span>{completionRate}% completati</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <button
                        type="button"
                        onClick={() => setFilter('all')}
                        className={`rounded-lg border p-3 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                            filter === 'all'
                                ? 'border-blue-500/60 bg-blue-500/15 dark:border-blue-400/50'
                                : 'border-blue-200/70 bg-blue-500/10 dark:border-blue-900/40'
                        }`}
                    >
                        <p className="text-xs text-blue-700 dark:text-blue-200">Richiesti</p>
                        <p className="text-lg font-semibold text-blue-800 dark:text-blue-100">{totalRequested}</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('pending')}
                        className={`rounded-lg border p-3 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                            filter === 'pending'
                                ? 'border-amber-500/60 bg-amber-500/15 dark:border-amber-400/50'
                                : 'border-amber-200/70 bg-amber-500/10 dark:border-amber-900/40'
                        }`}
                    >
                        <p className="text-xs text-amber-700 dark:text-amber-200">In attesa esito</p>
                        <p className="text-lg font-semibold text-amber-800 dark:text-amber-100">{pendingCount}</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('completed')}
                        className={`rounded-lg border p-3 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                            filter === 'completed'
                                ? 'border-emerald-500/60 bg-emerald-500/15 dark:border-emerald-400/50'
                                : 'border-emerald-200/70 bg-emerald-500/10 dark:border-emerald-900/40'
                        }`}
                    >
                        <p className="text-xs text-emerald-700 dark:text-emerald-200">Refertati</p>
                        <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-100">
                            {completedCount}
                        </p>
                    </button>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium">
                        <span>{filterLabel}</span>
                        <span className="text-muted-foreground">
                            {totalRequested > 0 ? `${filtered.length} mostrati` : 'Nessuna richiesta'}
                        </span>
                    </div>
                    {totalRequested === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Non sono presenti accertamenti specialistici richiesti o in corso.
                        </p>
                    ) : filtered.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Nessuna richiesta per la categoria selezionata.
                        </p>
                    ) : (
                        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {filtered.map((item) => {
                                const statusClass = getSpecialistRequestStatusClass(item.status);
                                const statusLabel = item.status
                                    ? formatStatus(item.status)
                                    : item.outcome?.trim()
                                      ? 'Refertato'
                                      : 'In attesa esito';
                                const requestedText = item.requested_at ? formatRelative(item.requested_at) : null;

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-start justify-between rounded-lg border border-border/70 bg-background/80 px-3 py-2"
                                    >
                                        <div className="flex items-start gap-2">
                                            <Stethoscope className="mt-0.5 size-4 text-muted-foreground" />
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-semibold leading-tight">{item.exam}</p>
                                                <p className="text-xs text-muted-foreground">{item.patient}</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {requestedText ? `Richiesto ${requestedText}` : 'Data non disponibile'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={statusClass}>
                                            {statusLabel}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function isRequestCompleted(request: SpecialistInvestigationRequestRecord) {
    return Boolean(request.outcome?.trim()) || request.status === 'completed';
}

function formatPatientName(patient: SpecialistInvestigationPatient | null | undefined) {
    const name = (patient?.name ?? '').trim();
    const surname = (patient?.surname ?? '').trim();
    const full = `${name} ${surname}`.trim();
    return full || 'Paziente sconosciuto';
}

function formatStatus(status: string) {
    const spaced = status.replace(/_/g, ' ').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatRelative(dateStr: string) {
    const timestamp = new Date(dateStr).getTime();
    if (Number.isNaN(timestamp)) return 'ora';
    const diffMs = Date.now() - timestamp;
    const minutes = Math.max(0, Math.round(diffMs / 60_000));
    if (minutes < 60) {
        return `da ${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if (hours < 24) {
        return `da ${hours}h ${remainder}m`;
    }
    const days = Math.floor(hours / 24);
    return `da ${days}g`;
}

export type {
    SpecialistInvestigationRequestRecord,
    SpecialistInvestigationStatusCardProps,
};
