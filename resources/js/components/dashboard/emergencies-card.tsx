import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Ambulance, Stethoscope } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PatientDetailsDialog } from '@/components/dashboard/patient-details-dialog';
import {
    PreliminaryExamsDialog,
    type PreliminaryExam,
} from '@/components/dashboard/preliminary-exams-dialog';

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
};

type EmergenciesCardProps = {
    items: EmergencyItem[];
    investigations: PreliminaryExam[];
};

const codiceBadgeClasses: Record<EmergencyItem['codice'], string> = {
    Rosso: 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/50 dark:text-red-200',
    Giallo:
        'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/50 dark:text-amber-200',
    Verde:
        'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-200',
};

const codiceFilterClasses: Record<EmergencyItem['codice'], string> = {
    Rosso:
        'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/60 dark:text-red-200 hover:bg-red-500/15',
    Giallo:
        'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/60 dark:text-amber-200 hover:bg-amber-500/15',
    Verde:
        'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-200 hover:bg-emerald-500/15',
};

const statusFilterClasses: Record<string, string> = {
    'In triage': 'border-blue-200 bg-blue-500/10 text-blue-700 dark:border-blue-900/60 dark:text-blue-200',
    'In valutazione':
        'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/60 dark:text-amber-200',
    'Dimesso':
        'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-200',
    'In trattamento':
        'border-purple-200 bg-purple-500/10 text-purple-700 dark:border-purple-900/60 dark:text-purple-200',
};

const waitFilterOptions = [
    { key: 'all' as const, label: 'Tutti i tempi' },
    { key: 'green' as const, label: 'Nei tempi', className: 'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-200' },
    { key: 'yellow' as const, label: 'Soglia gialla', className: 'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/60 dark:text-amber-200' },
    { key: 'red' as const, label: 'In ritardo', className: 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/60 dark:text-red-200' },
];

export function EmergenciesCard({ items, investigations }: EmergenciesCardProps) {
    const [flowOpen, setFlowOpen] = useState(false);
    const [selected, setSelected] = useState<EmergencyItem | null>(null);
    const [patientDialogOpen, setPatientDialogOpen] = useState(false);
    const [patientDialogId, setPatientDialogId] = useState<number | string | undefined>();
    const [patientDialogName, setPatientDialogName] = useState('');
    const [codeFilter, setCodeFilter] = useState<'all' | EmergencyItem['codice']>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
    const [waitFilter, setWaitFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const interval = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(interval);
    }, []);

    const codiceOptions = useMemo(
        () => Array.from(new Set(items.map((item) => item.codice))) as EmergencyItem['codice'][],
        [items],
    );
    const statusOptions = useMemo(
        () => Array.from(new Set(items.map((item) => formatStatus(item.stato)))).filter(Boolean),
        [items],
    );

    const filteredItems = useMemo(
        () =>
            items.filter(
                (item) =>
                    (codeFilter === 'all' || item.codice === codeFilter) &&
                    (statusFilter === 'all' || formatStatus(item.stato) === statusFilter) &&
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
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                            Filtra:
                        </span>
                        <div className="flex flex-wrap gap-1">
                            <Badge
                                variant={codeFilter === 'all' ? 'secondary' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => setCodeFilter('all')}
                            >
                                Tutti i codici
                            </Badge>
                            {codiceOptions.map((code) => (
                                <Badge
                                    key={code}
                                    variant={codeFilter === code ? 'secondary' : 'outline'}
                                    className={`cursor-pointer ${codiceFilterClasses[code]}`}
                                    onClick={() => setCodeFilter((prev) => (prev === code ? 'all' : code))}
                                >
                                    {code}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                            <Badge
                                variant={statusFilter === 'all' ? 'secondary' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => setStatusFilter('all')}
                            >
                                Tutti gli stati
                            </Badge>
                            {statusOptions.map((status) => (
                                <Badge
                                    key={status}
                                    variant={statusFilter === status ? 'secondary' : 'outline'}
                                    className={`cursor-pointer ${statusFilterClasses[status] ?? ''}`}
                                    onClick={() =>
                                        setStatusFilter((prev) => (prev === status ? 'all' : status))
                                    }
                                >
                                    {status}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {waitFilterOptions.map((opt) => (
                                <Badge
                                    key={opt.key}
                                    variant={waitFilter === opt.key ? 'secondary' : 'outline'}
                                    className={`cursor-pointer ${opt.className ?? ''}`}
                                    onClick={() => setWaitFilter((prev) => (prev === opt.key ? 'all' : opt.key))}
                                >
                                    {opt.label}
                                </Badge>
                            ))}
                        </div>
                    </div>

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
                                            {formatStatus(item.stato)}
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
                onOpenChange={(open) => {
                    setFlowOpen(open);
                    if (!open) {
                        setSelected(null);
                    }
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
