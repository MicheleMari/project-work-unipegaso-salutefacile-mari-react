import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ambulance, Clock4 } from 'lucide-react';

type Arrival118 = {
    id: string;
    mezzo: string;
    eta: string;
    codice: 'Bianco' | 'Verde' | 'Giallo' | 'Arancio' | 'Rosso';
    destinazione: string;
    note: string;
};

type Arrivals118CardProps = {
    items: Arrival118[];
};

const codiceClass: Record<Arrival118['codice'], string> = {
    Bianco:
        'bg-slate-200/60 text-slate-700 border-slate-200 dark:text-slate-100 dark:border-slate-700 dark:bg-slate-800/60',
    Verde:
        'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-200 dark:border-emerald-900/60',
    Giallo:
        'bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-200 dark:border-amber-900/60',
    Arancio:
        'bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-200 dark:border-orange-900/60',
    Rosso: 'bg-red-500/10 text-red-700 border-red-200 dark:text-red-200 dark:border-red-900/60',
};

export function Arrivals118Card({ items }: Arrivals118CardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Arrivi con 118</CardTitle>
                    <CardDescription>Ambulanze in arrivo e priorità assegnata</CardDescription>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                    <Clock4 className="size-3.5" />
                    ETA dinamica
                </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-start justify-between rounded-lg border border-border/70 bg-background/70 px-3 py-2"
                    >
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Ambulance className="size-4 text-blue-600 dark:text-blue-200" />
                                <span>{item.mezzo}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ETA {item.eta} • {item.destinazione}
                            </p>
                            <p className="text-xs text-muted-foreground">{item.note}</p>
                        </div>
                        <Badge variant="outline" className={codiceClass[item.codice]}>
                            {item.codice}
                        </Badge>
                    </div>
                ))}
                {!items.length ? (
                    <p className="text-sm text-muted-foreground">Nessuna Ambulanza in arrivo</p>
                ) : null}
            </CardContent>
        </Card>
    );
}

export type { Arrival118 };
