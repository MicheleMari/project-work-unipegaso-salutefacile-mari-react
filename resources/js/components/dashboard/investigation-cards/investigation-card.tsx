import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip } from 'lucide-react';

import type { InvestigationCardProps } from '@/components/dashboard/investigation-cards/types';

export function InvestigationCard({
    perf,
    title,
    value,
    files,
    isUploadOpen,
    saving,
    lastOutcome,
    onToggleUpload,
    onOutcomeChange,
    onSave,
    onFilesSelected,
}: InvestigationCardProps) {
    return (
        <div className="ml-2 flex flex-col gap-3 rounded-md border border-border/70 bg-background/70 p-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">
                        Richiesto il {perf.performed_at ? new Date(perf.performed_at).toLocaleString() : '—'}
                    </p>
                </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <button
                    type="button"
                    className="flex items-center justify-center rounded-md border border-dashed px-2 py-2 text-muted-foreground hover:border-foreground/60 hover:text-foreground"
                    onClick={onToggleUpload}
                    aria-label="Carica allegato"
                >
                    <Paperclip className="size-4" />
                </button>
                <Input value={value} placeholder="Inserisci il valore/esito" onChange={(event) => onOutcomeChange(event.target.value)} />
                <Button size="sm" onClick={onSave} disabled={saving}>
                    {saving ? 'Salvataggio...' : 'Salva valore'}
                </Button>
            </div>
            {isUploadOpen ? (
                <div
                    className="rounded-md border border-dashed border-border/80 bg-muted/40 p-3"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(event) => {
                        event.preventDefault();
                        const dropped = Array.from(event.dataTransfer.files || []);
                        onFilesSelected(dropped);
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
                                    onFilesSelected(picked);
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
            {lastOutcome ? (
                <p className="text-xs text-muted-foreground">
                    Ultimo valore salvato: <span className="font-medium text-foreground">{lastOutcome}</span>
                </p>
            ) : null}
        </div>
    );
}
