
import { FlowStepDialog, type FlowStatus } from '@/components/flows/flow-step-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { apiRequest, patchJson, postJson, putJson } from '@/lib/api';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

type StepState = {
    preliminary: FlowStatus;
    specialistRequest: FlowStatus;
    recallVisit: FlowStatus;
    waitingReport: FlowStatus;
    followUp: FlowStatus;
    disposition: FlowStatus;
};

const initialState: StepState = {
    preliminary: 'pending',
    specialistRequest: 'pending',
    recallVisit: 'pending',
    waitingReport: 'pending',
    followUp: 'pending',
    disposition: 'pending',
};

const fieldWrapper = 'space-y-1';
const textAreaStyle =
    'min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

type InvestigationOption = { id: number; title: string; description?: string | null };
type SpecialistInvestigationOption = { id: number; title: string; description?: string | null };
type UserOption = { id: number; name: string; surname?: string };
type DepartmentOption = { id: number; name: string };
type PatientOption = { id: number; name: string; surname?: string };
type EmergencyOption = { id: number; patient?: PatientOption | null };
type SpecialistVisitOption = { id: number; emergency_id?: number | null; patient?: PatientOption | null };
type SpecialistRequestOption = { id: number; emergency_id?: number | null; patient?: PatientOption | null };

type OptionsState = {
    investigations: InvestigationOption[];
    specialistInvestigations: SpecialistInvestigationOption[];
    users: UserOption[];
    departments: DepartmentOption[];
    patients: PatientOption[];
    emergencies: EmergencyOption[];
    visits: SpecialistVisitOption[];
    requests: SpecialistRequestOption[];
};

const emptyOptions: OptionsState = {
    investigations: [],
    specialistInvestigations: [],
    users: [],
    departments: [],
    patients: [],
    emergencies: [],
    visits: [],
    requests: [],
};

