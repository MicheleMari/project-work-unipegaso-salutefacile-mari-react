import { Badge } from '@/components/ui/badge';
import { type ReactNode } from 'react';

type Code = 'Rosso' | 'Giallo' | 'Verde';

const codiceFilterClasses: Record<Code, string> = {
    Rosso:
        'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/60 dark:text-red-200 hover:bg-red-500/15',
    Giallo:
        'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/60 dark:text-amber-200 hover:bg-amber-500/15',
    Verde:
        'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-200 hover:bg-emerald-500/15',
};

const codiceActiveRing: Record<Code, string> = {
    Rosso: 'ring-red-400/70',
    Giallo: 'ring-amber-400/70',
    Verde: 'ring-emerald-400/70',
};

const statusFilterClasses: Record<string, string> = {
    'In triage': 'border-sky-200 bg-sky-500/10 text-sky-700 dark:border-sky-900/60 dark:text-sky-200',
    'In valutazione':
        'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/60 dark:text-amber-200',
    'Dimesso':
        'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-200',
    'In trattamento':
        'border-purple-200 bg-purple-500/10 text-purple-700 dark:border-purple-900/60 dark:text-purple-200',
    'Emergenze in corso':
        'border-blue-200 bg-blue-500/10 text-blue-700 dark:border-blue-900/60 dark:text-blue-200',
    'Accertamenti preliminari in corso':
        'border-emerald-300 bg-emerald-500/15 text-emerald-800 dark:border-emerald-800 dark:text-emerald-100',
    'Specialista chiamato':
        'border-blue-200 bg-blue-500/15 text-blue-800 dark:border-blue-800 dark:text-blue-100',
    'Referto inviato':
        'border-emerald-200 bg-emerald-500/15 text-emerald-800 dark:border-emerald-800 dark:text-emerald-100',
    Chiusura:
        'border-emerald-200 bg-emerald-500/15 text-emerald-800 dark:border-emerald-800 dark:text-emerald-100',
};

const statusActiveRing: Record<string, string> = {
    'In triage': 'ring-sky-400/70',
    'In valutazione': 'ring-amber-400/70',
    'Dimesso': 'ring-emerald-400/70',
    'In trattamento': 'ring-purple-400/70',
    'Emergenze in corso': 'ring-blue-400/70',
    'Accertamenti preliminari in corso': 'ring-emerald-400/70',
    'Specialista chiamato': 'ring-blue-400/70',
    'Referto inviato': 'ring-emerald-400/70',
    Chiusura: 'ring-emerald-400/70',
};

const waitFilterOptions = [
    { key: 'all' as const, label: 'Tutti i tempi' },
    {
        key: 'green' as const,
        label: 'Nei tempi',
        className:
            'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-200',
    },
    {
        key: 'yellow' as const,
        label: 'Soglia gialla',
        className:
            'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/60 dark:text-amber-200',
    },
    {
        key: 'red' as const,
        label: 'In ritardo',
        className: 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/60 dark:text-red-200',
    },
];

const waitActiveRing: Record<'all' | 'green' | 'yellow' | 'red', string> = {
    all: '',
    green: 'ring-emerald-400/70',
    yellow: 'ring-amber-400/70',
    red: 'ring-red-400/70',
};

type EmergenciesFilterProps = {
    codeFilter: 'all' | Code;
    statusFilter: 'all' | string;
    waitFilter: 'all' | 'green' | 'yellow' | 'red';
    codiceOptions: Code[];
    statusOptions: string[];
    onCodeChange: (value: 'all' | Code) => void;
    onStatusChange: (value: 'all' | string) => void;
    onWaitChange: (value: 'all' | 'green' | 'yellow' | 'red') => void;
};

export function EmergenciesFilter({
    codeFilter,
    statusFilter,
    waitFilter,
    codiceOptions,
    statusOptions,
    onCodeChange,
    onStatusChange,
    onWaitChange,
}: EmergenciesFilterProps) {
    const selectedBadge =
        'ring-2 ring-offset-1 ring-offset-background font-semibold shadow-md shadow-primary/10';
    const badgeBase =
        'cursor-pointer rounded-full px-3 py-1 text-xs tracking-tight transition-all hover:-translate-y-0.5 hover:shadow-sm';

    const renderGroup = (title: string, children: ReactNode) => (
        <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</span>
            <div className="flex flex-wrap gap-2">{children}</div>
        </div>
    );

    return (
        <div className="rounded-xl border border-border/70 bg-gradient-to-br from-muted/60 via-background to-muted/40 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                    Filtra
                </span>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
                {renderGroup(
                    'Codice priorità',
                    <>
                        <Badge
                            variant={codeFilter === 'all' ? 'secondary' : 'outline'}
                            className={`${badgeBase} ${codeFilter === 'all' ? selectedBadge : ''}`}
                            onClick={() => onCodeChange('all')}
                        >
                            Tutti i codici
                        </Badge>
                        {codiceOptions.map((code) => (
                            <Badge
                                key={code}
                                variant={codeFilter === code ? 'secondary' : 'outline'}
                                className={`${badgeBase} ${codiceFilterClasses[code]} ${
                                    codeFilter === code ? `${selectedBadge} ${codiceActiveRing[code]}` : ''
                                }`}
                                onClick={() => onCodeChange(codeFilter === code ? 'all' : code)}
                            >
                                {code}
                            </Badge>
                        ))}
                    </>,
                )}

                {renderGroup(
                    'Stato',
                    <>
                        <Badge
                            variant={statusFilter === 'all' ? 'secondary' : 'outline'}
                            className={`${badgeBase} ${statusFilter === 'all' ? selectedBadge : ''}`}
                            onClick={() => onStatusChange('all')}
                        >
                            Tutti gli stati
                        </Badge>
                        {statusOptions.map((status) => (
                            <Badge
                                key={status}
                                variant={statusFilter === status ? 'secondary' : 'outline'}
                                className={`${badgeBase} ${statusFilterClasses[status] ?? ''} ${
                                    statusFilter === status
                                        ? `${selectedBadge} ${statusActiveRing[status] ?? 'ring-muted-foreground/40'}`
                                        : ''
                                }`}
                                onClick={() => onStatusChange(statusFilter === status ? 'all' : status)}
                            >
                                {status}
                            </Badge>
                        ))}
                    </>,
                )}

                {renderGroup(
                    'Tempo di attesa',
                    waitFilterOptions.map((opt) => (
                        <Badge
                            key={opt.key}
                            variant={waitFilter === opt.key ? 'secondary' : 'outline'}
                            className={`${badgeBase} ${opt.className ?? ''} ${
                                waitFilter === opt.key ? `${selectedBadge} ${waitActiveRing[opt.key] ?? ''}` : ''
                            }`}
                            onClick={() => onWaitChange(waitFilter === opt.key ? 'all' : opt.key)}
                        >
                            {opt.label}
                        </Badge>
                    )),
                )}
            </div>
        </div>
    );
}
