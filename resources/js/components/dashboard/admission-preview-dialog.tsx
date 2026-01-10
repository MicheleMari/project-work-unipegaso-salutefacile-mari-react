import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { apiRequest, patchJson } from '@/lib/api';
import type { DepartmentOption, InvestigationPerformed } from '@/components/dashboard/investigation-cards/types';
import { useEffect, useState } from 'react';

type AdmissionEmergency = {
    id: number | string;
    paziente: string;
    codice: 'Bianco' | 'Verde' | 'Giallo' | 'Arancio' | 'Rosso';
    arrivo: string;
    createdAt?: string;
    performedInvestigations: InvestigationPerformed[];
    specialist?: {
        id: number;
        name: string;
        surname?: string;
        department?: string | null;
    } | null;
    result?: {
        notes?: string | null;
        disposition?: string | null;
        needs_follow_up?: boolean | null;
        reported_at?: string | null;
    } | null;
};

type AdmissionPreviewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    emergency: AdmissionEmergency | null;
    admissionAt: string;
    admissionDepartment?: string | null;
    readOnly?: boolean;
    investigationsById: Map<number, string>;
    operatorName: string;
    operatorEmail: string;
    emailValue: string;
    emailError: string | null;
    onEmailChange: (value: string) => void;
    onEmailError: (value: string | null) => void;
    onEmergencyUpdated?: (payload: {
        id: number | string;
        status?: string | null;
        admissionDepartment?: string | null;
    }) => void;
};

