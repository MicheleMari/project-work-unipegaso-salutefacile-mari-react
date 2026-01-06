import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import type { SpecialistProfile } from './types';
import type { SpecialistCallDialogProps } from './types';

export function SpecialistCallDialog({
    open,
    onOpenChange,
    specialists,
    patientName,
    loading,
    error,
    onCall,
    calling,
    callError,
}: SpecialistCallDialogProps) {
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return specialists;
        return specialists.filter((user) => {
            const fullName = `${user.name} ${user.surname}`.toLowerCase();
            const dept = user.department.toLowerCase();
            return fullName.includes(term) || dept.includes(term);
        });
    }, [search, specialists]);

    const byDepartment = useMemo(() => {
        return filtered.reduce<Record<string, SpecialistProfile[]>>((acc, specialist) => {
            if (!acc[specialist.department]) acc[specialist.department] = [];
            acc[specialist.department].push(specialist);
            return acc;
        }, {});
    }, [filtered]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Specialisti disponibili {patientName ? `per ${patientName}` : ''}</DialogTitle>
                </DialogHeader>
                <Input
                    placeholder="Cerca per nome, cognome o reparto"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Caricamento specialisti...</p>
                    ) : null}
                    {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
                    {!loading && !error
                        ? Object.entries(byDepartment).map(([department, users]) => (
                              <div key={department} className="rounded-lg border border-border/80 bg-muted/20 p-3">
                                  <p className="text-sm font-semibold text-foreground">{department}</p>
                                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                      {users.map((user) => {
                                          const initials =
                                              `${user.name?.[0] ?? ''}${user.surname?.[0] ?? ''}`.trim() || '?';
                                          const isAvailable = user.availability === 'available';
                                          return (
                                              <div
                                                  key={user.id}
                                                  role="button"
                                                  tabIndex={0}
                                                  onClick={() => setSelectedId(user.id)}
                                                  onKeyDown={(event) => {
                                                      if (event.key === 'Enter' || event.key === ' ') {
                                                          event.preventDefault();
                                                          setSelectedId(user.id);
                                                      }
                                                  }}
                                                  className={`flex items-center gap-3 rounded-md border bg-background p-3 shadow-sm transition ${
                                                      selectedId === user.id
                                                          ? 'border-primary ring-2 ring-primary/30'
                                                          : 'border-border/60 hover:border-border'
                                                  }`}
                                              >
                                                  <Avatar className="size-12">
                                                      <AvatarImage src={user.avatar} alt={`${user.name} ${user.surname}`} />
                                                      <AvatarFallback className="text-base font-semibold">
                                                          {initials}
                                                      </AvatarFallback>
                                                  </Avatar>
                                                  <div className="flex flex-col gap-1">
                                                      <p className="text-sm font-semibold text-foreground">
                                                          {user.name} {user.surname}
                                                      </p>
                                                      <span
                                                          className={`inline-flex w-fit items-center gap-2 rounded-full px-2 py-1 text-[11px] font-medium ${
                                                              isAvailable
                                                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200'
                                                                  : 'bg-amber-500/15 text-amber-800 dark:text-amber-100'
                                                          }`}
                                                      >
                                                          <span
                                                              className={`size-2 rounded-full ${
                                                                  isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                                                              }`}
                                                          />
                                                          {isAvailable ? 'Disponibile' : 'Occupato'}
                                                      </span>
                                                  </div>
                                              </div>
                                          );
                                      })}
                                  </div>
                              </div>
                          ))
                        : null}
                    {!loading && !error && !filtered.length ? (
                        <p className="text-sm text-muted-foreground">Nessuno specialista disponibile al momento.</p>
                    ) : null}
                </div>
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                        {selectedId ? `Selezionato: ${specialists.find((user) => user.id === selectedId)?.name} ${
                            specialists.find((user) => user.id === selectedId)?.surname
                        }` : 'Nessuno specialista selezionato'}
                    </p>
                    <div className="flex gap-2">
                        <Button disabled={!selectedId || calling} onClick={() => selectedId && onCall(selectedId)}>
                            {calling ? 'Chiamata...' : 'Chiama'}
                        </Button>
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>
                            Chiudi
                        </Button>
                    </div>
                </div>
                {callError ? <p className="text-xs font-medium text-red-600">{callError}</p> : null}
            </DialogContent>
        </Dialog>
    );
}
