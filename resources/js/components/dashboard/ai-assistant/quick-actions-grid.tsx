import { cn } from '@/lib/utils';
import type { QuickAction } from './types';

type QuickActionsGridProps = {
    items: QuickAction[];
    onSelect: (prompt: string) => void;
};

export function QuickActionsGrid({ items, onSelect }: QuickActionsGridProps) {
    return (
        <div className="space-y-3 rounded-xl border bg-muted/40 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Azioni rapide
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {items.map((item) => (
                    <button
                        key={item.title}
                        type="button"
                        onClick={() => onSelect(item.prompt)}
                        className={cn(
                            'flex items-start gap-3 rounded-lg border bg-background px-3 py-2 text-left shadow-xs transition',
                            'hover:-translate-y-[1px] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        )}
                    >
                        <item.icon className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold leading-tight">{item.title}</p>
                            <p className="text-xs leading-snug text-muted-foreground">{item.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
