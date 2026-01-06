import { cn } from '@/lib/utils';
import type { ClinicalService } from './types';

type ClinicalServicesListProps = {
    items: ClinicalService[];
    onSelect: (prompt: string) => void;
};

export function ClinicalServicesList({ items, onSelect }: ClinicalServicesListProps) {
    return (
        <div className="space-y-3 rounded-xl border bg-background/60 p-3">
            <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Servizi per il personale sanitario
                </div>
                <span className="text-[11px] font-medium text-primary">Seleziona e compila subito</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {items.map((service) => (
                    <button
                        key={service.title}
                        type="button"
                        onClick={() => onSelect(service.prompt)}
                        className={cn(
                            'flex items-start gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-left transition',
                            'hover:-translate-y-[1px] hover:border-primary hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        )}
                    >
                        <service.icon className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold leading-tight">{service.title}</p>
                            <p className="text-xs leading-snug text-muted-foreground">{service.description}</p>
                        </div>
                        <span className="ml-auto text-[11px] font-semibold text-primary">Usa</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
