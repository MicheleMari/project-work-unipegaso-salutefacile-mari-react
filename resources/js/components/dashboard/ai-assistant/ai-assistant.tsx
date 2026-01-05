import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { postJson } from '@/lib/api';
import { Bot, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnalysisCard, normalizeSeverity, type TriageAnalysis } from './analysis-card';

type ApiTriageAnalysis = {
    severity?: string | null;
    specialist?: string | null;
    summary?: string | null;
    recommendations?: string[] | null;
};

export function AiAssistant() {
    const [open, setOpen] = useState(false);
    const [symptoms, setSymptoms] = useState('');
    const [analysis, setAnalysis] = useState<TriageAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canAnalyze = useMemo(() => symptoms.trim().length >= 6 && !loading, [symptoms, loading]);

    const handleSymptomsChange = (value: string) => {
        setSymptoms(value);
        setError(null);
        if (analysis) {
            setAnalysis(null);
        }
    };

    const handleToggle = () => {
        setOpen((prev) => !prev);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!canAnalyze) return;
        setLoading(true);
        setError(null);

        try {
            const payload = await postJson<ApiTriageAnalysis>('/api/triage-analyze', {
                symptoms: symptoms.trim(),
            });

            setAnalysis({
                severity: normalizeSeverity(payload?.severity),
                specialist: payload?.specialist?.trim() || 'Valutazione medica',
                summary:
                    payload?.summary?.trim() ||
                    'Analisi completata. Consulta il medico di reparto per una valutazione clinica.',
                recommendations: payload?.recommendations ?? null,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Impossibile completare l\'analisi.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {open ? (
                <AssistantPanel
                    symptoms={symptoms}
                    onSymptomsChange={handleSymptomsChange}
                    onAnalyze={handleAnalyze}
                    onClose={handleClose}
                    loading={loading}
                    error={error}
                    canAnalyze={canAnalyze}
                    analysis={analysis}
                />
            ) : null}

            <Button
                size="icon"
                className={cn(
                    'size-14 rounded-full shadow-lg shadow-primary/30 transition-transform hover:scale-105',
                    open ? 'bg-primary/90' : 'bg-primary',
                )}
                onClick={handleToggle}
                aria-expanded={open}
                aria-label={open ? 'Chiudi assistente AI' : 'Apri assistente AI'}
            >
                <Bot className="size-6" aria-hidden="true" />
            </Button>
        </div>
    );
}

type AssistantPanelProps = {
    symptoms: string;
    onSymptomsChange: (value: string) => void;
    onAnalyze: () => void;
    onClose: () => void;
    loading: boolean;
    canAnalyze: boolean;
    error: string | null;
    analysis: TriageAnalysis | null;
};

function AssistantPanel({
    symptoms,
    onSymptomsChange,
    onAnalyze,
    onClose,
    loading,
    canAnalyze,
    error,
    analysis,
}: AssistantPanelProps) {
    return (
        <div className="w-[min(440px,calc(100vw-3rem))] animate-in fade-in zoom-in-95 slide-in-from-bottom-2">
            <Card className="relative rounded-2xl border shadow-2xl">
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="size-5 text-primary" aria-hidden="true" />
                            Assistente AI
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Descrivi i sintomi: il sistema propone codice e specialista.
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Chiudi assistente">
                        <X className="size-4" aria-hidden="true" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4 pb-5">
                    <div className="space-y-2">
                        <Label htmlFor="ai-symptoms">Sintomi principali</Label>
                        <div className="space-y-2">
                            <textarea
                                id="ai-symptoms"
                                value={symptoms}
                                onChange={(event) => onSymptomsChange(event.target.value)}
                                placeholder="Esempio: dolore toracico improvviso, dispnea, sudorazione fredda."
                                rows={4}
                                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full min-w-0 rounded-lg border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                Testo minimo: qualche riga sui sintomi e sul contesto clinico.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-muted-foreground">
                            I suggerimenti non sostituiscono la valutazione medica.
                        </div>
                        <Button
                            onClick={onAnalyze}
                            disabled={!canAnalyze}
                            className="min-w-[120px] justify-center"
                            aria-disabled={!canAnalyze}
                        >
                            {loading ? <Spinner className="text-primary-foreground" /> : null}
                            {loading ? 'Analisi...' : 'Analizza'}
                        </Button>
                    </div>

                    {error ? (
                        <p className="text-sm font-medium text-red-600" role="alert">
                            {error}
                        </p>
                    ) : null}

                    {analysis ? <AnalysisCard analysis={analysis} /> : null}
                </CardContent>
            </Card>
        </div>
    );
}
