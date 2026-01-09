import { useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { postJson } from '@/lib/api';

type SpecialistEmergency = {
    id: number;
    status?: string | null;
    alert_code?: string | null;
    description?: string | null;
    specialist_called_at?: string | null;
    created_at?: string | null;
    sended_to_ps?: boolean | null;
    result?: {
        notes?: string | null;
        disposition?: string | null;
        needs_follow_up?: boolean | null;
        reported_at?: string | null;
    } | null;
    patient?: {
        id: number;
        name: string;
        surname?: string | null;
    } | null;
};

type SpecialistReportDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    emergency: SpecialistEmergency | null;
    onEmergencyUpdated: (emergency: SpecialistEmergency) => void;
    readOnly?: boolean;
};

const textAreaStyle =
    'min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export function SpecialistReportDialog({
    open,
    onOpenChange,
    emergency,
    onEmergencyUpdated,
    readOnly = false,
}: SpecialistReportDialogProps) {
    const [notes, setNotes] = useState('');
    const [disposition, setDisposition] = useState('');
    const [needsFollowUp, setNeedsFollowUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        const result = emergency?.result ?? null;
        setNotes(result?.notes ?? '');
        setDisposition(result?.disposition ?? '');
        setNeedsFollowUp(Boolean(result?.needs_follow_up));
        setError(null);
    }, [open, emergency?.id, emergency?.result]);

    const isValid = useMemo(() => notes.trim().length > 0, [notes]);
    const canSend = !emergency?.sended_to_ps && !readOnly;

    const submitReport = async (sendToPs: boolean) => {
        if (!emergency) {
            setError('Emergenza non valida');
            return;
        }
        if (readOnly) {
            return;
        }
        if (!isValid) {
            setError('Inserisci il referto prima di salvare.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const payload = await postJson<{ emergency: SpecialistEmergency }>(
                `/api/emergencies/${emergency.id}/specialist-report`,
                {
                    notes: notes.trim(),
                    disposition: disposition.trim() || null,
                    needs_follow_up: needsFollowUp,
                    send_to_ps: sendToPs,
                },
            );
            onEmergencyUpdated(payload.emergency);
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante il salvataggio');
        } finally {
            setLoading(false);
        }
    };

    const patientName = emergency?.patient
        ? `${emergency.patient.name} ${emergency.patient.surname ?? ''}`.trim()
        : 'Paziente';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Referto specialistico</DialogTitle>
                    <DialogDescription>
                        {patientName} {emergency?.id ? `- ER #${emergency.id}` : ''}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor="specialist-report-notes">Referto</Label>
                        <textarea
                            id="specialist-report-notes"
                            className={textAreaStyle}
                            placeholder="Sintesi clinica, indicazioni e raccomandazioni."
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            required
                            disabled={readOnly}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="specialist-report-disposition">Indicazioni per il PS</Label>
                        <input
                            id="specialist-report-disposition"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Es. invio in reparto, osservazione, follow-up."
                            value={disposition}
                            onChange={(event) => setDisposition(event.target.value)}
                            disabled={readOnly}
                        />
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-md border border-dashed px-3 py-2">
                        <div className="space-y-1">
                            <Label htmlFor="specialist-report-followup">Necessita follow-up</Label>
                            <p className="text-xs text-muted-foreground">
                                Evidenzia la necessita di una rivalutazione programmata.
                            </p>
                        </div>
                        <Switch
                            id="specialist-report-followup"
                            checked={needsFollowUp}
                            onCheckedChange={setNeedsFollowUp}
                            disabled={readOnly}
                        />
                    </div>
                    {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
                </div>

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {readOnly ? 'Chiudi' : 'Annulla'}
                    </Button>
                    {readOnly ? null : (
                        <>
                            <Button type="button" onClick={() => submitReport(false)} disabled={loading}>
                                {loading ? 'Salvataggio...' : 'Salva referto'}
                            </Button>
                            <Button type="button" onClick={() => submitReport(true)} disabled={loading || !canSend}>
                                {loading ? 'Invio...' : 'Invia al PS'}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export type { SpecialistEmergency };
