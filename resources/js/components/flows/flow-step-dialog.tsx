import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type FlowStatus = 'pending' | 'in-progress' | 'completed';

const statusCopy: Record<
    FlowStatus,
    { label: string; className: string; description: string }
> = {
    pending: {
        label: 'Da pianificare',
        className: 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-500/10 dark:text-amber-200',
        description: 'In attesa di avvio',
    },
    'in-progress': {
        label: 'In corso',
        className: 'bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-500/10 dark:text-blue-200',
        description: 'Azione aperta',
    },
    completed: {
        label: 'Completato',
        className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-200',
        description: 'Step chiuso',
    },
};

type Accent = 'blue' | 'emerald' | 'amber' | 'violet' | 'rose';

const accentMap: Record<Accent, string> = {
    blue: 'border-blue-200/70 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30',
    emerald:
        'border-emerald-200/70 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30',
    amber: 'border-amber-200/70 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30',
    violet: 'border-violet-200/70 bg-violet-50 dark:border-violet-900/50 dark:bg-violet-950/30',
    rose: 'border-rose-200/70 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30',
};

interface FlowStepDialogProps {
    stepNumber: number;
    title: string;
    description: string;
    status: FlowStatus;
    accent?: Accent;
    triggerLabel?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
    footer?: ReactNode;
}

export function FlowStepDialog({
    stepNumber,
    title,
    description,
    status,
    accent = 'blue',
    triggerLabel = 'Gestisci',
    open,
    onOpenChange,
    children,
    footer,
}: FlowStepDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <Card className={cn('border shadow-sm transition hover:shadow-md', accentMap[accent])}>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-muted-foreground shadow-sm ring-1 ring-black/5 dark:bg-slate-900">
                                {stepNumber}
                            </span>
                            {title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <Badge className={cn('flex-none px-2.5 py-1 text-xs font-semibold', statusCopy[status].className)}>
                        {statusCopy[status].label}
                    </Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">{statusCopy[status].description}</p>
                    <Button size="sm" variant="secondary" onClick={() => onOpenChange(true)}>
                        {triggerLabel}
                    </Button>
                </CardContent>
            </Card>

            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground shadow-sm">
                            {stepNumber}
                        </span>
                        {title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">{children}</div>
                {footer}
            </DialogContent>
        </Dialog>
    );
}
