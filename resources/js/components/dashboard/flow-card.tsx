import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ambulance, HeartPulse, Users } from 'lucide-react';

type FlowItem = {
    label: string;
    value: string;
    accent: 'blue' | 'amber' | 'red';
};

type FlowCardProps = {
    items: FlowItem[];
};

const flowMap: Record<
    FlowItem['accent'],
    { icon: ComponentType<{ className?: string }>; badge: string; text: string }
> = {
    blue: {
        icon: Ambulance,
        badge: 'border-blue-200 bg-blue-500/10 text-blue-700 dark:border-blue-900/50 dark:text-blue-200',
        text: 'text-blue-700 dark:text-blue-200',
    },
    amber: {
        icon: Users,
        badge: 'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/50 dark:text-amber-200',
        text: 'text-amber-700 dark:text-amber-200',
    },
    red: {
        icon: HeartPulse,
        badge: 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/50 dark:text-red-200',
        text: 'text-red-700 dark:text-red-200',
    },
};

export function FlowCard({ items }: FlowCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Flusso arrivi</CardTitle>
                <CardDescription>Ultimi 30 minuti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {items.map((item) => {
                    const config = flowMap[item.accent];
                    const Icon = config.icon;

                    return (
                        <div
                            key={item.label}
                            className="flex items-center justify-between rounded-lg border border-border/70 bg-background/70 px-3 py-2"
                        >
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Icon className={`size-4 ${config.text}`} />
                                {item.label}
                            </div>
                            <Badge variant="outline" className={config.badge}>
                                {item.value}
                            </Badge>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

export type { FlowItem };
import type { ComponentType } from 'react';
