import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Ambulance, Stethoscope } from 'lucide-react';

type EmergencyItem = {
    paziente: string;
    codice: 'Rosso' | 'Giallo' | 'Verde';
    arrivo: string;
    attesa: string;
    destinazione: string;
    stato: string;
};

type EmergenciesCardProps = {
    items: EmergencyItem[];
};

const codiceBadgeClasses: Record<EmergencyItem['codice'], string> = {
    Rosso: 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/50 dark:text-red-200',
    Giallo:
        'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/50 dark:text-amber-200',
    Verde:
        'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-200',
};

export function EmergenciesCard({ items }: EmergenciesCardProps) {
    return (
        <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Emergenze in corso</CardTitle>
                    <CardDescription>
                        Monitoraggio arrivi, codice colore e destinazioni
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-500/10 text-blue-700 dark:border-blue-900/50 dark:text-blue-200"
                    >
                        Tempo medio triage 07:10
                    </Badge>
                    <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-200"
                    >
                        Monitor continuo
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {items.map((item) => (
                    <div
                        key={item.paziente}
                        className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background/70 p-3 shadow-xs md:flex-row md:items-center md:justify-between"
                    >
                        <div className="flex items-start gap-3">
                            <Badge
                                variant="outline"
                                className={codiceBadgeClasses[item.codice]}
                            >
                                {item.codice}
                            </Badge>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold leading-tight">{item.paziente}</p>
                                <p className="text-xs text-muted-foreground">{item.arrivo}</p>
                                <div className="inline-flex items-center gap-2 rounded-md bg-muted/70 px-2 py-1 text-[11px] text-muted-foreground">
                                    <Ambulance className="size-3.5" />
                                    Attesa {item.attesa}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:items-end">
                            <span className="font-medium text-foreground">{item.destinazione}</span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-200">
                                <Stethoscope className="size-3.5" />
                                {item.stato}
                            </span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export type { EmergencyItem };
