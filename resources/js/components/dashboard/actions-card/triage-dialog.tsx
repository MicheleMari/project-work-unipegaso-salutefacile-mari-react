import { useMemo, useState, type FormEvent } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { postJson } from '@/lib/api';
import { FiscalCodeTool } from '../fiscal-code-tool';
import type { CreatedEmergency, PriorityCode } from './types';
import { priorityOrder } from './types';
import { buildVitalSignsPayload, suggestPriorityFromForm } from './triage-suggestion';

type TriageDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUserId: number | null;
    onEmergencyCreated?: (emergency: CreatedEmergency) => void;
};

const priorityCodes: { value: PriorityCode; label: string; description: string; colorClass: string; selectedClass: string }[] = [
    {
        value: 'bianco',
        label: 'Bianco',
        description: 'Condizioni non urgenti',
        colorClass: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
        selectedClass:
            'border-slate-300 bg-slate-50 shadow-[0_0_0_1px_rgba(15,23,42,0.08)] dark:border-slate-700/70 dark:bg-slate-900/60',
    },
    {
        value: 'verde',
        label: 'Verde',
        description: 'Richiede assistenza, non pericolo immediato',
        colorClass: 'bg-emerald-500 text-emerald-50',
        selectedClass:
            'border-emerald-200 bg-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,0.25)] dark:border-emerald-900/70 dark:bg-emerald-950/40',
    },
    {
        value: 'giallo',
        label: 'Giallo',
        description: 'Condizione potenzialmente critica, osservazione ravvicinata',
        colorClass: 'bg-amber-500 text-amber-50',
        selectedClass:
            'border-amber-200 bg-amber-50 shadow-[0_0_0_1px_rgba(245,158,11,0.25)] dark:border-amber-900/70 dark:bg-amber-950/40',
    },
    {
        value: 'arancio',
        label: 'Arancione',
        description: 'Condizione grave, intervento urgente',
        colorClass: 'bg-orange-500 text-orange-50',
        selectedClass:
            'border-orange-200 bg-orange-50 shadow-[0_0_0_1px_rgba(249,115,22,0.25)] dark:border-orange-900/70 dark:bg-orange-950/40',
    },
    {
        value: 'rosso',
        label: 'Rosso',
        description: 'In pericolo di vita, massima priorità',
        colorClass: 'bg-red-500 text-red-50',
        selectedClass:
            'border-red-200 bg-red-50 shadow-[0_0_0_1px_rgba(239,68,68,0.25)] dark:border-red-900/70 dark:bg-red-950/50',
    },
];

