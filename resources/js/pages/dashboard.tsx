import { ActionsCard, type CreatedEmergency } from '@/components/dashboard/actions-card';
import { CapacityCard } from '@/components/dashboard/capacity-card';
import { EmergenciesCard } from '@/components/dashboard/emergencies-card';
import { FlowCard } from '@/components/dashboard/flow-card';
import { SummaryGrid } from '@/components/dashboard/summary-grid';
import { Arrivals118Card, type Arrival118 } from '@/components/dashboard/arrivals-118-card';
import AppLayout from '@/layouts/app-layout';
import { apiRequest } from '@/lib/api';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Activity, AlertTriangle, BellRing, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pannello Operativo',
        href: dashboard().url,
    },
];

type ApiPatient = {
    id: number;
    name: string;
    surname?: string;
};

type ApiEmergency = {
    id: number;
    description?: string | null;
    alert_code?: string | null;
    status?: string | null;
    patient?: ApiPatient | null;
};

type ApiInvestigation = {
    id: number;
    title: string;
    description?: string | null;
};

const arrivals118Initial: Arrival118[] = [
    {
        id: '118-1',
        mezzo: 'Auto medica VR12',
        eta: '8 min',
        codice: 'Rosso',
        destinazione: 'Shock room',
        note: 'Politrauma, intubato',
    },
    {
        id: '118-2',
        mezzo: 'Ambulanza CRI 24',
        eta: '15 min',
        codice: 'Giallo',
        destinazione: 'Osservazione breve',
        note: 'Dolore toracico, monitor',
    },
    {
        id: '118-3',
        mezzo: 'Ambulanza ANPAS 07',
        eta: '22 min',
        codice: 'Verde',
        destinazione: 'Area verde',
        note: 'Trauma minore arto sup.',
    },
];

const operativeActionsInitial: { title: string; accent: 'amber' | 'blue' | 'emerald'; badge: string; badgeTone?: 'solid' | 'muted' }[] =
    [];

export default function Dashboard() {
    const [operativeActions] = useState(operativeActionsInitial);
    const [arrivals118] = useState(arrivals118Initial);
    const [emergenzeApi, setEmergenzeApi] = useState<ApiEmergency[]>([]);
    const [investigations, setInvestigations] = useState<ApiInvestigation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleEmergencyCreated = (emergency: CreatedEmergency) => {
        setEmergenzeApi((prev) => [
            {
                id: emergency.id,
                alert_code: emergency.alert_code,
                description: emergency.description,
                status: emergency.status,
                patient: {
                    id: emergency.patient.id,
                    name: emergency.patient.name,
                    surname: emergency.patient.surname,
                },
            },
            ...prev,
        ]);
    };

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const emergencies = await apiRequest<ApiEmergency[]>('/api/emergencies');
                const investigationsData = await apiRequest<ApiInvestigation[]>('/api/investigations');
                if (active) {
                    setEmergenzeApi(emergencies);
                    setInvestigations(investigationsData);
                }
            } catch (err) {
                if (active) {
                    setError(err instanceof Error ? err.message : 'Errore nel caricamento emergenze');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            active = false;
        };
    }, []);

    const emergenze = useMemo(
        () =>
            emergenzeApi.map((em) => {
                const fullName = `${em.patient?.name ?? ''} ${em.patient?.surname ?? ''}`.trim();
                const alert = (em.alert_code ?? '').toLowerCase();
                const codice =
                    alert === 'rosso'
                        ? 'Rosso'
                        : alert === 'giallo' || alert === 'arancio'
                          ? 'Giallo'
                          : 'Verde';

                return {
                    id: em.id,
                    patientId: em.patient?.id,
                    paziente: fullName || 'Paziente sconosciuto',
                    codice,
                    arrivo: em.description ?? 'Non specificato',
                    attesa: '--:--',
                    destinazione: em.status ?? 'In valutazione',
                    stato: em.status ?? 'In triage',
                };
            }),
        [emergenzeApi],
    );

    const summaryCards = useMemo(() => {
        const rossi = emergenze.filter((e) => e.codice === 'Rosso').length;
        const gialli = emergenze.filter((e) => e.codice === 'Giallo').length;
        const inDimissione = emergenzeApi.filter((e) =>
            (e.status ?? '').toLowerCase().includes('dimission'),
        ).length;
        const postiDisponibili = Math.max(0, 20 - emergenze.length);

        return [
            {
                label: 'Codici rossi',
                value: `${rossi} pazienti`,
                delta: '',
                icon: AlertTriangle,
                accentClassName:
                    'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/40 dark:text-red-200',
                chip: 'Shock room pronta',
            },
            {
                label: 'Codici gialli',
                value: `${gialli} pazienti`,
                delta: '',
                icon: BellRing,
                accentClassName:
                    'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50 dark:text-amber-200',
                chip: 'Monitoraggio attivo',
            },
            {
                label: 'In attesa dimissione',
                value: `${inDimissione} pazienti`,
                delta: '',
                icon: Activity,
                accentClassName:
                    'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/40 dark:text-blue-200',
                chip: 'Dimissioni da completare',
            },
            {
                label: 'Posti disponibili',
                value: `${postiDisponibili} letti`,
                delta: '',
                icon: ShieldCheck,
                accentClassName:
                    'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/40 dark:text-emerald-200',
                chip: 'Capienza calcolata',
            },
        ];
    }, [emergenze]);

    const areaCounts = useMemo(() => {
        const alerts = emergenzeApi.map((e) => (e.alert_code ?? '').toLowerCase());
        const shockRoom = alerts.filter((code) => code === 'rosso').length;
        const osservazione = alerts.filter((code) => code === 'giallo' || code === 'arancio').length;
        const areaVerde = alerts.filter((code) => code === 'verde' || code === 'bianco' || code === '').length;
        return { shockRoom, osservazione, areaVerde };
    }, [emergenzeApi]);

    const statoCorsie = useMemo(
        () => [
            { label: 'Shock room', occupato: areaCounts.shockRoom, totale: 4, accentClassName: 'bg-red-500' },
            { label: 'Osservazione breve', occupato: Math.min(areaCounts.osservazione, 15), totale: 15, accentClassName: 'bg-amber-500' },
            { label: 'Area verde', occupato: Math.min(areaCounts.areaVerde, 18), totale: 18, accentClassName: 'bg-emerald-500' },
        ],
        [areaCounts],
    );

    const flowItems = useMemo(
        () => [
            { label: 'Shock room (rossi)', value: `${areaCounts.shockRoom} arrivi`, accent: 'red' as const },
            { label: 'Osservazione breve (gialli/arancio)', value: `${areaCounts.osservazione} arrivi`, accent: 'amber' as const },
            { label: 'Area verde (verdi/bianchi)', value: `${areaCounts.areaVerde} arrivi`, accent: 'blue' as const },
        ],
        [areaCounts],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pannello Operativo" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {loading ? (
                    <p className="text-sm text-muted-foreground">Caricamento dati emergenze...</p>
                ) : null}
                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
                <SummaryGrid items={summaryCards} />

                <div className="grid gap-4 xl:grid-cols-3">
                    <EmergenciesCard items={emergenze} investigations={investigations} />
                    <ActionsCard
                        primaryCta="Avvia triage ora"
                        actions={operativeActions}
                        onEmergencyCreated={handleEmergencyCreated}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <CapacityCard areas={statoCorsie} />
                    <FlowCard items={flowItems} />
                    <Arrivals118Card items={arrivals118} />
                </div>

            </div>
        </AppLayout>
    );
}
