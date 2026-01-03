import { ActionsCard } from '@/components/dashboard/actions-card';
import { CapacityCard } from '@/components/dashboard/capacity-card';
import { EmergenciesCard } from '@/components/dashboard/emergencies-card';
import { FlowCard } from '@/components/dashboard/flow-card';
import { SummaryGrid } from '@/components/dashboard/summary-grid';
import { TeamTriageCard } from '@/components/dashboard/team-triage-card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Activity, AlertTriangle, BellRing, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pannello Operativo',
        href: dashboard().url,
    },
];

const summaryInitial = [
    {
        label: 'Codici rossi',
        value: '4 pazienti',
        delta: '+1 negli ultimi 15 min',
        icon: AlertTriangle,
        accentClassName:
            'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/40 dark:text-red-200',
        chip: 'Shock room pronta',
    },
    {
        label: 'Codici gialli',
        value: '9 pazienti',
        delta: 'Tempo medio triage 7 min',
        icon: BellRing,
        accentClassName:
            'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50 dark:text-amber-200',
        chip: '2 sale visita libere',
    },
    {
        label: 'In attesa triage',
        value: '6 arrivi',
        delta: 'Attesa attuale 04:20',
        icon: Activity,
        accentClassName:
            'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/40 dark:text-blue-200',
        chip: 'Team triage A',
    },
    {
        label: 'Posti disponibili',
        value: '12 letti',
        delta: 'Area osservazione 6',
        icon: ShieldCheck,
        accentClassName:
            'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/40 dark:text-emerald-200',
        chip: 'Capienza regolare',
    },
];

const emergenzeInitial = [
    {
        paziente: 'Giulia B.',
        codice: 'Rosso',
        arrivo: '118 - Ambulanza',
        attesa: '02:10',
        destinazione: 'Shock Room 1',
        stato: 'In triage',
    },
    {
        paziente: 'Lorenzo P.',
        codice: 'Giallo',
        arrivo: 'Accesso diretto',
        attesa: '06:45',
        destinazione: 'Visita 3',
        stato: 'Preparazione esami',
    },
    {
        paziente: 'Sara M.',
        codice: 'Verde',
        arrivo: 'Guardia Medica',
        attesa: '12:30',
        destinazione: 'Attesa consulto',
        stato: 'Stabile',
    },
    {
        paziente: 'Antonio R.',
        codice: 'Rosso',
        arrivo: '118 - Helicopter',
        attesa: '00:45',
        destinazione: 'Sala operatoria',
        stato: 'Trasferimento',
    },
];

const statoCorsieInitial = [
    { label: 'Shock room', occupato: 3, totale: 4, accentClassName: 'bg-red-500' },
    { label: 'Osservazione breve', occupato: 9, totale: 15, accentClassName: 'bg-amber-500' },
    { label: 'Area verde', occupato: 7, totale: 18, accentClassName: 'bg-emerald-500' },
];

const teamTriageInitial = [
    {
        nome: 'Team A',
        stato: 'Operativo',
        dettagli: '2 infermieri, 1 medico',
        accentClassName: 'text-emerald-600 dark:text-emerald-200',
    },
    {
        nome: 'Team B',
        stato: 'In supporto',
        dettagli: 'attivato su chiamata',
        accentClassName: 'text-amber-600 dark:text-amber-200',
    },
    {
        nome: 'Team C',
        stato: 'Stand-by',
        dettagli: 'turno dalle 18:00',
        accentClassName: 'text-blue-600 dark:text-blue-200',
    },
];

const operativeActionsInitial = [
    { title: 'Preallerta radiologia', accent: 'amber', badge: 'Prioritario' as const },
    { title: 'Attiva percorso STEMI', accent: 'blue', badge: 'Cardio in arrivo', badgeTone: 'muted' as const },
    { title: 'Blocca accessi non urgenti', accent: 'emerald', badge: '20 min' },
];

const flowItemsInitial = [
    { label: 'Emergenze su ruote', value: '7 arrivi', accent: 'blue' as const },
    { label: 'Accessi walk-in', value: '12 pazienti', accent: 'amber' as const },
    { label: 'Attivazioni critiche', value: '3 eventi', accent: 'red' as const },
];

const incrementTime = (time: string, incrementSeconds: number) => {
    const [minutes, seconds] = time.split(':').map((part) => parseInt(part, 10));
    const totalSeconds = Math.max(0, minutes * 60 + seconds + incrementSeconds);
    const nextMinutes = Math.floor(totalSeconds / 60);
    const nextSeconds = totalSeconds % 60;
    return `${String(nextMinutes).padStart(2, '0')}:${String(nextSeconds).padStart(2, '0')}`;
};

export default function Dashboard() {
    const [summaryCards, setSummaryCards] = useState(summaryInitial);
    const [emergenze, setEmergenze] = useState(emergenzeInitial);
    const [statoCorsie, setStatoCorsie] = useState(statoCorsieInitial);
    const [flowItems, setFlowItems] = useState(flowItemsInitial);
    const [operativeActions] = useState(operativeActionsInitial);
    const [teamTriage] = useState(teamTriageInitial);

    useEffect(() => {
        const interval = setInterval(() => {
            setSummaryCards((prev) =>
                prev.map((item) => {
                    if (item.label === 'Codici rossi') {
                        const nextValue =
                            Math.max(0, parseInt(item.value, 10) + (Math.random() > 0.7 ? 1 : 0));
                        return { ...item, value: `${nextValue} pazienti` };
                    }
                    if (item.label === 'Posti disponibili') {
                        const current = parseInt(item.value, 10);
                        const delta = Math.random() > 0.5 ? 1 : -1;
                        const nextValue = Math.min(20, Math.max(0, current + delta));
                        return { ...item, value: `${nextValue} letti` };
                    }
                    if (item.label === 'In attesa triage') {
                        const current = parseInt(item.value, 10);
                        const nextValue = Math.max(0, current + (Math.random() > 0.6 ? 1 : 0));
                        return { ...item, value: `${nextValue} arrivi` };
                    }
                    return item;
                }),
            );

            setEmergenze((prev) =>
                prev.map((item) => ({
                    ...item,
                    attesa: incrementTime(item.attesa, 10),
                })),
            );

            setStatoCorsie((prev) =>
                prev.map((area) => {
                    const oscillation = Math.random() > 0.6 ? 1 : 0;
                    const delta = Math.random() > 0.5 ? oscillation : -oscillation;
                    const next = Math.min(area.totale, Math.max(0, area.occupato + delta));
                    return { ...area, occupato: next };
                }),
            );

            setFlowItems((prev) =>
                prev.map((item) => {
                    const base = parseInt(item.value, 10);
                    const variation = Math.random() > 0.5 ? 1 : 0;
                    const next = Math.max(0, base + variation);
                    const suffix =
                        item.label === 'Attivazioni critiche'
                            ? 'eventi'
                            : item.label === 'Accessi walk-in'
                            ? 'pazienti'
                            : 'arrivi';
                    return { ...item, value: `${next} ${suffix}` };
                }),
            );
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pannello Operativo" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <SummaryGrid items={summaryCards} />

                <div className="grid gap-4 xl:grid-cols-3">
                    <EmergenciesCard items={emergenze} />
                    <ActionsCard primaryCta="Avvia triage ora" actions={operativeActions} />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <CapacityCard areas={statoCorsie} />
                    <FlowCard items={flowItems} />
                    <TeamTriageCard teams={teamTriage} />
                </div>
            </div>
        </AppLayout>
    );
}