export function TriageDialog({ open, onOpenChange, currentUserId, onEmergencyCreated }: TriageDialogProps) {
    const [triageForm, setTriageForm] = useState({
        nome: '',
        cognome: '',
        codiceFiscale: '',
        codicePriorita: '' as PriorityCode | '',
        motivoAccesso: '',
        pressioneArteriosa: '',
        temperaturaCorporea: '',
        frequenzaCardiaca: '',
        saturazione: '',
    });
    const [triageLoading, setTriageLoading] = useState(false);
    const [triageError, setTriageError] = useState<string | null>(null);
    const [triageSuccess, setTriageSuccess] = useState<string | null>(null);
    const [triageSuggestion, setTriageSuggestion] = useState<string | null>(null);
    const [triageSuggesting, setTriageSuggesting] = useState(false);

    const isFormValid = useMemo(
        () =>
            triageForm.nome.trim() &&
            triageForm.cognome.trim() &&
            triageForm.codiceFiscale.trim() &&
            triageForm.codicePriorita &&
            triageForm.motivoAccesso.trim(),
        [triageForm],
    );

    const resetForm = () => {
        setTriageForm({
            nome: '',
            cognome: '',
            codiceFiscale: '',
            codicePriorita: '',
            motivoAccesso: '',
            pressioneArteriosa: '',
            temperaturaCorporea: '',
            frequenzaCardiaca: '',
            saturazione: '',
        });
        setTriageError(null);
        setTriageSuccess(null);
        setTriageSuggestion(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isFormValid) return;
        if (!currentUserId) {
            setTriageError('Sessione non valida: riesegui il login.');
            return;
        }

        setTriageLoading(true);
        setTriageError(null);
        setTriageSuccess(null);

        try {
            const vitalSigns = buildVitalSignsPayload(triageForm);
            const hasVitalSigns = Object.values(vitalSigns).some(Boolean);

            const patient = await postJson<{ id: number }>('/api/patients', {
                name: triageForm.nome.trim(),
                surname: triageForm.cognome.trim(),
                fiscal_code: triageForm.codiceFiscale.trim() || null,
            });

            const emergency = await postJson<{
                id: number;
                status?: string | null;
                alert_code?: string | null;
                description?: string | null;
            }>('/api/emergencies', {
                user_id: currentUserId,
                patient_id: patient.id,
                alert_code: triageForm.codicePriorita,
                description: triageForm.motivoAccesso.trim(),
                status: 'in_triage',
                vital_signs: hasVitalSigns ? vitalSigns : null,
            });

            onEmergencyCreated?.({
                id: emergency.id,
                status: emergency.status ?? 'in_triage',
                alert_code: emergency.alert_code ?? triageForm.codicePriorita,
                description: emergency.description ?? triageForm.motivoAccesso.trim(),
                patient: {
                    id: patient.id,
                    name: triageForm.nome.trim(),
                    surname: triageForm.cognome.trim(),
                },
            });

            setTriageSuccess('Triage registrato con successo');
            resetForm();
            onOpenChange(false);
        } catch (err) {
            setTriageError(err instanceof Error ? err.message : 'Errore durante il salvataggio');
        } finally {
            setTriageLoading(false);
        }
    };

    const handleSuggest = async () => {
        const localSuggestion = suggestPriorityFromForm(triageForm);
        setTriageForm((prev) => ({
            ...prev,
            codicePriorita: localSuggestion.code,
        }));
        setTriageSuggestion(`Suggerito ${localSuggestion.code.toUpperCase()}: ${localSuggestion.reason}`);

        if (!triageForm.motivoAccesso.trim()) return;

        setTriageSuggesting(true);
        try {
            const payload = await postJson<{
                code: string | null;
                reason?: string | null;
            }>('/api/triage-suggest', {
                motivo_accesso: triageForm.motivoAccesso.trim(),
                codice_fiscale: triageForm.codiceFiscale.trim() || null,
                vital_signs: buildVitalSignsPayload(triageForm),
            });

            if (payload?.code) {
                const bestCode =
                    priorityOrder(payload.code) < priorityOrder(localSuggestion.code)
                        ? payload.code
                        : localSuggestion.code;
                setTriageForm((prev) => ({
                    ...prev,
                    codicePriorita: bestCode as PriorityCode,
                }));
                const msg = payload.reason || localSuggestion.reason;
                setTriageSuggestion(`Suggerito ${String(bestCode).toUpperCase()}: ${msg}`);
            }
        } catch (err) {
            setTriageSuggestion(`Suggerito ${localSuggestion.code.toUpperCase()}: ${localSuggestion.reason}`);
        } finally {
            setTriageSuggesting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                onOpenChange(next);
                if (!next) resetForm();
            }}
        >
            <DialogContent className="max-h-[calc(100vh-4rem)] overflow-hidden p-0 sm:max-w-4xl">
                <div className="max-h-[calc(100vh-4rem)] overflow-y-auto p-6 sm:p-8">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Avvia nuovo triage</DialogTitle>
                            <DialogDescription>
                                Inserisci i dati essenziali per aprire la scheda di triage.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2.5">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="triage-nome">Nome</Label>
                                    <Input
                                        id="triage-nome"
                                        name="nome"
                                        value={triageForm.nome}
                                        onChange={(event) =>
                                            setTriageForm((prev) => ({
                                                ...prev,
                                                nome: event.target.value,
                                            }))
                                        }
                                        autoComplete="given-name"
                                        required
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="triage-cognome">Cognome</Label>
                                    <Input
                                        id="triage-cognome"
                                        name="cognome"
                                        value={triageForm.cognome}
                                        onChange={(event) =>
                                            setTriageForm((prev) => ({
                                                ...prev,
                                                cognome: event.target.value,
                                            }))
                                        }
                                        autoComplete="family-name"
                                        required
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="triage-cf">Codice fiscale</Label>
                                        <FiscalCodeTool
                                            defaults={{ nome: triageForm.nome, cognome: triageForm.cognome }}
                                            onFiscalCodeComputed={(value) =>
                                                setTriageForm((prev) => ({
                                                    ...prev,
                                                    codiceFiscale: value,
                                                }))
                                            }
                                            trigger={
                                                <button
                                                    type="button"
                                                    className="text-sm text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
                                                >
                                                    Non hai il codice fiscale?
                                                </button>
                                            }
                                        />
                                    </div>
                                    <Input
                                        id="triage-cf"
                                        name="codiceFiscale"
                                        value={triageForm.codiceFiscale}
                                        onChange={(event) =>
                                            setTriageForm((prev) => ({
                                                ...prev,
                                                codiceFiscale: event.target.value.toUpperCase(),
                                            }))
                                        }
                                        inputMode="text"
                                        autoComplete="off"
                                        required
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="triage-motivo">Motivo di accesso</Label>
                                    <textarea
                                        id="triage-motivo"
                                        name="motivoAccesso"
                                        value={triageForm.motivoAccesso}
                                        onChange={(event) =>
                                            setTriageForm((prev) => ({
                                                ...prev,
                                                motivoAccesso: event.target.value,
                                            }))
                                        }
                                        placeholder="Es. dolore toracico, trauma, malessere generale"
                                        required
                                        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-[140px] w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2.5">
                                <div className="flex items-center justify-between gap-2">
                                    <Label>Codice di priorità</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSuggest}
                                        className="inline-flex items-center gap-2"
                                        disabled={triageSuggesting}
                                    >
                                        <Sparkles className="size-4" aria-hidden="true" />
                                        {triageSuggesting ? 'Analisi...' : 'Suggerisci codice'}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Stima basata su motivo di accesso, codice fiscale (età/genere) e parametri vitali se presenti.
                                </p>
                                {triageSuggestion ? (
                                    <p className="text-xs font-medium text-foreground">{triageSuggestion}</p>
                                ) : null}
                                <div className="grid gap-1.5" role="radiogroup" aria-label="Codice di priorità">
                                    {priorityCodes.map((code) => {
                                        const isSelected = triageForm.codicePriorita === code.value;
                                        return (
                                            <button
                                                key={code.value}
                                                type="button"
                                                role="radio"
                                                aria-checked={isSelected}
                                                onClick={() =>
                                                    setTriageForm((prev) => ({
                                                        ...prev,
                                                        codicePriorita:
                                                            prev.codicePriorita === code.value ? '' : code.value,
                                                    }))
                                                }
                                                className={cn(
                                                    'flex items-start gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                                                    'hover:border-ring hover:bg-accent',
                                                    isSelected
                                                        ? cn('border-ring', code.selectedClass)
                                                        : 'bg-background'
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'mt-0.5 flex size-5 items-center justify-center rounded-full text-[10px] font-semibold uppercase',
                                                        code.colorClass
                                                    )}
                                                    aria-hidden="true"
                                                >
                                                    {code.label.charAt(0)}
                                                </span>
                                                <span className="space-y-0.5">
                                                    <span className="block text-sm font-semibold">
                                                        {code.label}
                                                    </span>
                                                    <span className="block text-xs text-muted-foreground">
                                                        {code.description}
                                                    </span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5 rounded-lg border border-dashed p-3">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">Parametri vitali</p>
                                <p className="text-xs text-muted-foreground">
                                    Dati obbligatori per una valutazione completa del paziente.
                                </p>
                            </div>
                            <div className="grid gap-2.5 md:grid-cols-2">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="triage-pressione">Pressione arteriosa (mmHg)</Label>
                                    <Input
                                        id="triage-pressione"
                                        name="pressioneArteriosa"
                                        value={triageForm.pressioneArteriosa}
                                        onChange={(event) =>
                                            setTriageForm((prev) => ({
                                                ...prev,
                                                pressioneArteriosa: event.target.value,
                                            }))
                                        }
                                        placeholder="es. 120/80"
                                        inputMode="numeric"
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="triage-temp">Temperatura corporea (°C)</Label>
                                    <Input
                                        id="triage-temp"
                                        name="temperaturaCorporea"
                                        type="number"
                                        step="0.1"
                                        value={triageForm.temperaturaCorporea}
                                        onChange={(event) =>
                                            setTriageForm((prev) => ({
                                                ...prev,
                                                temperaturaCorporea: event.target.value,
                                            }))
                                        }
                                        placeholder="es. 36.8"
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="triage-frequenza">Frequenza cardiaca (bpm)</Label>
                                    <Input
                                        id="triage-frequenza"
                                        name="frequenzaCardiaca"
                                        type="number"
                                        inputMode="numeric"
                                        value={triageForm.frequenzaCardiaca}
                                        onChange={(event) =>
                                            setTriageForm((prev) => ({
                                                ...prev,
                                                frequenzaCardiaca: event.target.value,
                                            }))
                                        }
                                        placeholder="es. 78"
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="triage-saturazione">Saturazione (%)</Label>
                                    <Input
                                        id="triage-saturazione"
                                        name="saturazione"
                                        type="number"
                                        inputMode="numeric"
                                        value={triageForm.saturazione}
                                        onChange={(event) =>
                                            setTriageForm((prev) => ({
                                                ...prev,
                                                saturazione: event.target.value,
                                            }))
                                        }
                                        placeholder="es. 98"
                                    />
                                </div>
                            </div>
                        </div>

                        {triageError ? <p className="text-sm font-medium text-red-600">{triageError}</p> : null}
                        {triageSuccess ? (
                            <p className="text-sm font-medium text-emerald-600">{triageSuccess}</p>
                        ) : null}

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Annulla
                            </Button>
                            <Button type="submit" disabled={!isFormValid || triageLoading}>
                                {triageLoading ? 'Invio...' : 'Conferma triage'}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
