import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { HeartPulse, Play, ShieldCheck } from 'lucide-react';
import { BellRing } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

type ActionItem = {
    title: string;
    accent: 'amber' | 'blue' | 'emerald';
    badge: string;
    badgeTone?: 'solid' | 'muted';
};

type ActionsCardProps = {
    primaryCta: string;
    actions: ActionItem[];
};

const accentMap: Record<
    ActionItem['accent'],
    { container: string; text: string; badge: string; badgeMuted: string }
> = {
    amber: {
        container:
            'border-amber-200/70 bg-amber-500/10 text-amber-800 dark:border-amber-900/50 dark:text-amber-100',
        text: 'text-amber-800 dark:text-amber-100',
        badge: 'border-transparent bg-amber-600 text-amber-50',
        badgeMuted: 'border-amber-200 bg-white/30 text-amber-800 dark:border-amber-900/50 dark:text-amber-100',
    },
    blue: {
        container:
            'border-blue-200/70 bg-blue-500/10 text-blue-800 dark:border-blue-900/50 dark:text-blue-100',
        text: 'text-blue-800 dark:text-blue-100',
        badge: 'border-transparent bg-blue-600 text-blue-50',
        badgeMuted: 'border-blue-200 bg-white/30 text-blue-800 dark:border-blue-900/50 dark:text-blue-100',
    },
    emerald: {
        container:
            'border-emerald-200/70 bg-emerald-500/10 text-emerald-800 dark:border-emerald-900/50 dark:text-emerald-100',
        text: 'text-emerald-800 dark:text-emerald-100',
        badge: 'border-transparent bg-emerald-600 text-emerald-50',
        badgeMuted:
            'border-emerald-200 bg-white/30 text-emerald-800 dark:border-emerald-900/50 dark:text-emerald-100',
    },
};

const iconMap: Record<ActionItem['accent'], ComponentType<{ className?: string }>> = {
    amber: BellRing,
    blue: HeartPulse,
    emerald: ShieldCheck,
};

const priorityCodes = [
    {
        value: 'bianco',
        label: 'Bianco',
        description: 'Condizioni non urgenti',
        colorClass: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
        selectedClass:
            'border-slate-300 bg-slate-50 shadow-[0_0_0_1px_rgba(15,23,42,0.08)] dark:border-slate-700/70 dark:bg-slate-900/60',
    },
    {
        value: 'azzurro',
        label: 'Azzurro',
        description: 'Condizioni che possono attendere',
        colorClass: 'bg-sky-500 text-sky-50',
        selectedClass:
            'border-sky-200 bg-sky-50 shadow-[0_0_0_1px_rgba(56,189,248,0.25)] dark:border-sky-900/70 dark:bg-sky-950/40',
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
        value: 'arancione',
        label: 'Arancione',
        description: 'Condizione grave, intervento urgente',
        colorClass: 'bg-amber-500 text-amber-50',
        selectedClass:
            'border-amber-200 bg-amber-50 shadow-[0_0_0_1px_rgba(245,158,11,0.25)] dark:border-amber-900/70 dark:bg-amber-950/40',
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

export function ActionsCard({ primaryCta, actions }: ActionsCardProps) {
    const [triageOpen, setTriageOpen] = useState(false);
    const [triageForm, setTriageForm] = useState({
        nome: '',
        cognome: '',
        codiceFiscale: '',
        codicePriorita: '',
        motivoAccesso: '',
    });

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
        });
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isFormValid) return;
        // TODO: integrare con endpoint di creazione triage
        resetForm();
        setTriageOpen(false);
    };

    return (
        <Dialog
            open={triageOpen}
            onOpenChange={(open) => {
                setTriageOpen(open);
                if (!open) {
                    resetForm();
                }
            }}
        >
            <Card className="space-y-4">
                <CardHeader>
                    <CardTitle>Azioni operative</CardTitle>
                    <CardDescription>
                        Coordina triage, comunicazioni e percorsi critici
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button className="w-full" onClick={() => setTriageOpen(true)}>
                        <Play className="size-4" aria-hidden="true" />
                        {primaryCta}
                    </Button>
                    <div className="space-y-2 text-sm">
                        {actions.map((action) => {
                            const AccentIcon = iconMap[action.accent];
                            const colors = accentMap[action.accent];
                            const badgeClass =
                                action.badgeTone === 'muted' ? colors.badgeMuted : colors.badge;

                            return (
                                <div
                                    key={action.title}
                                    className={`flex items-center justify-between rounded-lg border px-3 py-2 ${colors.container}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <AccentIcon className="size-4" />
                                        <span className={colors.text}>{action.title}</span>
                                    </div>
                                    <Badge variant="outline" className={badgeClass}>
                                        {action.badge}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <DialogContent className="sm:max-w-4xl">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Avvia nuovo triage</DialogTitle>
                        <DialogDescription>
                            Inserisci i dati essenziali per aprire la scheda di triage.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-3">
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
                                <Label htmlFor="triage-cf">Codice fiscale</Label>
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

                        <div className="grid gap-3">
                            <Label>Codice di priorità</Label>
                            <div className="grid gap-2" role="radiogroup" aria-label="Codice di priorità">
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

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setTriageOpen(false)}>
                            Annulla
                        </Button>
                        <Button type="submit" disabled={!isFormValid}>
                            Conferma triage
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export type { ActionItem };
import type { ComponentType } from 'react';
