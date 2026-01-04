import { useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type PreliminaryExam = {
    id: number | string;
    title: string;
    description?: string | null;
};

type PreliminaryExamsDialogProps = {
    open: boolean;
    patientName?: string;
    investigations: PreliminaryExam[];
    onOpenChange: (open: boolean) => void;
    onConfirm?: (selectedIds: string[]) => Promise<void> | void;
};

export function PreliminaryExamsDialog({
    open,
    patientName,
    investigations,
    onOpenChange,
    onConfirm,
}: PreliminaryExamsDialogProps) {
    const [search, setSearch] = useState('');
    const [selectedExams, setSelectedExams] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasSelection = selectedExams.size > 0;

    useEffect(() => {
        if (!open) {
            setSearch('');
            setSelectedExams(new Set());
            setError(null);
            setSubmitting(false);
        }
    }, [open]);

    const filteredExams = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return investigations;
        return investigations.filter(
            (exam) =>
                exam.title.toLowerCase().includes(term) ||
                (exam.description ?? '').toLowerCase().includes(term),
        );
    }, [search, investigations]);

    const toggleExam = (id: string) => {
        setSelectedExams((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleConfirm = async () => {
        if (!hasSelection) return;
        setSubmitting(true);
        setError(null);
        try {
            await onConfirm?.(Array.from(selectedExams));
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore nel salvataggio');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle>
                        Richiesta accertamenti preliminari
                        {patientName ? ` - ${patientName}` : ''}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">Seleziona gli esami preliminari</p>
                            <p className="text-xs text-muted-foreground">
                                Puoi selezionare uno o piu esami, saranno associati al triage di{' '}
                                {patientName || 'paziente'}.
                            </p>
                        </div>
                        <div className="relative sm:w-80">
                            <Input
                                placeholder="Cerca esame..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="pl-3"
                            />
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {filteredExams.map((exam) => {
                            const examId = String(exam.id);
                            const isSelected = selectedExams.has(examId);
                            return (
                                <ExamCard
                                    key={examId}
                                    exam={exam}
                                    isSelected={isSelected}
                                    onToggle={() => toggleExam(examId)}
                                />
                            );
                        })}
                        {filteredExams.length === 0 ? (
                            <div className="col-span-full rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                Nessun esame trovato
                            </div>
                        ) : null}
                    </div>

                    {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{selectedExams.size} esami selezionati</span>
                        <div className="flex gap-2">
                            {hasSelection ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedExams(new Set())}
                                    disabled={submitting}
                                >
                                    Svuota selezione
                                </Button>
                            ) : null}
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleConfirm}
                                disabled={!hasSelection || submitting}
                            >
                                {submitting ? 'Salvataggio...' : 'Conferma selezione'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

type ExamCardProps = {
    exam: PreliminaryExam;
    isSelected: boolean;
    onToggle: () => void;
};

function ExamCard({ exam, isSelected, onToggle }: ExamCardProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`flex h-full flex-col rounded-lg border p-3 text-left transition hover:border-ring hover:shadow-sm ${
                isSelected
                    ? 'border-emerald-500/60 bg-emerald-50/60 dark:bg-emerald-900/20'
                    : 'bg-background'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold leading-tight">{exam.title}</p>
                <span
                    className={`inline-flex h-5 w-5 flex-shrink-0 items-center justify-center self-start rounded-full border-2 transition-colors ${
                        isSelected
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-muted-foreground/50 bg-transparent'
                    }`}
                    aria-hidden="true"
                >
                    {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-white" /> : null}
                </span>
            </div>
            <p className="mt-2 w-full text-xs text-muted-foreground">
                {exam.description ?? 'Nessuna descrizione'}
            </p>
        </button>
    );
}

export type { PreliminaryExam };
