import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ambulance, Clock4 } from 'lucide-react';
import type { Arrival118 } from '../arrivals-118-card';

const arrivalBadgeClasses: Record<string, string> = {
    rosso: 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/60 dark:text-red-200',
    arancio: 'border-orange-200 bg-orange-500/10 text-orange-700 dark:border-orange-900/60 dark:text-orange-200',
    arancione: 'border-orange-200 bg-orange-500/10 text-orange-700 dark:border-orange-900/60 dark:text-orange-200',
    giallo: 'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/60 dark:text-amber-200',
    verde: 'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-200',
    bianco: 'border-slate-200 bg-slate-200/50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100',
};

type ArrivalsPanelProps = {
    arrivals: Arrival118[];
    onArrivalHandled?: (arrivalId: Arrival118['id']) => void;
};

export function ArrivalsPanel({ arrivals, onArrivalHandled }: ArrivalsPanelProps) {
    return (
        <div className="space-y-2 rounded-lg border border-dashed px-3 py-2">
            <div className="flex items-center justify-between text-sm font-semibold">
                <div className="flex items-center gap-2">
                    <Ambulance className="size-4 text-blue-600 dark:text-blue-200" />
                    <span>Arrivi con 118</span>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                    <Clock4 className="size-3.5" />
                    ETA
                </Badge>
            </div>
            {arrivals.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nessun arrivo 118 imminente.</p>
            ) : (
                <div className="space-y-2">
                    {arrivals
                        .slice()
                        .sort((a, b) => priorityOrder(a.codice) - priorityOrder(b.codice))
                        .map((arrival) => (
                            <div
                                key={arrival.id}
                                className="space-y-2 rounded-lg border border-border/70 bg-background/70 p-3"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1 text-sm">
                                        <p className="font-semibold">{arrival.mezzo}</p>
                                        <p className="text-xs text-muted-foreground">
                                            ETA {arrival.eta} · {arrival.destinazione}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{arrival.note}</p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={
                                            arrivalBadgeClasses[arrival.codice.toLowerCase()] ??
                                            'border-slate-200 bg-slate-200/40 text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100'
                                        }
                                    >
                                        {arrival.codice}
                                    </Badge>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => onArrivalHandled?.(arrival.id)}
                                    type="button"
                                >
                                    Arrivato in PS
                                </Button>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

function priorityOrder(code: string) {
    const normalized = code.toLowerCase();
    if (normalized === 'rosso') return 1;
    if (normalized === 'arancio' || normalized === 'arancione') return 2;
    if (normalized === 'giallo') return 3;
    if (normalized === 'verde') return 4;
    return 5;
}
