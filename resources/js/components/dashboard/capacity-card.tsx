import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from 'lucide-react';

type AreaCapacity = {
    label: string;
    occupato: number;
    totale: number;
    accentClassName: string;
};

type CapacityCardProps = {
    areas: AreaCapacity[];
};

export function CapacityCard({ areas }: CapacityCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Capienza aree</CardTitle>
                    <CardDescription>Letti occupati vs disponibili</CardDescription>
                </div>
                <BarChart className="size-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
                {areas.map((area) => {
                    const percent = Math.min(100, Math.round((area.occupato / area.totale) * 100));

                    return (
                        <div key={area.label} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{area.label}</span>
                                <span className="text-muted-foreground">
                                    {area.occupato}/{area.totale}
                                </span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                                <div
                                    className={`${area.accentClassName} h-full rounded-full`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

export type { AreaCapacity };