export function AdmissionPreviewDialog({
    open,
    onOpenChange,
    emergency,
    admissionAt,
    admissionDepartment,
    readOnly = false,
    investigationsById,
    operatorName,
    operatorEmail,
    emailValue,
    emailError,
    onEmailChange,
    onEmailError,
    onEmergencyUpdated,
}: AdmissionPreviewDialogProps) {
    const [departments, setDepartments] = useState<DepartmentOption[]>([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(false);
    const [departmentsError, setDepartmentsError] = useState<string | null>(null);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
    const [departmentError, setDepartmentError] = useState<string | null>(null);
    const [departmentSearch, setDepartmentSearch] = useState('');
    const [confirmingAdmission, setConfirmingAdmission] = useState(false);
    const [confirmAdmissionError, setConfirmAdmissionError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        setSelectedDepartmentId('');
        setDepartmentError(null);
        setDepartmentSearch('');
        setConfirmAdmissionError(null);

        if (departments.length) return;
        let active = true;
        const load = async () => {
            setDepartmentsLoading(true);
            setDepartmentsError(null);
            try {
                const data = await apiRequest<DepartmentOption[]>('/api/departments');
                if (!active) return;
                setDepartments(data);
            } catch (err) {
                if (!active) return;
                setDepartmentsError(err instanceof Error ? err.message : 'Errore caricamento reparti');
            } finally {
                if (active) setDepartmentsLoading(false);
            }
        };

        load();

        return () => {
            active = false;
        };
    }, [open, departments.length]);

    if (!emergency) return null;

    const patientLabel = emergency.paziente || 'Paziente sconosciuto';
    const accessReason = emergency.arrivo || 'Motivo accesso non indicato';
    const arrivalAt = formatDateTime(emergency.createdAt) || 'Non disponibile';
    const admissionAtLabel = formatDateTime(admissionAt) || formatDateTime(new Date().toISOString());
    const specialistName = emergency.specialist
        ? `${emergency.specialist.name ?? ''} ${emergency.specialist.surname ?? ''}`.trim()
        : 'Non assegnato';
    const specialistDepartment = emergency.specialist?.department ?? 'Reparto non indicato';
    const specialistReport = emergency.result;
    const investigations = emergency.performedInvestigations ?? [];

    const selectedDepartmentName =
        departments.find((dept) => String(dept.id) === selectedDepartmentId)?.name ??
        (selectedDepartmentId ? `Reparto #${selectedDepartmentId}` : '');
    const admissionDepartmentName = admissionDepartment?.trim() ?? '';
    const resolvedDepartmentName = selectedDepartmentName || admissionDepartmentName;
    const selectedDepartmentAvailability = selectedDepartmentId
        ? getDepartmentAvailability(selectedDepartmentId)
        : null;

    const filteredDepartments = departmentSearch.trim()
        ? departments.filter((dept) =>
              `${dept.name ?? `Reparto #${dept.id}`}`
                  .toLowerCase()
                  .includes(departmentSearch.trim().toLowerCase()),
          )
        : departments;

    const ensureDepartmentSelected = () => {
        if (readOnly) {
            if (!resolvedDepartmentName) {
                setDepartmentError('Reparto di ricovero non indicato');
                return false;
            }
            return true;
        }
        if (!selectedDepartmentId) {
            setDepartmentError('Seleziona il reparto di ricovero');
            return false;
        }
        setDepartmentError(null);
        return true;
    };

    const handlePrint = () => {
        if (!ensureDepartmentSelected()) return;
        const html = buildAdmissionHtml({
            emergency,
            admissionAt: admissionAtLabel,
            arrivalAt,
            patientLabel,
            accessReason,
            specialistName,
            specialistDepartment,
            specialistReport,
            investigations,
            investigationsById,
            operatorName,
            admissionDepartment: resolvedDepartmentName || 'Reparto non indicato',
        });
        const win = window.open('', '_blank');
        if (!win) {
            window.print();
            return;
        }
        win.document.open();
        win.document.write(html);
        win.document.close();
        win.focus();
        win.print();
    };

    const buildMailBody = () => {
        const lines = [
            `Verbale di ricovero - ER #${emergency.id}`,
            `Paziente: ${patientLabel}`,
            `Motivo accesso: ${accessReason}`,
            `Codice entrata: ${emergency.codice}`,
            `Data/ora arrivo: ${arrivalAt}`,
            `Data/ora ricovero: ${admissionAtLabel}`,
            `Reparto di ricovero: ${resolvedDepartmentName || 'Reparto non indicato'}`,
            `Operatore PS: ${operatorName}`,
            '',
            'Accertamenti:',
            investigations.length
                ? investigations
                      .map((inv) => {
                          const title =
                              investigationsById.get(inv.investigation_id) ?? `Accertamento #${inv.investigation_id}`;
                          const outcome = inv.outcome?.trim() || 'In attesa';
                          return `- ${title}: ${outcome}`;
                      })
                      .join('\n')
                : '- Nessun accertamento registrato',
            '',
            'Referto specialistico:',
            `Specialista: ${specialistName} (${specialistDepartment})`,
            `Referto: ${specialistReport?.notes ?? 'Non disponibile'}`,
            `Indicazioni: ${specialistReport?.disposition ?? 'Non disponibili'}`,
            `Follow up: ${specialistReport?.needs_follow_up ? 'Si' : 'No'}`,
            `Data referto: ${formatDateTime(specialistReport?.reported_at) || 'Non disponibile'}`,
            '',
            `Firma digitale operatore PS: ${operatorName}`,
            operatorEmail ? `Email operatore: ${operatorEmail}` : '',
        ].filter(Boolean);
        return lines.join('\n');
    };

    const handleSendEmail = () => {
        const target = emailValue.trim();
        if (!target) {
            onEmailError('Inserisci un indirizzo email');
            return;
        }
        if (!ensureDepartmentSelected()) return;
        onEmailError(null);
        const subject = `Verbale ricovero ER #${emergency.id}`;
        const body = buildMailBody();
        window.location.href = `mailto:${encodeURIComponent(target)}?subject=${encodeURIComponent(
            subject,
        )}&body=${encodeURIComponent(body)}`;
    };

    const handleConfirmAdmission = async () => {
        if (!ensureDepartmentSelected()) return;
        const emergencyId = Number(emergency.id);
        if (Number.isNaN(emergencyId)) {
            setConfirmAdmissionError('Identificativo emergenza non valido');
            return;
        }

        setConfirmingAdmission(true);
        setConfirmAdmissionError(null);
        try {
            const updated = await patchJson<{ id: number | string; status?: string | null }>(
                `/api/emergencies/${emergencyId}`,
                { status: 'ricovero', admission_department: selectedDepartmentName || null },
            );
            const updatedStatus = updated.status ?? 'ricovero';
            onEmergencyUpdated?.({
                id: updated.id ?? emergencyId,
                status: updatedStatus,
                admissionDepartment: selectedDepartmentName || null,
            });
            onOpenChange(false);
        } catch (err) {
            setConfirmAdmissionError(err instanceof Error ? err.message : 'Errore durante la conferma del ricovero');
        } finally {
            setConfirmingAdmission(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Verbale di ricovero</DialogTitle>
                    <DialogDescription>
                        Anteprima del verbale di ricovero con indicazione del reparto richiesto.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground" htmlFor="admission-department">
                        Reparto di ricovero
                    </label>
                    {readOnly ? (
                        <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-sm font-medium text-foreground">
                            {resolvedDepartmentName || 'Non indicato'}
                        </div>
                    ) : (
                        <Select
                            value={selectedDepartmentId}
                            onValueChange={(value) => {
                                setSelectedDepartmentId(value);
                                setDepartmentError(null);
                            }}
                        >
                            <SelectTrigger
                                id="admission-department"
                                className="h-11 justify-between bg-background px-3 shadow-sm"
                            >
                                <SelectValue placeholder="Seleziona reparto" />
                                {selectedDepartmentAvailability ? (
                                    <span className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                                            {selectedDepartmentAvailability} posti
                                        </span>
                                    </span>
                                ) : null}
                            </SelectTrigger>
                            <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                <div className="sticky top-0 z-10 border-b border-border/70 bg-popover px-2 py-2">
                                    <Input
                                        type="search"
                                        placeholder="Cerca reparto..."
                                        value={departmentSearch}
                                        onChange={(event) => setDepartmentSearch(event.target.value)}
                                        onKeyDown={(event) => event.stopPropagation()}
                                    />
                                </div>
                                {filteredDepartments.length ? (
                                    filteredDepartments.map((dept) => {
                                        const availability = getDepartmentAvailability(dept.id);
                                        return (
                                            <SelectItem
                                                key={dept.id}
                                                value={String(dept.id)}
                                                className="py-2"
                                            >
                                                <span className="flex w-full items-center justify-between gap-3">
                                                    <span className="text-sm">
                                                        {dept.name ?? `Reparto #${dept.id}`}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {availability} posti
                                                    </span>
                                                </span>
                                            </SelectItem>
                                        );
                                    })
                                ) : (
                                    <p className="px-3 py-2 text-xs text-muted-foreground">
                                        Nessun reparto trovato.
                                    </p>
                                )}
                            </SelectContent>
                        </Select>
                    )}
                    {departmentsLoading ? (
                        <p className="text-xs text-muted-foreground">Caricamento reparti...</p>
                    ) : null}
                    {departmentsError ? (
                        <p className="text-xs font-medium text-red-600">{departmentsError}</p>
                    ) : null}
                    {departmentError ? (
                        <p className="text-xs font-medium text-red-600">{departmentError}</p>
                    ) : null}
                </div>
                <div className="max-h-[55vh] space-y-5 overflow-y-auto pr-2">
                    <section className="rounded-lg border border-border/70 bg-muted/30 p-4">
                        <h3 className="text-sm font-semibold">Dati generali</h3>
                        <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                            <div>
                                <p className="text-xs text-muted-foreground">Paziente</p>
                                <p className="font-medium">{patientLabel}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Codice entrata</p>
                                <p className="font-medium">{emergency.codice}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Motivo accesso</p>
                                <p className="font-medium">{accessReason}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Data/ora arrivo</p>
                                <p className="font-medium">{arrivalAt}</p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-border/70 bg-background p-4">
                        <h3 className="text-sm font-semibold">Accertamenti preliminari ed esiti</h3>
                        <div className="mt-3 space-y-2 text-sm">
                            {investigations.length === 0 ? (
                                <p className="text-muted-foreground">Nessun accertamento registrato.</p>
                            ) : (
                                investigations.map((inv) => {
                                    const title =
                                        investigationsById.get(inv.investigation_id) ??
                                        `Accertamento #${inv.investigation_id}`;
                                    return (
                                        <div
                                            key={inv.id}
                                            className="rounded-md border border-border/60 bg-muted/30 p-3"
                                        >
                                            <p className="font-medium">{title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Eseguito: {formatDateTime(inv.performed_at) || 'Non disponibile'}
                                            </p>
                                            <p className="mt-1">
                                                Esito: {inv.outcome?.trim() || 'In attesa'}
                                            </p>
                                            {inv.notes ? (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Note: {inv.notes}
                                                </p>
                                            ) : null}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    <section className="rounded-lg border border-border/70 bg-background p-4">
                        <h3 className="text-sm font-semibold">Referto visita specialistica</h3>
                        <div className="mt-2 space-y-2 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs text-muted-foreground">Specialista</span>
                                <span className="font-medium">{specialistName}</span>
                                <span className="text-xs text-muted-foreground">|</span>
                                <span className="text-xs text-muted-foreground">{specialistDepartment}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Data referto: {formatDateTime(specialistReport?.reported_at) || 'Non disponibile'}
                            </p>
                            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
                                <p className="text-xs text-muted-foreground">Referto</p>
                                <p className="font-medium">
                                    {specialistReport?.notes?.trim() || 'Non disponibile'}
                                </p>
                            </div>
                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="rounded-md border border-border/60 bg-muted/30 p-3">
                                    <p className="text-xs text-muted-foreground">Indicazioni</p>
                                    <p className="font-medium">
                                        {specialistReport?.disposition?.trim() || 'Non disponibili'}
                                    </p>
                                </div>
                                <div className="rounded-md border border-border/60 bg-muted/30 p-3">
                                    <p className="text-xs text-muted-foreground">Follow up</p>
                                    <p className="font-medium">
                                        {specialistReport?.needs_follow_up ? 'Si' : 'No'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-border/70 bg-muted/30 p-4">
                        <h3 className="text-sm font-semibold">Ricovero</h3>
                        <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                            <div>
                                <p className="text-xs text-muted-foreground">Data/ora ricovero</p>
                                <p className="font-medium">{admissionAtLabel}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Reparto di ricovero</p>
                                <p className="font-medium">
                                    {resolvedDepartmentName || 'Selezionare reparto'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Firma digitale operatore PS</p>
                                <p className="font-medium">{operatorName}</p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-2 pt-4">
                    <label className="text-xs font-semibold text-muted-foreground" htmlFor="admission-email">
                        Invia via email
                    </label>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <Input
                            id="admission-email"
                            type="email"
                            placeholder="nome@dominio.it"
                            value={emailValue}
                            onChange={(event) => onEmailChange(event.target.value)}
                            onFocus={() => onEmailError(null)}
                        />
                        <Button type="button" variant="outline" onClick={handleSendEmail}>
                            Invia via email
                        </Button>
                    </div>
                    {emailError ? <p className="text-xs font-medium text-red-600">{emailError}</p> : null}
                </div>

                {confirmAdmissionError ? (
                    <p className="text-xs font-medium text-red-600">{confirmAdmissionError}</p>
                ) : null}

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Chiudi
                    </Button>
                    <Button type="button" onClick={handlePrint}>
                        Stampa PDF
                    </Button>
                    {readOnly ? null : (
                        <Button type="button" onClick={handleConfirmAdmission} disabled={confirmingAdmission}>
                            {confirmingAdmission ? 'Conferma in corso...' : 'Conferma ricovero'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function formatDateTime(dateStr?: string | null) {
    if (!dateStr) return '';
    const value = new Date(dateStr);
    if (Number.isNaN(value.getTime())) return '';
    return value.toLocaleString('it-IT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getDepartmentAvailability(id: number | string) {
    const base = Number(String(id).replace(/\D/g, ''));
    if (!Number.isFinite(base)) return 6;
    return ((base * 7) % 12) + 3;
}

type AdmissionHtmlPayload = {
    emergency: AdmissionEmergency;
    admissionAt: string;
    arrivalAt: string;
    patientLabel: string;
    accessReason: string;
    specialistName: string;
    specialistDepartment: string;
    specialistReport: AdmissionEmergency['result'];
    investigations: InvestigationPerformed[];
    investigationsById: Map<number, string>;
    operatorName: string;
    admissionDepartment: string;
};

function buildAdmissionHtml(payload: AdmissionHtmlPayload) {
    const {
        emergency,
        admissionAt,
        arrivalAt,
        patientLabel,
        accessReason,
        specialistName,
        specialistDepartment,
        specialistReport,
        investigations,
        investigationsById,
        operatorName,
        admissionDepartment,
    } = payload;
    const investigationsRows = investigations.length
        ? investigations
              .map((inv) => {
                  const title =
                      investigationsById.get(inv.investigation_id) ?? `Accertamento #${inv.investigation_id}`;
                  const outcome = inv.outcome?.trim() || 'In attesa';
                  const performedAt = formatDateTime(inv.performed_at) || 'Non disponibile';
                  const notes = inv.notes?.trim() || '';
                  return `
                    <tr>
                        <td>${escapeHtml(title)}</td>
                        <td>${escapeHtml(performedAt)}</td>
                        <td>${escapeHtml(outcome)}</td>
                        <td>${escapeHtml(notes)}</td>
                    </tr>
                  `;
              })
              .join('')
        : `
            <tr>
                <td colspan="4">Nessun accertamento registrato.</td>
            </tr>
          `;

    const reportNotes = specialistReport?.notes?.trim() || 'Non disponibile';
    const reportDisposition = specialistReport?.disposition?.trim() || 'Non disponibili';
    const reportDate = formatDateTime(specialistReport?.reported_at) || 'Non disponibile';
    const reportFollowUp = specialistReport?.needs_follow_up ? 'Si' : 'No';

    return `
<!doctype html>
<html lang="it">
<head>
    <meta charset="utf-8" />
    <title>Verbale di ricovero</title>
    <style>
        :root {
            color-scheme: light;
        }
        body {
            font-family: "Times New Roman", Georgia, serif;
            margin: 32px;
            color: #111;
        }
        h1, h2, h3 {
            margin: 0 0 12px 0;
        }
        h1 {
            font-size: 22px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        h2 {
            font-size: 16px;
            margin-top: 24px;
            border-bottom: 1px solid #333;
            padding-bottom: 6px;
        }
        h3 {
            font-size: 14px;
            margin-top: 16px;
        }
        p, td, th {
            font-size: 13px;
            line-height: 1.5;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        th, td {
            border: 1px solid #999;
            padding: 6px 8px;
            vertical-align: top;
        }
        th {
            background: #f0f0f0;
            text-align: left;
        }
        .meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 16px;
            margin-top: 8px;
        }
        .meta div {
            border: 1px solid #999;
            padding: 8px;
        }
        .label {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 11px;
            color: #444;
        }
        .signature {
            margin-top: 36px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .signature-line {
            width: 45%;
            border-top: 1px solid #111;
            padding-top: 6px;
            text-align: center;
            font-size: 12px;
        }
        .footer {
            margin-top: 24px;
            font-size: 11px;
            color: #555;
        }
    </style>
</head>
<body>
    <h1>Verbale di ricovero</h1>
    <p>Numero pratica: ER #${escapeHtml(String(emergency.id))}</p>

    <h2>Dati anagrafici e accesso</h2>
    <div class="meta">
        <div>
            <div class="label">Paziente</div>
            <div>${escapeHtml(patientLabel)}</div>
        </div>
        <div>
            <div class="label">Codice entrata</div>
            <div>${escapeHtml(emergency.codice)}</div>
        </div>
        <div>
            <div class="label">Motivo di accesso</div>
            <div>${escapeHtml(accessReason)}</div>
        </div>
        <div>
            <div class="label">Data e ora di arrivo</div>
            <div>${escapeHtml(arrivalAt)}</div>
        </div>
    </div>

    <h2>Accertamenti eseguiti</h2>
    <table>
        <thead>
            <tr>
                <th>Accertamento</th>
                <th>Data/Ora</th>
                <th>Esito</th>
                <th>Note</th>
            </tr>
        </thead>
        <tbody>
            ${investigationsRows}
        </tbody>
    </table>

    <h2>Referto visita specialistica</h2>
    <table>
        <tbody>
            <tr>
                <th>Specialista</th>
                <td>${escapeHtml(specialistName)}</td>
            </tr>
            <tr>
                <th>Reparto</th>
                <td>${escapeHtml(specialistDepartment)}</td>
            </tr>
            <tr>
                <th>Data referto</th>
                <td>${escapeHtml(reportDate)}</td>
            </tr>
            <tr>
                <th>Referto</th>
                <td>${escapeHtml(reportNotes)}</td>
            </tr>
            <tr>
                <th>Indicazioni</th>
                <td>${escapeHtml(reportDisposition)}</td>
            </tr>
            <tr>
                <th>Follow up</th>
                <td>${escapeHtml(reportFollowUp)}</td>
            </tr>
        </tbody>
    </table>

    <h2>Ricovero</h2>
    <div class="meta">
        <div>
            <div class="label">Data e ora ricovero</div>
            <div>${escapeHtml(admissionAt)}</div>
        </div>
        <div>
            <div class="label">Reparto di ricovero</div>
            <div>${escapeHtml(admissionDepartment)}</div>
        </div>
        <div>
            <div class="label">Operatore PS</div>
            <div>${escapeHtml(operatorName)}</div>
        </div>
    </div>

    <div class="signature">
        <div class="signature-line">Firma digitale operatore PS</div>
        <div class="signature-line">Firma paziente</div>
    </div>

    <div class="footer">
        Documento generato dal sistema di pronto soccorso. Conservare agli atti.
    </div>
</body>
</html>
    `;
}
