import { ActionsCard, type CreatedEmergency } from '@/components/dashboard/actions-card';
import { EmergenciesCard } from '@/components/dashboard/emergencies-card';
import { InvestigationProgressCard } from '@/components/dashboard/investigation-progress-card';
import { FlowCard } from '@/components/dashboard/flow-card';
import {
    SpecialistInvestigationStatusCard,
    type SpecialistInvestigationRequestRecord,
} from '@/components/dashboard/specialist-investigation-progress-card';
import { SummaryGrid } from '@/components/dashboard/summary-grid';
import { type Arrival118 } from '@/components/dashboard/arrivals-118-card';
import type { SpecialistCallResult } from '@/components/dashboard/investigation-cards/types';
import AppLayout from '@/layouts/app-layout';
import { apiRequest, patchJson } from '@/lib/api';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Activity, AlertTriangle, Ambulance, BellRing, ShieldCheck } from 'lucide-react';
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

type ApiSpecialist = {
    id: number;
    name: string;
    surname?: string;
    department?: {
        id: number;
        name?: string | null;
    } | null;
    avatar?: string | null;
    is_available?: boolean | null;
};

type ApiEmergency = {
    id: number;
    description?: string | null;
    alert_code?: string | null;
    status?: string | null;
    notify_ps?: boolean | null;
    arrived_ps?: boolean | null;
    arrived_ps_at?: string | null;
    created_at?: string | null;
    patient?: ApiPatient | null;
    user?: {
        id: number;
        permission?: {
            name?: string | null;
        } | null;
    } | null;
    specialist_id?: number | null;
    specialist_called_at?: string | null;
    specialist?: ApiSpecialist | null;
    user_id?: number | null;
};

type ApiInvestigation = {
    id: number;
    title: string;
    description?: string | null;
};

type ApiInvestigationPerformed = {
    id: number;
    emergency_id: number;
    investigation_id: number;
    performed_by: number;
    performed_at?: string | null;
    outcome?: string | null;
    notes?: string | null;
};

const operativeActionsInitial: { title: string; accent: 'amber' | 'blue' | 'emerald'; badge: string; badgeTone?: 'solid' | 'muted' }[] =
    [];

