import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Clock, Stethoscope } from 'lucide-react';
import { SpecialistReportDialog, type SpecialistEmergency } from './specialist-report-dialog';
import { SpecialistArchiveDialog } from './specialist-archive-dialog';

type SpecialistEmergenciesCardProps = {
    items: SpecialistEmergency[];
    onEmergencyUpdated: (emergency: SpecialistEmergency) => void;
};

const statusBadgeClasses: Record<string, string> = {
    'Specialista chiamato': 'bg-blue-500/10 text-blue-800 dark:text-blue-100',
    'Referto inviato': 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-100',
    Chiusura: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-100',
    'In valutazione': 'bg-amber-500/10 text-amber-700 dark:text-amber-200',
};

const normalizeStatus = (status?: string | null) =>
    (status ?? '').replace(/\./g, '').toLowerCase();

const isArchivedStatus = (status?: string | null) => {
    const normalized = normalizeStatus(status);
    return (
        normalized === 'chiusura' ||
        normalized === 'ricovero' ||
        normalized.includes('dimissione')
    );
};

export function SpecialistEmergenciesCard({ items, onEmergencyUpdated }: SpecialistEmergenciesCardProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selected, setSelected] = useState<SpecialistEmergency | null>(null);
    const [archiveOpen, setArchiveOpen] = useState(false);

    const activeItems = useMemo(
        () => items.filter((item) => !isArchivedStatus(item.status)),
        [items],
    );

    const sortedItems = useMemo(
        () =>
            activeItems
                .slice()
                .sort((a, b) => {
                    const aTime = a.specialist_called_at ? new Date(a.specialist_called_at).getTime() : 0;
                    const bTime = b.specialist_called_at ? new Date(b.specialist_called_at).getTime() : 0;
                    return bTime - aTime;
                }),
        [activeItems],
    );

    const archivedItems = useMemo(
        () =>
            items
                .filter((item) => isArchivedStatus(item.status))
                .slice()
                .sort((a, b) => {
                    const aTime = a.specialist_called_at ? new Date(a.specialist_called_at).getTime() : 0;
                    const bTime = b.specialist_called_at ? new Date(b.specialist_called_at).getTime() : 0;
                    return bTime - aTime;
                }),
        [items],
    );

    const handleOpenReport = (item: SpecialistEmergency) => {
        setSelected(item);
        setDialogOpen(true);
    };

    const getCodiceLabel = (code?: string | null) => {
        const alert = (code ?? '').toLowerCase();
        if (alert === 'rosso') return 'Rosso';
        if (alert === 'arancio' || alert === 'arancione') return 'Arancio';
        if (alert === 'giallo') return 'Giallo';
        if (alert === 'bianco') return 'Bianco';
        return 'Verde';
    };

    return (
        <>
            <Card className="xl:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Emergenze assegnate</CardTitle>
                        <CardDescription>Gestione referti e invio al pronto soccorso</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="size-4" />
                            Ordinato per ultima chiamata
                        </div>
                        <button
                            type="button"
                            className="text-xs font-semibold text-blue-700 underline-offset-2 hover:underline dark:text-blue-200"
                            onClick={() => setArchiveOpen(true)}
                        >
                            Emergenze inviate al Pronto Soccorso
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {sortedItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Nessuna emergenza assegnata al momento.
                        </p>
                    ) : (
                        sortedItems.map((item) => {
                            const patientName = item.patient
                                ? `${item.patient.name} ${item.patient.surname ?? ''}`.trim()
                                : 'Paziente sconosciuto';
                            const statusLabel = formatStatus(item.status ?? 'specialist_called');
                            const codice = getCodiceLabel(item.alert_code);
                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-3 rounded-lg border border-border/70 bg-background/70 p-3 shadow-xs md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="flex items-start gap-3">
                                        <Badge variant="outline" className={codiceBadgeClasses[codice]}>
                                            {codice}
                                        </Badge>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold leading-tight">{patientName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.description ?? 'Motivo accesso non specificato'}
                                            </p>
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${
                                                    statusBadgeClasses[statusLabel] ?? 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                <Stethoscope className="size-3.5" />
                                                {statusLabel}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 text-sm text-muted-foreground md:items-end">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleOpenReport(item)}
                                            className="font-medium"
                                        >
                                            <ClipboardCheck className="mr-2 size-4" aria-hidden="true" />
                                            Referta
                                        </Button>
                                        <span className="text-xs text-muted-foreground">
                                            {formatRelative(item.specialist_called_at ?? item.created_at)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            <SpecialistReportDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) {
                        setSelected(null);
                    }
                }}
                emergency={selected}
                onEmergencyUpdated={onEmergencyUpdated}
                readOnly={Boolean(selected?.sended_to_ps) || selected?.status === 'Chiusura'}
            />
            <SpecialistArchiveDialog
                open={archiveOpen}
                onOpenChange={setArchiveOpen}
                items={archivedItems}
                onOpenReport={(item) => {
                    setArchiveOpen(false);
                    handleOpenReport(item);
                }}
            />
        </>
    );
}

function formatStatus(status: string) {
    if (!status) return '';
    if (status === 'specialist_called') return 'Specialista chiamato';
    if (status === 'referto_inviato') return 'Referto inviato';
    if (status === 'Chiusura') return 'Chiusura';
    const spaced = status.replace(/_/g, ' ').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatRelative(dateStr?: string | null) {
    if (!dateStr) return 'Data non disponibile';
    const timestamp = new Date(dateStr).getTime();
    if (Number.isNaN(timestamp)) return 'Data non disponibile';
    const diffMs = Date.now() - timestamp;
    const minutes = Math.max(0, Math.round(diffMs / 60_000));
    if (minutes < 60) {
        return `Da ${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if (hours < 24) {
        return `Da ${hours}h ${remainder}m`;
    }
    const days = Math.floor(hours / 24);
    return `Da ${days}g`;
}

const codiceBadgeClasses: Record<string, string> = {
    Rosso: 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/50 dark:text-red-200',
    Arancio:
        'border-orange-200 bg-orange-500/10 text-orange-700 dark:border-orange-900/50 dark:text-orange-200',
    Giallo:
        'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/50 dark:text-amber-200',
    Verde:
        'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-200',
    Bianco: 'border-slate-200 bg-slate-200/50 text-slate-700 dark:border-slate-700 dark:text-slate-100',
};
