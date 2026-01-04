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
    'In triage': 'border-blue-200 bg-blue-500/10 text-blue-700 dark:border-blue-900/60 dark:text-blue-200',
    'In valutazione':
        'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/60 dark:text-amber-200',
    'Dimesso':
        'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-200',
    'In trattamento':
        'border-purple-200 bg-purple-500/10 text-purple-700 dark:border-purple-900/60 dark:text-purple-200',
    'Accertamenti preliminari in corso':
        'border-emerald-300 bg-emerald-500/15 text-emerald-800 dark:border-emerald-800 dark:text-emerald-100',
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
    const selectedBadge = 'ring-2 ring-offset-1 ring-offset-background font-semibold shadow-sm';

    const renderGroup = (title: string, children: ReactNode) => (
        <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground">{title}</span>
            <div className="flex flex-wrap gap-1">{children}</div>
        </div>
    );

    return (
        <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Filtra</span>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
                {renderGroup(
                    'Codice priorità',
                    <>
                        <Badge
                            variant={codeFilter === 'all' ? 'secondary' : 'outline'}
                            className={`cursor-pointer ${codeFilter === 'all' ? selectedBadge : ''}`}
                            onClick={() => onCodeChange('all')}
                        >
                            Tutti i codici
                        </Badge>
                        {codiceOptions.map((code) => (
                            <Badge
                                key={code}
                                variant={codeFilter === code ? 'secondary' : 'outline'}
                                className={`cursor-pointer ${codiceFilterClasses[code]} ${
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
                            className={`cursor-pointer ${statusFilter === 'all' ? selectedBadge : ''}`}
                            onClick={() => onStatusChange('all')}
                        >
                            Tutti gli stati
                        </Badge>
                        {statusOptions.map((status) => (
                            <Badge
                                key={status}
                                variant={statusFilter === status ? 'secondary' : 'outline'}
                                className={`cursor-pointer ${statusFilterClasses[status] ?? ''} ${
                                    statusFilter === status ? `${selectedBadge} ring-sky-400/70` : ''
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
                            className={`cursor-pointer ${opt.className ?? ''} ${
                                waitFilter === opt.key ? `${selectedBadge} ring-amber-400/70` : ''
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
