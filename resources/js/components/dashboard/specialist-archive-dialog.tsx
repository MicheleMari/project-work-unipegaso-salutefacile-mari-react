import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Stethoscope } from 'lucide-react';
import type { SpecialistEmergency } from './specialist-report-dialog';

type SpecialistArchiveDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: SpecialistEmergency[];
    onOpenReport: (item: SpecialistEmergency) => void;
};

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

export function SpecialistArchiveDialog({
    open,
    onOpenChange,
    items,
    onOpenReport,
}: SpecialistArchiveDialogProps) {
    const getCodiceLabel = (code?: string | null) => {
        const alert = (code ?? '').toLowerCase();
        if (alert === 'rosso') return 'Rosso';
        if (alert === 'arancio' || alert === 'arancione') return 'Arancio';
        if (alert === 'giallo') return 'Giallo';
        if (alert === 'bianco') return 'Bianco';
        return 'Verde';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Emergenze inviate al Pronto Soccorso</DialogTitle>
                </DialogHeader>
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                    {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nessuna emergenza archiviata.</p>
                    ) : (
                        items.map((item) => {
                            const patientName = item.patient
                                ? `${item.patient.name} ${item.patient.surname ?? ''}`.trim()
                                : 'Paziente sconosciuto';
                            const codice = getCodiceLabel(item.alert_code);
                            return (
                                <div
                                    key={item.id}
                                    className="flex cursor-pointer items-start justify-between gap-3 rounded-md border border-border/70 bg-background/70 px-3 py-2 transition-colors hover:bg-accent/40"
                                    onClick={() => onOpenReport(item)}
                                >
                                    <div className="flex items-start gap-3">
                                        <Badge variant="outline" className={codiceBadgeClasses[codice]}>
                                            {codice}
                                        </Badge>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-semibold">{patientName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.description ?? 'Motivo accesso non specificato'}
                                            </p>
                                            <span className="text-[11px] text-muted-foreground">
                                                {formatRelative(item.specialist_called_at ?? item.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-100">
                                        <Stethoscope className="size-3.5" />
                                        Chiusura
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
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
