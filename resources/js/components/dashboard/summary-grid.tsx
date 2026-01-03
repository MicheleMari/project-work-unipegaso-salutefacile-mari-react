import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

type SummaryCardItem = {
    label: string;
    value: string;
    delta: string;
    chip: string;
    accentClassName: string;
    icon: LucideIcon;
};

type SummaryGridProps = {
    items: SummaryCardItem[];
};

export function SummaryGrid({ items }: SummaryGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
                <Card
                    key={item.label}
                    className="border-border/70 bg-background/80 shadow-sm backdrop-blur"
                >
                    <CardHeader className="flex flex-row items-start justify-between pb-3">
                        <div className="space-y-1">
                            <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                                {item.label}
                            </CardDescription>
                            <CardTitle className="text-2xl font-semibold">{item.value}</CardTitle>
                            <p className="text-xs text-muted-foreground">{item.delta}</p>
                        </div>
                        <span
                            className={`flex size-11 items-center justify-center rounded-lg border ${item.accentClassName}`}
                        >
                            <item.icon className="size-5" aria-hidden="true" />
                        </span>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <Badge variant="outline" className={`${item.accentClassName} text-xs`}>
                            {item.chip}
                        </Badge>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export type { SummaryCardItem };