type SpecialistCareFlowProps = {
    emergencyId?: number | string;
    patientId?: number | string;
    patientName?: string;
};
export function SpecialistCareFlow({ emergencyId, patientId, patientName }: SpecialistCareFlowProps) {
    const [steps, setSteps] = useState<StepState>(initialState);
    const [options, setOptions] = useState<OptionsState>(emptyOptions);
    const [optionsLoading, setOptionsLoading] = useState(false);
    const [optionsError, setOptionsError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const loadOptions = async () => {
            setOptionsLoading(true);
            try {
                const [
                    investigations,
                    specialistInvestigations,
                    users,
                    departments,
                    patients,
                    emergencies,
                    visits,
                    requests,
                ] = await Promise.all([
                    apiRequest<InvestigationOption[]>('/api/investigations'),
                    apiRequest<SpecialistInvestigationOption[]>('/api/specialist-investigations'),
                    apiRequest<UserOption[]>('/api/users'),
                    apiRequest<DepartmentOption[]>('/api/departments'),
                    apiRequest<PatientOption[]>('/api/patients'),
                    apiRequest<EmergencyOption[]>('/api/emergencies'),
                    apiRequest<SpecialistVisitOption[]>('/api/specialist-visits'),
                    apiRequest<SpecialistRequestOption[]>('/api/specialist-investigation-requests'),
                ]);

                if (active) {
                    setOptions({
                        investigations,
                        specialistInvestigations,
                        users,
                        departments,
                        patients,
                        emergencies,
                        visits,
                        requests,
                    });
                    setOptionsError(null);
                }
            } catch (err) {
                if (active) {
                    setOptionsError(err instanceof Error ? err.message : 'Errore caricamento dati dal server');
                }
            } finally {
                if (active) {
                    setOptionsLoading(false);
                }
            }
        };

        loadOptions();

        return () => {
            active = false;
        };
    }, []);

    const updateStep = (key: keyof StepState, status: FlowStatus) => {
        setSteps((current) => ({ ...current, [key]: status }));
    };

    return (
        <div className="space-y-3">
            {optionsLoading ? (
                <p className="text-xs text-muted-foreground">Caricamento dati dal sistema...</p>
            ) : null}
            {optionsError ? (
                <p className="text-xs font-medium text-red-600">
                    Non riesco a caricare le opzioni: {optionsError}
                </p>
            ) : null}
            {patientName ? (
                <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Paziente:</span>
                    <span>{patientName}</span>
                    {emergencyId ? (
                        <span className="rounded bg-background px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                            ER #{emergencyId}
                        </span>
                    ) : null}
                </div>
            ) : null}
            <div className="grid gap-3 lg:grid-cols-2">
                <PreliminaryInvestigationsStep
                    status={steps.preliminary}
                    onStatusChange={(status) => updateStep('preliminary', status)}
                    options={options}
                    optionsLoading={optionsLoading}
                    emergencyId={emergencyId}
                    patientId={patientId}
                    patientName={patientName}
                />
                <SpecialistInvestigationStep
                    status={steps.specialistRequest}
                    onStatusChange={(status) => updateStep('specialistRequest', status)}
                    options={options}
                    optionsLoading={optionsLoading}
                    emergencyId={emergencyId}
                    patientId={patientId}
                    patientName={patientName}
                />
                <RecallVisitStep
                    status={steps.recallVisit}
                    onStatusChange={(status) => updateStep('recallVisit', status)}
                    options={options}
                    optionsLoading={optionsLoading}
                    emergencyId={emergencyId}
                    patientId={patientId}
                    patientName={patientName}
                />
                <WaitingReportStep
                    status={steps.waitingReport}
                    onStatusChange={(status) => updateStep('waitingReport', status)}
                    options={options}
                    optionsLoading={optionsLoading}
                    emergencyId={emergencyId}
                    patientId={patientId}
                />
                <FollowUpDecisionStep
                    status={steps.followUp}
                    onStatusChange={(status) => updateStep('followUp', status)}
                    options={options}
                    optionsLoading={optionsLoading}
                    emergencyId={emergencyId}
                    patientId={patientId}
                />
                <DispositionStep
                    status={steps.disposition}
                    onStatusChange={(status) => updateStep('disposition', status)}
                    options={options}
                    optionsLoading={optionsLoading}
                    emergencyId={emergencyId}
                    patientId={patientId}
                />
            </div>
        </div>
    );
}