export default function Dashboard() {
    const page = usePage<{ props: SharedData }>();
    const currentUser = page?.props?.auth?.user;
    const is118 = currentUser?.permission?.name === 'Operatore 118';
    const isPs = currentUser?.permission?.name === 'Operatore PS';
    const [operativeActions] = useState(operativeActionsInitial);
    const [emergenzeApi, setEmergenzeApi] = useState<ApiEmergency[]>([]);
    const [investigations, setInvestigations] = useState<ApiInvestigation[]>([]);
    const [investigationsPerformed, setInvestigationsPerformed] = useState<
        Record<number, ApiInvestigationPerformed[]>
    >({});
    const [specialistRequests, setSpecialistRequests] = useState<SpecialistInvestigationRequestRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleEmergencyCreated = (emergency: CreatedEmergency) => {
        setEmergenzeApi((prev) => [
            {
                id: emergency.id,
                alert_code: emergency.alert_code,
                description: emergency.description,
                status: emergency.status,
                notify_ps: emergency.notify_ps ?? null,
                arrived_ps: emergency.arrived_ps ?? null,
                arrived_ps_at: null,
                user_id: currentUser?.id ?? null,
                user: currentUser?.id
                    ? {
                          id: currentUser.id,
                          permission: currentUser.permission
                              ? { name: currentUser.permission.name }
                              : null,
                      }
                    : null,
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
                if (is118) {
                    const emergencies = await apiRequest<ApiEmergency[]>('/api/emergencies?limit=50');
                    if (active) {
                        setEmergenzeApi(emergencies);
                        setInvestigations([]);
                        setInvestigationsPerformed({});
                        setSpecialistRequests([]);
                    }
                } else {
                    const [emergencies, investigationsData, investigationsPerformedData, specialistRequestsData] =
                        await Promise.all([
                            apiRequest<ApiEmergency[]>('/api/emergencies?limit=50'),
                            apiRequest<ApiInvestigation[]>('/api/investigations'),
                            apiRequest<ApiInvestigationPerformed[]>('/api/investigations-performed'),
                            apiRequest<SpecialistInvestigationRequestRecord[]>('/api/specialist-investigation-requests'),
                        ]);
                    if (active) {
                        setEmergenzeApi(emergencies);
                        setInvestigations(investigationsData);
                        const map = investigationsPerformedData.reduce<Record<number, ApiInvestigationPerformed[]>>(
                            (acc, item) => {
                                acc[item.emergency_id] = acc[item.emergency_id] || [];
                                acc[item.emergency_id].push(item);
                                return acc;
                            },
                            {},
                        );
                        setInvestigationsPerformed(map);
                        setSpecialistRequests(specialistRequestsData);
                    }
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
    }, [is118]);

    const emergenze = useMemo(() => {
        const visibleEmergencies = is118
            ? emergenzeApi.filter((em) => Number(em.user_id) === Number(currentUser?.id))
            : emergenzeApi.filter((em) => Boolean(em.arrived_ps));

        return visibleEmergencies.map((em) => {
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
                isFrom118: (em.user?.permission?.name ?? '') === 'Operatore 118',
                specialist: em.specialist
                    ? {
                          id: em.specialist.id,
                          name: em.specialist.name,
                          surname: em.specialist.surname ?? '',
                          department: em.specialist.department?.name ?? null,
                          avatar: em.specialist.avatar ?? null,
                          isAvailable: em.specialist.is_available ?? true,
                          calledAt: em.specialist_called_at ?? undefined,
                      }
                    : null,
                createdAt:
                    em.arrived_ps && em.arrived_ps_at
                        ? em.arrived_ps_at
                        : em.created_at ?? undefined,
                performedInvestigationIds: (investigationsPerformed[em.id] ?? []).map(
                    (p) => p.investigation_id,
                ),
                performedInvestigations: investigationsPerformed[em.id] ?? [],
            };
        });
    }, [currentUser?.id, emergenzeApi, investigationsPerformed, is118]);

    const arrivals118 = useMemo<Arrival118[]>(() => {
        return emergenzeApi
            .filter((em) => em.notify_ps && !em.arrived_ps)
            .map((em) => {
                const fullName = `${em.patient?.name ?? ''} ${em.patient?.surname ?? ''}`.trim();
                const alert = (em.alert_code ?? '').toLowerCase();
                const codice =
                    alert === 'rosso'
                        ? 'Rosso'
                        : alert === 'giallo' || alert === 'arancio'
                          ? 'Giallo'
                          : 'Verde';

                return {
                    id: `${em.id}`,
                    mezzo: fullName ? `Ambulanza 118 · ${fullName}` : 'Ambulanza 118',
                    eta: 'da definire',
                    codice,
                    destinazione: 'Pronto soccorso',
                    note: em.description ?? 'In valutazione',
                };
            });
    }, [emergenzeApi]);

    const handleArrivalHandled = async (arrivalId: Arrival118['id']) => {
        const emergencyId = Number(arrivalId);
        if (Number.isNaN(emergencyId)) return;

        const target = emergenzeApi.find((item) => Number(item.id) === emergencyId);
        if (!target?.user_id || !target?.patient?.id) {
            setError('Dati emergenza incompleti: user o paziente mancante.');
            return;
        }

        try {
            const updated = await patchJson<ApiEmergency>(`/api/emergencies/${emergencyId}`, {
                user_id: target.user_id,
                patient_id: target.patient.id,
                arrived_ps: true,
            });
            setEmergenzeApi((prev) =>
                prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore aggiornamento arrivo');
        }
    };

    const handleInvestigationsRecorded = (
        emergencyId: number,
        records: ApiInvestigationPerformed[],
    ) => {
        setInvestigationsPerformed((prev) => {
            const existing = prev[emergencyId] ?? [];
            const merged = new Map<number, ApiInvestigationPerformed>();
            [...existing, ...records].forEach((item) => merged.set(item.id, item));
            return { ...prev, [emergencyId]: Array.from(merged.values()) };
        });
    };

    const summaryCards = useMemo(() => {
        const rossi = emergenze.filter((e) => e.codice === 'Rosso').length;
        const gialli = emergenze.filter((e) => e.codice === 'Giallo').length;
        const inDimissione = emergenzeApi.filter((e) =>
            (e.status ?? '').toLowerCase().includes('dimission'),
        ).length;
        const postiDisponibili = Math.max(0, 10 - emergenze.length);

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
                label: 'Posti disponibili (sala O.B.I.)',
                value: `${postiDisponibili} letti`,
                delta: '',
                icon: ShieldCheck,
                accentClassName:
                    'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/40 dark:text-emerald-200',
                chip: 'Capienza calcolata',
            },
        ];
    }, [emergenze]);

    const summary118Cards = useMemo(() => {
        const visibleEmergencies = emergenzeApi.filter(
            (em) => Number(em.user_id) === Number(currentUser?.id),
        );
        const inviatiInPs = visibleEmergencies.filter((e) => e.notify_ps).length;
        const risoltiInAmbulanza = visibleEmergencies.filter((e) => e.notify_ps === false).length;

        return [
            {
                label: 'Inviati in PS',
                value: `${inviatiInPs} pazienti`,
                delta: '',
                icon: ShieldCheck,
                accentClassName:
                    'bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-900/40 dark:text-blue-200',
                chip: 'Pronto soccorso avvisato',
            },
            {
                label: 'Risolti in ambulanza',
                value: `${risoltiInAmbulanza} pazienti`,
                delta: '',
                icon: Ambulance,
                accentClassName:
                    'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:border-emerald-900/40 dark:text-emerald-200',
                chip: 'Gestione sul posto',
            },
        ];
    }, [currentUser?.id, emergenzeApi]);

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

    const handleSpecialistCalled = (payload: SpecialistCallResult) => {
        const emergencyId = Number(payload.emergencyId);
        setEmergenzeApi((prev) =>
            prev.map((item) => {
                if (Number(item.id) !== emergencyId) return item;
                return {
                    ...item,
                    status: payload.status ?? item.status ?? 'specialist_called',
                    specialist_called_at: payload.specialist?.calledAt ?? item.specialist_called_at ?? null,
                    specialist_id: payload.specialist?.id ?? null,
                    specialist: payload.specialist
                        ? {
                              id: payload.specialist.id,
                              name: payload.specialist.name,
                              surname: payload.specialist.surname ?? '',
                              department: payload.specialist.department
                                  ? { id: item.specialist?.department?.id ?? 0, name: payload.specialist.department }
                                  : null,
                              avatar: payload.specialist.avatar ?? null,
                              is_available: payload.specialist.isAvailable ?? null,
                          }
                        : null,
                };
            }),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pannello Operativo" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {loading ? (
                    <p className="text-sm text-muted-foreground">Caricamento dati emergenze...</p>
                ) : null}
                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
                {is118 ? (
                    <>
                        <SummaryGrid items={summary118Cards} />
                        <div className="grid gap-4 xl:grid-cols-3">
                            <EmergenciesCard
                                items={emergenze}
                                investigations={[]}
                                title="Emergenze registrate"
                                description="Solo le emergenze inserite dall'operatore 118"
                                showInvestigationActions={false}
                                showSpecialistActions={false}
                            />
                            <ActionsCard
                                primaryCta="Avvia triage ora"
                                actions={operativeActions}
                                onEmergencyCreated={handleEmergencyCreated}
                                showArrivals={false}
                                enableDisposition
                                defaultNotifyPs={false}
                                defaultArrivedPs={false}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <SummaryGrid items={summaryCards} />

                        <div className="grid gap-4 xl:grid-cols-3">
                            <EmergenciesCard
                                items={emergenze}
                                investigations={investigations}
                                onInvestigationsRecorded={handleInvestigationsRecorded}
                                onSpecialistCalled={handleSpecialistCalled}
                            />
                            <ActionsCard
                                primaryCta="Avvia triage ora"
                                actions={operativeActions}
                                arrivals118={arrivals118}
                                onEmergencyCreated={handleEmergencyCreated}
                                onArrivalHandled={handleArrivalHandled}
                                defaultNotifyPs={false}
                                defaultArrivedPs={isPs}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <InvestigationProgressCard
                                investigations={investigations}
                                performedMap={investigationsPerformed}
                                emergencies={emergenzeApi}
                            />
                            <SpecialistInvestigationStatusCard requests={specialistRequests} />
                            <FlowCard items={flowItems} />
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
