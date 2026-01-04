import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paperclip } from 'lucide-react';
import { useMemo, useState } from 'react';

export type InvestigationPerformed = {
    id: number;
    emergency_id: number;
    investigation_id: number;
    performed_by: number;
    performed_at?: string | null;
    outcome?: string | null;
    notes?: string | null;
};

type InvestigationStatusDialogProps = {
    open: boolean;
    patientName?: string;
    investigations: { id: number | string; title: string }[];
    performed: InvestigationPerformed[];
    outcomeDrafts: Record<number, string>;
    onOutcomeChange: (id: number, value: string) => void;
    onSave: (performed: InvestigationPerformed) => Promise<void> | void;
    onOpenChange: (open: boolean) => void;
};

export function InvestigationStatusDialog({
    open,
    patientName,
    investigations,
    performed,
    outcomeDrafts,
    onOutcomeChange,
    onSave,
    onOpenChange,
}: InvestigationStatusDialogProps) {
    const [uploadBoxOpenId, setUploadBoxOpenId] = useState<number | null>(null);
    const [uploadSelections, setUploadSelections] = useState<Record<number, File[]>>({});
    const [savingId, setSavingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const investigationTitles = useMemo(
        () =>
            new Map<number, string>(
                investigations.map((inv) => [Number(inv.id), inv.title ?? `Accertamento #${inv.id}`]),
            ),
        [investigations],
    );

    const getInvestigationTitle = (investigationId: number | string) =>
        investigationTitles.get(Number(investigationId)) ?? `Accertamento #${investigationId}`;

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

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setSavingId(null);
                setError(null);
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
                                <div
                                    key={perf.id}
                                    className="flex flex-col gap-3 rounded-md border border-border/70 bg-background/70 p-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold">{title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Richiesto il{' '}
                                                {perf.performed_at ? new Date(perf.performed_at).toLocaleString() : '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                        <button
                                            type="button"
                                            className="flex items-center justify-center rounded-md border border-dashed px-2 py-2 text-muted-foreground hover:border-foreground/60 hover:text-foreground"
                                            onClick={() =>
                                                setUploadBoxOpenId((prev) => (prev === perf.id ? null : perf.id))
                                            }
                                            aria-label="Carica allegato"
                                        >
                                            <Paperclip className="size-4" />
                                        </button>
                                        <Input
                                            value={value}
                                            placeholder="Inserisci il valore/esito"
                                            onChange={(event) => onOutcomeChange(perf.id, event.target.value)}
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => handleSave(perf)}
                                            disabled={savingId === perf.id}
                                        >
                                            {savingId === perf.id ? 'Salvataggio...' : 'Salva valore'}
                                        </Button>
                                    </div>
                                    {uploadBoxOpenId === perf.id ? (
                                        <div
                                            className="rounded-md border border-dashed border-border/80 bg-muted/40 p-3"
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(event) => {
                                                event.preventDefault();
                                                const dropped = Array.from(event.dataTransfer.files || []);
                                                setUploadSelections((prev) => ({
                                                    ...prev,
                                                    [perf.id]: dropped,
                                                }));
                                            }}
                                        >
                                            <p className="text-xs text-muted-foreground">
                                                Trascina qui i file oppure{' '}
                                                <label className="cursor-pointer font-semibold text-foreground underline-offset-2 hover:underline">
                                                    sfoglia
                                                    <input
                                                        type="file"
                                                        multiple
                                                        className="hidden"
                                                        onChange={(event) => {
                                                            const picked = Array.from(event.target.files || []);
                                                            setUploadSelections((prev) => ({
                                                                ...prev,
                                                                [perf.id]: picked,
                                                            }));
                                                        }}
                                                    />
                                                </label>
                                            </p>
                                            {files.length ? (
                                                <ul className="mt-2 space-y-1 text-xs text-foreground">
                                                    {files.map((file) => (
                                                        <li key={file.name} className="truncate">
                                                            {file.name} ({Math.round(file.size / 1024)} KB)
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : null}
                                        </div>
                                    ) : null}
                                    {perf.outcome ? (
                                        <p className="text-xs text-muted-foreground">
                                            Ultimo valore salvato:{' '}
                                            <span className="font-medium text-foreground">{perf.outcome}</span>
                                        </p>
                                    ) : null}
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Nessun accertamento registrato per questa emergenza.
                        </p>
                    )}
                    {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