type StepProps = {
    status: FlowStatus;
    onStatusChange: (status: FlowStatus) => void;
    options: OptionsState;
    optionsLoading: boolean;
    emergencyId?: number | string;
    patientId?: number | string;
    patientName?: string;
};
function PreliminaryInvestigationsStep({
    status,
    onStatusChange,
    options,
    emergencyId,
}: StepProps) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        emergencyId: emergencyId ? String(emergencyId) : '',
        investigationId: '',
        performerId: '',
        performedAt: '',
        outcome: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isValid = useMemo(
        () =>
            Boolean(
                form.emergencyId.trim() &&
                    form.investigationId.trim() &&
                    form.performerId.trim(),
            ),
        [form],
    );

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isValid) return;

        setLoading(true);
        setError(null);
        try {
            await postJson('/api/investigations-performed', {
                emergency_id: Number(form.emergencyId),
                investigation_id: Number(form.investigationId),
                performed_by: Number(form.performerId),
                performed_at: form.performedAt || null,
                outcome: form.outcome || null,
                notes: form.notes || null,
            });
            onStatusChange('completed');
            setOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore inatteso');
        } finally {
            setLoading(false);
        }
    };

    return (
        <FlowStepDialog
            stepNumber={1}
            title="Accertamenti preliminari"
            description="ECG, prelievi ed esami rapidi post-triage"
            status={status}
            accent="emerald"
            open={open}
            onOpenChange={setOpen}
            footer={
                <div className="flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        I dati minimi sono emergenza, prestazione e operatore.
                    </p>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Annulla
                        </Button>
                        <Button type="submit" form="preliminary-form" disabled={!isValid || loading}>
                            {loading ? 'Salvataggio...' : 'Conferma'}
                        </Button>
                    </div>
                </div>
            }
        >
            <form id="preliminary-form" onSubmit={handleSubmit} className="space-y-3">
                <div className={fieldWrapper}>
                    <Label htmlFor="emergencyId">Emergenza</Label>
                    {emergencyId ? (
                        <Input id="emergencyId" type="number" value={form.emergencyId} disabled />
                    ) : (
                        <select
                            id="emergencyId"
                            className={textAreaStyle}
                            value={form.emergencyId}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, emergencyId: event.target.value }))
                            }
                            required
                        >
                            <option value="">Seleziona emergenza</option>
                            {options.emergencies.map((er) => (
                                <option key={er.id} value={er.id}>
                                    ER #{er.id} - {er.patient ? `${er.patient.name} ${er.patient.surname ?? ''}` : 'paziente'}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={fieldWrapper}>
                        <Label htmlFor="investigationId">Accertamento preliminare</Label>
                        <select
                            id="investigationId"
                            className={textAreaStyle}
                            value={form.investigationId}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, investigationId: event.target.value }))
                            }
                            required
                        >
                            <option value="">Seleziona</option>
                            {options.investigations.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={fieldWrapper}>
                        <Label htmlFor="performerId">Operatore</Label>
                        <select
                            id="performerId"
                            className={textAreaStyle}
                            value={form.performerId}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, performerId: event.target.value }))
                            }
                            required
                        >
                            <option value="">Seleziona</option>
                            {options.users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} {user.surname ?? ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={fieldWrapper}>
                        <Label htmlFor="performedAt">Eseguito il</Label>
                        <Input
                            id="performedAt"
                            type="datetime-local"
                            value={form.performedAt}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, performedAt: event.target.value }))
                            }
                        />
                    </div>
                    <div className={fieldWrapper}>
                        <Label htmlFor="outcome">Esito sintetico</Label>
                        <Input
                            id="outcome"
                            placeholder="Valori o referto rapido"
                            value={form.outcome}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, outcome: event.target.value }))
                            }
                        />
                    </div>
                </div>
                <div className={fieldWrapper}>
                    <Label htmlFor="notes">Note</Label>
                    <textarea
                        id="notes"
                        className={textAreaStyle}
                        placeholder="Annotazioni operative"
                        value={form.notes}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, notes: event.target.value }))
                        }
                    />
                </div>
                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            </form>
        </FlowStepDialog>
    );
}
function SpecialistInvestigationStep({ status, onStatusChange, options, emergencyId }: StepProps) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        emergencyId: emergencyId ? String(emergencyId) : '',
        specialistInvestigationId: '',
        requestedBy: '',
        scheduledAt: '',
        reportExpectedAt: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isValid = useMemo(
        () =>
            Boolean(
                form.emergencyId.trim() &&
                    form.specialistInvestigationId.trim() &&
                    form.requestedBy.trim(),
            ),
        [form],
    );

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isValid) return;
        setLoading(true);
        setError(null);

        try {
            await postJson('/api/specialist-investigation-requests', {
                emergency_id: Number(form.emergencyId),
                specialist_investigation_id: Number(form.specialistInvestigationId),
                requested_by: Number(form.requestedBy),
                status: 'scheduled',
                scheduled_at: form.scheduledAt || null,
                report_expected_at: form.reportExpectedAt || null,
                notes: form.notes || null,
            });
            onStatusChange('completed');
            setOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore inatteso');
        } finally {
            setLoading(false);
        }
    };

    return (
        <FlowStepDialog
            stepNumber={2}
            title="Accertamenti specialistici"
            description="Richiesta e pianificazione di esami avanzati"
            status={status}
            accent="violet"
            open={open}
            onOpenChange={setOpen}
            footer={
                <div className="flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        La richiesta genera una nuova lavorazione specialistica.
                    </p>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Annulla
                        </Button>
                        <Button type="submit" form="specialist-request-form" disabled={!isValid || loading}>
                            {loading ? 'Invio...' : 'Registra richiesta'}
                        </Button>
                    </div>
                </div>
            }
        >
            <form id="specialist-request-form" onSubmit={handleSubmit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={fieldWrapper}>
                        <Label htmlFor="specialistEmergencyId">Emergenza</Label>
                        {emergencyId ? (
                            <Input id="specialistEmergencyId" type="number" value={form.emergencyId} disabled />
                        ) : (
                            <select
                                id="specialistEmergencyId"
                                className={textAreaStyle}
                                value={form.emergencyId}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, emergencyId: event.target.value }))
                                }
                                required
                            >
                                <option value="">Seleziona emergenza</option>
                                {options.emergencies.map((er) => (
                                    <option key={er.id} value={er.id}>
                                        ER #{er.id} - {er.patient ? `${er.patient.name} ${er.patient.surname ?? ''}` : 'paziente'}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className={fieldWrapper}>
                        <Label htmlFor="specialistInvestigationId">Prestazione specialistica</Label>
                        <select
                            id="specialistInvestigationId"
                            className={textAreaStyle}
                            value={form.specialistInvestigationId}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    specialistInvestigationId: event.target.value,
                                }))
                            }
                            required
                        >
                            <option value="">Seleziona</option>
                            {options.specialistInvestigations.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={fieldWrapper}>
                        <Label htmlFor="requestedBy">Richiedente</Label>
                        <select
                            id="requestedBy"
                            className={textAreaStyle}
                            value={form.requestedBy}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, requestedBy: event.target.value }))
                            }
                            required
                        >
                            <option value="">Seleziona</option>
                            {options.users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} {user.surname ?? ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={fieldWrapper}>
                        <Label htmlFor="scheduledAt">Programmato per</Label>
                        <Input
                            id="scheduledAt"
                            type="datetime-local"
                            value={form.scheduledAt}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))
                            }
                        />
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={fieldWrapper}>
                        <Label htmlFor="reportExpectedAt">Attesa referto</Label>
                        <Input
                            id="reportExpectedAt"
                            type="datetime-local"
                            value={form.reportExpectedAt}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, reportExpectedAt: event.target.value }))
                            }
                        />
                    </div>
                    <div />
                </div>
                <div className={fieldWrapper}>
                    <Label htmlFor="specialistNotes">Note operative</Label>
                    <textarea
                        id="specialistNotes"
                        className={textAreaStyle}
                        placeholder="Indicazioni per il laboratorio/servizio"
                        value={form.notes}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, notes: event.target.value }))
                        }
                    />
                </div>
                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            </form>
        </FlowStepDialog>
    );
}
function RecallVisitStep({ status, onStatusChange, options, emergencyId, patientId }: StepProps) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        patientId: patientId ? String(patientId) : '',
        departmentId: '',
        userId: '',
        emergencyId: emergencyId ? String(emergencyId) : '',
        scheduledAt: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isValid = useMemo(
        () =>
            Boolean(
                form.patientId.trim() &&
                    form.departmentId.trim() &&
                    form.userId.trim() &&
                    form.emergencyId.trim(),
            ),
        [form],
    );

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isValid) return;
        setLoading(true);
        setError(null);

        try {
            await postJson('/api/specialist-visits', {
                patient_id: Number(form.patientId),
                department_id: Number(form.departmentId),
                user_id: Number(form.userId),
                emergency_id: Number(form.emergencyId),
                status: 'scheduled',
                scheduled_at: form.scheduledAt || null,
                notes: form.notes || null,
            });
            onStatusChange('completed');
            setOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore inatteso');
        } finally {
            setLoading(false);
        }
    };

    return (
        <FlowStepDialog
            stepNumber={3}
            title="Richiamo visita specialistica"
            description="Organizza la visita specialistica a valle degli esami"
            status={status}
            accent="amber"
            open={open}
            onOpenChange={setOpen}
            footer={
                <div className="flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">Pianifica lo slot e assegna il medico.</p>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Chiudi
                        </Button>
                        <Button type="submit" form="recall-form" disabled={!isValid || loading}>
                            {loading ? 'Salvataggio...' : 'Crea visita'}
                        </Button>
                    </div>
                </div>
            }
        >
            <form id="recall-form" onSubmit={handleSubmit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={fieldWrapper}>
                        <Label htmlFor="recallPatient">Paziente</Label>
                        <select
                            id="recallPatient"
                            className={textAreaStyle}
                            value={form.patientId}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, patientId: event.target.value }))
                            }
                            required
                        >
                            <option value="">Seleziona</option>
                            {options.patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.name} {patient.surname ?? ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={fieldWrapper}>
                        <Label htmlFor="recallEmergency">Emergenza</Label>
                        {emergencyId ? (
                            <Input id="recallEmergency" type="number" value={form.emergencyId} disabled />
                        ) : (
                            <select
                                id="recallEmergency"
                                className={textAreaStyle}
                                value={form.emergencyId}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, emergencyId: event.target.value }))
                                }
                                required
                            >
                                <option value="">Seleziona emergenza</option>
                                {options.emergencies.map((er) => (
                                    <option key={er.id} value={er.id}>
                                        ER #{er.id} - {er.patient ? `${er.patient.name} ${er.patient.surname ?? ''}` : 'paziente'}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={fieldWrapper}>
                        <Label htmlFor="recallDepartment">Reparto</Label>
                        <select
                            id="recallDepartment"
                            className={textAreaStyle}
                            value={form.departmentId}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, departmentId: event.target.value }))
                            }
                            required
                        >
                            <option value="">Seleziona</option>
                            {options.departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={fieldWrapper}>
                        <Label htmlFor="recallUser">Medico</Label>
                        <select
                            id="recallUser"
                            className={textAreaStyle}
                            value={form.userId}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, userId: event.target.value }))
                            }
                            required
                        >
                            <option value="">Seleziona</option>
                            {options.users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} {user.surname ?? ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={fieldWrapper}>
                        <Label htmlFor="recallScheduledAt">Data/ora visita</Label>
                        <Input
                            id="recallScheduledAt"
                            type="datetime-local"
                            value={form.scheduledAt}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))
                            }
                        />
                    </div>
                    <div />
                </div>
                <div className={fieldWrapper}>
                    <Label htmlFor="recallNotes">Indicazioni per la visita</Label>
                    <textarea
                        id="recallNotes"
                        className={textAreaStyle}
                        placeholder="Sintesi quadro clinico, priorità, isolamento..."
                        value={form.notes}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, notes: event.target.value }))
                        }
                    />
                </div>
                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            </form>
        </FlowStepDialog>
    );
}
function WaitingReportStep({ status, onStatusChange, options, emergencyId, patientId }: StepProps) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        visitId: '',
        patientId: patientId ? String(patientId) : '',
        departmentId: '',
        userId: '',
        emergencyId: emergencyId ? String(emergencyId) : '',
        reportExpectedAt: '',
        reportReceivedAt: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isValid = useMemo(
        () =>
            Boolean(
                form.visitId.trim() &&
                    form.patientId.trim() &&
                    form.departmentId.trim() &&
                    form.userId.trim() &&
                    form.emergencyId.trim(),
            ),
        [form],
    );

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isValid) return;
        setLoading(true);
        setError(null);

        try {
            await putJson(`/api/specialist-visits/${form.visitId}`, {
                patient_id: Number(form.patientId),
                department_id: Number(form.departmentId),
                user_id: Number(form.userId),
                emergency_id: Number(form.emergencyId),
                status: 'waiting_report',
                report_expected_at: form.reportExpectedAt || null,
                report_received_at: form.reportReceivedAt || null,
            });
            onStatusChange('in-progress');
            setOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore inatteso');
        } finally {
            setLoading(false);
        }
    };

    return (
        <FlowStepDialog
            stepNumber={4}
            title="Attesa referto specialistico"
            description="Gestione SLA referto e stato della visita"
            status={status}
            accent="blue"
            open={open}
            onOpenChange={setOpen}
            footer={
                <div className="flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        Imposta le date per monitorare la consegna del referto.
                    </p>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Annulla
                        </Button>
                        <Button type="submit" form="report-wait-form" disabled={!isValid || loading}>
                            {loading ? 'Aggiornamento...' : 'Aggiorna stato'}
                        </Button>
                    </div>
                </div>
            }
        >
            <form id="report-wait-form" onSubmit={handleSubmit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={fieldWrapper}>
                        <Label htmlFor="visitId">Visita specialistica</Label>
                        <select
                            id="visitId"
                            className={textAreaStyle}
                            value={form.visitId}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, visitId: event.target.value }))
                            }
                            required
                        >
                            <option value="">Seleziona</option>
                            {options.visits.map((visit) => (
                                <option key={visit.id} value={visit.id}>
                                    Visita #{visit.id} (ER #{visit.emergency_id ?? 'n/d'})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={fieldWrapper}>
                        <Label htmlFor="reportEmergencyId">Emergenza</Label>
                        {emergencyId ? (
                            <Input id="reportEmergencyId" type="number" value={form.emergencyId} disabled />
                        ) : (
                            <select
                                id="reportEmergencyId"
                                className={textAreaStyle}
                                value={form.emergencyId}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, emergencyId: event.target.value }))
                                }
                                required
                            >
                                <option value="">Seleziona emergenza</option>
                                {options.emergencies.map((er) => (
                                    <option key={er.id} value={er.id}>
                                        ER #{er.id} - {er.patient ? `${er.patient.name} ${er.patient.surname ?? ''}` : 'paziente'}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={fieldWrapper}>
                        <Label htmlFor="reportPatientId">Paziente</Label>
                        <select
                            id="reportPatientId"
                            className={textAreaStyle}
                            value={form.patientId}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, patientId: event.target.value }))
                            }
                            required
                        >
                            <option value="">Seleziona</option>
                            {options.patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.name} {patient.surname ?? ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={fieldWrapper}>
                        <Label htmlFor="reportDepartmentId">Reparto</Label>
                        <Input
                            id="reportDepartmentId"
                            placeholder="ID reparto"
                            value={form.departmentId}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, departmentId: event.target.value }))
                            }
                            required
                        />
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={fieldWrapper}>
                        <Label htmlFor="reportUserId">Medico</Label>
                        <select
                            id="reportUserId"
                            className={textAreaStyle}
                            value={form.userId}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, userId: event.target.value }))
                            }
                            required
                        >
                            <option value="">Seleziona</option>
                            {options.users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} {user.surname ?? ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div />
                </div>
                <Separator />
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={fieldWrapper}>
                        <Label htmlFor="reportExpectedAt">Referto atteso per</Label>
                        <Input
                            id="reportExpectedAt"
                            type="datetime-local"
                            value={form.reportExpectedAt}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, reportExpectedAt: event.target.value }))
                            }
                        />
                    </div>
                    <div className={fieldWrapper}>
                        <Label htmlFor="reportReceivedAt">Referto ricevuto il</Label>
                        <Input
                            id="reportReceivedAt"
                            type="datetime-local"
                            value={form.reportReceivedAt}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, reportReceivedAt: event.target.value }))
                            }
                        />
                    </div>
                </div>
                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            </form>
        </FlowStepDialog>
    );
}
function FollowUpDecisionStep({ status, onStatusChange, options }: StepProps) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        requestId: '',
        followUpAction: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isValid = useMemo(() => Boolean(form.requestId.trim() && form.followUpAction.trim()), [form]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isValid) return;
        setLoading(true);
        setError(null);

        try {
            await patchJson(`/api/specialist-investigation-requests/${form.requestId}`, {
                follow_up_action: form.followUpAction,
                notes: form.notes || null,
                status: 'completed',
            });
            onStatusChange('completed');
            setOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore inatteso');
        } finally {
            setLoading(false);
        }
    };

    return (
        <FlowStepDialog
            stepNumber={5}
            title="Valutazione follow-up"
            description="Decidi se servono ulteriori visite o controlli"
            status={status}
            accent="emerald"
            open={open}
            onOpenChange={setOpen}
            footer={
                <div className="flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">Traccia la decisione clinica post-referto.</p>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Annulla
                        </Button>
                        <Button type="submit" form="followup-form" disabled={!isValid || loading}>
                            {loading ? 'Aggiornamento...' : 'Salva decisione'}
                        </Button>
                    </div>
                </div>
            }
        >
            <form id="followup-form" onSubmit={handleSubmit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={fieldWrapper}>
                        <Label htmlFor="followupRequestId">Richiesta specialistica</Label>
                        <select
                            id="followupRequestId"
                            className={textAreaStyle}
                            value={form.requestId}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, requestId: event.target.value }))
                            }
                            required
                        >
                            <option value="">Seleziona</option>
                            {options.requests.map((req) => (
                                <option key={req.id} value={req.id}>
                                    Richiesta #{req.id} (ER #{req.emergency_id ?? 'n/d'})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={fieldWrapper}>
                        <Label htmlFor="followupAction">Piano</Label>
                        <Input
                            id="followupAction"
                            placeholder="Esempio: eco controllo tra 24h"
                            value={form.followUpAction}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, followUpAction: event.target.value }))
                            }
                            required
                        />
                    </div>
                </div>
                <div className={fieldWrapper}>
                    <Label htmlFor="followupNotes">Note</Label>
                    <textarea
                        id="followupNotes"
                        className={textAreaStyle}
                        placeholder="Condizioni per eventuale rivalutazione"
                        value={form.notes}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, notes: event.target.value }))
                        }
                    />
                </div>
                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            </form>
        </FlowStepDialog>
    );
}
function DispositionStep({ status, onStatusChange, options }: StepProps) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        requestId: '',
        disposition: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isValid = useMemo(() => Boolean(form.requestId.trim() && form.disposition.trim()), [form]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isValid) return;
        setLoading(true);
        setError(null);

        try {
            await patchJson(`/api/specialist-investigation-requests/${form.requestId}`, {
                disposition: form.disposition,
                notes: form.notes || null,
            });
            onStatusChange('completed');
            setOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore inatteso');
        } finally {
            setLoading(false);
        }
    };

    return (
        <FlowStepDialog
            stepNumber={6}
            title="Dimissione o ricovero"
            description="Formalizza la destinazione del paziente"
            status={status}
            accent="rose"
            open={open}
            onOpenChange={setOpen}
            footer={
                <div className="flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        Seleziona la destinazione finale per chiudere il percorso.
                    </p>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Annulla
                        </Button>
                        <Button type="submit" form="disposition-form" disabled={!isValid || loading}>
                            {loading ? 'Aggiornamento...' : 'Registra esito'}
                        </Button>
                    </div>
                </div>
            }
        >
            <form id="disposition-form" onSubmit={handleSubmit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className={fieldWrapper}>
                        <Label htmlFor="dispositionRequestId">Richiesta specialistica</Label>
                        <select
                            id="dispositionRequestId"
                            className={textAreaStyle}
                            value={form.requestId}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, requestId: event.target.value }))
                            }
                            required
                        >
                            <option value="">Seleziona</option>
                            {options.requests.map((req) => (
                                <option key={req.id} value={req.id}>
                                    Richiesta #{req.id} (ER #{req.emergency_id ?? 'n/d'})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={fieldWrapper}>
                        <Label htmlFor="disposition">Esito</Label>
                        <select
                            id="disposition"
                            className={textAreaStyle}
                            value={form.disposition}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, disposition: event.target.value }))
                            }
                        >
                            <option value="">Seleziona</option>
                            <option value="discharge">Dimissione</option>
                            <option value="admission">Ricovero</option>
                            <option value="observation">Osservazione breve</option>
                        </select>
                    </div>
                </div>
                <div className={fieldWrapper}>
                    <Label htmlFor="dispositionNotes">Note di consegna</Label>
                    <textarea
                        id="dispositionNotes"
                        className={textAreaStyle}
                        placeholder="Istruzioni per reparto o follow-up"
                        value={form.notes}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, notes: event.target.value }))
                        }
                    />
                </div>
                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            </form>
        </FlowStepDialog>
    );
}
