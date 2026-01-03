import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type TeamItem = {
    nome: string;
    stato: string;
    dettagli: string;
    accentClassName: string;
};

type TeamTriageCardProps = {
    teams: TeamItem[];
};

export function TeamTriageCard({ teams }: TeamTriageCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Team triage</CardTitle>
                <CardDescription>Copertura e turni rapidi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {teams.map((team) => (
                    <div
                        key={team.nome}
                        className="flex items-start justify-between rounded-lg border border-border/70 bg-background/70 px-3 py-2"
                    >
                        <div>
                            <p className="text-sm font-semibold">{team.nome}</p>
                            <p className="text-xs text-muted-foreground">{team.dettagli}</p>
                        </div>
                        <span className={`text-xs font-semibold ${team.accentClassName}`}>
                            {team.stato}
                        </span>
                    </div>
                ))}
                <div className="rounded-lg border border-dashed border-border/70 bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
                    Pianifica rinforzo per turno serale o avvia reperibilità.
                </div>
            </CardContent>
        </Card>
    );
}

export type { TeamItem };
