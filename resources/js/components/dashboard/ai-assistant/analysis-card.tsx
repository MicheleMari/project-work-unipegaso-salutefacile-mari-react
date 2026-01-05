import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, Stethoscope } from 'lucide-react';
import type { ComponentType } from 'react';

type SeverityCode = 'rosso' | 'giallo' | 'verde' | 'sconosciuto';

export type TriageAnalysis = {
    severity: SeverityCode;
    specialist: string;
    summary?: string | null;
    recommendations?: string[] | null;
};

const severityCopy: Record<SeverityCode, { label: string; tone: string; accent: string }> = {
    rosso: {
        label: 'Codice Rosso',
        tone: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100',
        accent: 'bg-red-500 text-red-50',
    },
    giallo: {
        label: 'Codice Giallo',
        tone: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-50',
        accent: 'bg-amber-500 text-amber-50',
    },
    verde: {
        label: 'Codice Verde',
        tone: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-50',
        accent: 'bg-emerald-500 text-emerald-50',
    },
    sconosciuto: {
        label: 'Codice non classificato',
        tone: 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100',
        accent: 'bg-slate-500 text-slate-50',
    },
};

const severityIcon: Record<SeverityCode, ComponentType<{ className?: string }>> = {
    rosso: AlertTriangle,
    giallo: AlertTriangle,
    verde: CheckCircle2,
    sconosciuto: Stethoscope,
};

export function AnalysisCard({ analysis }: { analysis: TriageAnalysis }) {
    const severity = severityCopy[analysis.severity] ?? severityCopy.sconosciuto;
    const Icon = severityIcon[analysis.severity] ?? Stethoscope;

    return (
        <Card className={cn('shadow-md transition-colors', severity.tone)}>
            <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Icon className="size-4" aria-hidden="true" />
                        Valutazione AI
                    </CardTitle>
                    <Badge className={cn('text-xs font-semibold', severity.accent)}>
                        {severity.label}
                    </Badge>
                </div>
                {analysis.specialist ? (
                    <p className="text-sm font-medium">
                        Specialista consigliato: <span className="font-semibold">{analysis.specialist}</span>
                    </p>
                ) : null}
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
                {analysis.summary ? (
                    <p className="text-sm leading-relaxed">{analysis.summary}</p>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Nessun dettaglio aggiuntivo fornito dall&apos;assistente.
                    </p>
                )}

                {analysis.recommendations && analysis.recommendations.length > 0 ? (
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Prossimi passi suggeriti
                        </p>
                        <ul className="space-y-1.5 text-sm">
                            {analysis.recommendations.map((item, index) => (
                                <li
                                    key={`${item}-${index}`}
                                    className="flex items-start gap-2 rounded-md bg-background/70 px-2 py-1.5"
                                >
                                    <span className="mt-1 inline-flex size-1.5 rounded-full bg-current opacity-70" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}

export function normalizeSeverity(input?: string | null): SeverityCode {
    const value = (input ?? '').toLowerCase().trim();
    if (value === 'rosso') return 'rosso';
    if (value === 'giallo' || value === 'arancio' || value === 'arancione') return 'giallo';
    if (value === 'verde' || value === 'bianco') return 'verde';
    return 'sconosciuto';
}
