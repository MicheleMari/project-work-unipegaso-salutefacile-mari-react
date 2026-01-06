import { Badge } from '@/components/ui/badge';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BellRing, HeartPulse, ShieldCheck } from 'lucide-react';
import type { ActionItem } from './types';

const accentMap: Record<
    ActionItem['accent'],
    { container: string; text: string; badge: string; badgeMuted: string }
> = {
    amber: {
        container:
            'border-amber-200/70 bg-amber-500/10 text-amber-800 dark:border-amber-900/50 dark:text-amber-100',
        text: 'text-amber-800 dark:text-amber-100',
        badge: 'border-transparent bg-amber-600 text-amber-50',
        badgeMuted: 'border-amber-200 bg-white/30 text-amber-800 dark:border-amber-900/50 dark:text-amber-100',
    },
    blue: {
        container:
            'border-blue-200/70 bg-blue-500/10 text-blue-800 dark:border-blue-900/50 dark:text-blue-100',
        text: 'text-blue-800 dark:text-blue-100',
        badge: 'border-transparent bg-blue-600 text-blue-50',
        badgeMuted: 'border-blue-200 bg-white/30 text-blue-800 dark:border-blue-900/50 dark:text-blue-100',
    },
    emerald: {
        container:
            'border-emerald-200/70 bg-emerald-500/10 text-emerald-800 dark:border-emerald-900/50 dark:text-emerald-100',
        text: 'text-emerald-800 dark:text-emerald-100',
        badge: 'border-transparent bg-emerald-600 text-emerald-50',
        badgeMuted:
            'border-emerald-200 bg-white/30 text-emerald-800 dark:border-emerald-900/50 dark:text-emerald-100',
    },
};

const iconMap = {
    amber: BellRing,
    blue: HeartPulse,
    emerald: ShieldCheck,
};

export function ActionsList({ actions }: { actions: ActionItem[] }) {
    return (
        <>
            <CardHeader>
                <CardTitle>Azioni operative</CardTitle>
                <CardDescription>Coordina triage, comunicazioni e percorsi critici</CardDescription>
            </CardHeader>
            <div className="space-y-2 text-sm">
                {actions.map((action) => {
                    const AccentIcon = iconMap[action.accent];
                    const colors = accentMap[action.accent];
                    const badgeClass = action.badgeTone === 'muted' ? colors.badgeMuted : colors.badge;

                    return (
                        <div
                            key={action.title}
                            className={cn(
                                'flex items-center justify-between rounded-lg border px-3 py-2',
                                colors.container
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <AccentIcon className="size-4" />
                                <span className={colors.text}>{action.title}</span>
                            </div>
                            <Badge variant="outline" className={badgeClass}>
                                {action.badge}
                            </Badge>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
