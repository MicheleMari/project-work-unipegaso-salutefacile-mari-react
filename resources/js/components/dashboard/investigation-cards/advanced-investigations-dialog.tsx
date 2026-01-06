import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import type { AdvancedInvestigationsDialogProps, SpecialistInvestigationOption } from './types';

export function AdvancedInvestigationsDialog({
    open,
    onOpenChange,
    options,
    loading,
    error,
    selected,
    onToggle,
    onConfirm,
}: AdvancedInvestigationsDialogProps) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return options;
        return options.filter((item) => {
            const title = item.title.toLowerCase();
            const dept = item.department?.name?.toLowerCase() ?? '';
            return title.includes(term) || dept.includes(term);
        });
    }, [options, search]);

    const byDepartment = useMemo(() => {
        return filtered.reduce<Record<string, SpecialistInvestigationOption[]>>((acc, item) => {
            const key = item.department?.name ?? 'Altro';
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    }, [filtered]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Accertamenti specialistici</DialogTitle>
                </DialogHeader>
                <Input
                    placeholder="Cerca per nome o reparto"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                {loading ? <p className="text-sm text-muted-foreground">Caricamento esami...</p> : null}
                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
                <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
                    {Object.entries(byDepartment).map(([dept, list]) => (
                        <div key={dept} className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dept}</p>
                            {list.map((option) => {
                                const checked = selected.has(option.id);
                                return (
                                    <label
                                        key={option.id}
                                        className={`flex cursor-pointer items-start gap-3 rounded-md border bg-background p-3 transition hover:border-foreground/40 ${
                                            checked ? 'border-primary ring-2 ring-primary/30' : 'border-border/60'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-1 h-4 w-4"
                                            checked={checked}
                                            onChange={() => onToggle(option.id)}
                                        />
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-semibold text-foreground">{option.title}</span>
                                            {option.description ? (
                                                <span className="text-xs text-muted-foreground">{option.description}</span>
                                            ) : null}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    ))}
                    {!loading && !filtered.length ? (
                        <p className="text-sm text-muted-foreground">Nessun accertamento specialistico disponibile.</p>
                    ) : null}
                </div>
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Annulla
                    </Button>
                    <Button onClick={onConfirm} disabled={!selected.size}>
                        Conferma
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
