import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { apiRequest, patchJson } from '@/lib/api';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import codiciCatastali from '@/data/codici_catastali.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PencilLine } from 'lucide-react';

type PatientDetails = {
    id: number;
    name: string;
    surname: string;
    fiscal_code?: string | null;
    residence_address?: string | null;
    phone?: string | null;
    email?: string | null;
};

type PatientDetailsDialogProps = {
    open: boolean;
    patientId?: number | string;
    patientName?: string;
    onOpenChange: (open: boolean) => void;
};

type CadastralCode = {
    codice: string;
    comune: string;
    provincia: string;
};

export function PatientDetailsDialog({
    open,
    patientId,
    patientName,
    onOpenChange,
}: PatientDetailsDialogProps) {
    const [patient, setPatient] = useState<PatientDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        name: '',
        surname: '',
        fiscal_code: '',
        residence_address: '',
        phone: '',
        email: '',
    });
    const codiceComuneMap = useMemo(() => {
        const entries = (codiciCatastali as CadastralCode[]).map((item) => [
            item.codice.toUpperCase(),
            { comune: item.comune, provincia: item.provincia },
        ]);
        return new Map(entries);
    }, []);

    const decodedCf = useMemo(() => decodeCodiceFiscale(patient?.fiscal_code ?? '', codiceComuneMap), [
        patient?.fiscal_code,
        codiceComuneMap,
    ]);

    useEffect(() => {
        if (!open) {
            setPatient(null);
            setError(null);
            setLoading(false);
            setSaving(false);
            setEditMode(false);
            return;
        }

        if (!patientId) {
            setPatient(null);
            setError('Paziente non disponibile');
            return;
        }

        setLoading(true);
        setError(null);
        apiRequest<PatientDetails>(`/api/patients/${patientId}`)
            .then((data) => {
                setPatient(data);
            })
            .catch((err) => {
                setError(err instanceof Error ? err.message : 'Errore nel caricamento anagrafica');
                setPatient(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [open, patientId]);

    useEffect(() => {
        if (patient) {
            setForm({
                name: patient.name ?? '',
                surname: patient.surname ?? '',
                fiscal_code: patient.fiscal_code ?? '',
                residence_address: patient.residence_address ?? '',
                phone: patient.phone ?? '',
                email: patient.email ?? '',
            });
        }
    }, [patient]);

    const handleSave = async (event: FormEvent) => {
        event.preventDefault();
        if (!patient) return;
        setSaving(true);
        setError(null);
        try {
            const updated = await patchJson<PatientDetails>(`/api/patients/${patient.id}`, {
                name: form.name.trim(),
                surname: form.surname.trim(),
                fiscal_code: form.fiscal_code.trim() || null,
                residence_address: form.residence_address.trim() || null,
                phone: form.phone.trim() || null,
                email: form.email.trim() || null,
            });
            setPatient(updated);
            setEditMode(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante il salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        if (patient) {
            setForm({
                name: patient.name ?? '',
                surname: patient.surname ?? '',
                fiscal_code: patient.fiscal_code ?? '',
                residence_address: patient.residence_address ?? '',
                phone: patient.phone ?? '',
                email: patient.email ?? '',
            });
        }
        setEditMode(false);
        setError(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                        <DialogTitle>
                            Anagrafica paziente {patientName ? ` - ${patientName}` : ''}
                        </DialogTitle>
                    </div>
                    {patient ? (
                        <Button
                            type="button"
                            variant={editMode ? 'secondary' : 'ghost'}
                            size="icon"
                            aria-label={editMode ? 'Esci dalla modifica' : 'Modifica anagrafica'}
                            onClick={() => (editMode ? handleCancelEdit() : setEditMode(true))}
                        >
                            <PencilLine className="size-4" />
                        </Button>
                    ) : null}
                </DialogHeader>
                {loading ? (
                    <p className="text-sm text-muted-foreground">Caricamento dati paziente...</p>
                ) : error ? (
                    <p className="text-sm font-medium text-red-600">{error}</p>
                ) : patient ? (
                    editMode ? (
                        <form className="grid gap-4" onSubmit={handleSave}>
                            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="patient-name">Nome</Label>
                                    <Input
                                        id="patient-name"
                                        value={form.name}
                                        onChange={(event) =>
                                            setForm((prev) => ({ ...prev, name: event.target.value }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="patient-surname">Cognome</Label>
                                    <Input
                                        id="patient-surname"
                                        value={form.surname}
                                        onChange={(event) =>
                                            setForm((prev) => ({ ...prev, surname: event.target.value }))
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="patient-fiscal">Codice fiscale</Label>
                                <Input
                                    id="patient-fiscal"
                                    value={form.fiscal_code}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            fiscal_code: event.target.value.toUpperCase(),
                                        }))
                                    }
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="patient-address">Indirizzo</Label>
                                <Input
                                    id="patient-address"
                                    value={form.residence_address}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            residence_address: event.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="patient-phone">Telefono</Label>
                                    <Input
                                        id="patient-phone"
                                        value={form.phone}
                                        onChange={(event) =>
                                            setForm((prev) => ({ ...prev, phone: event.target.value }))
                                        }
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="patient-email">Email</Label>
                                    <Input
                                        id="patient-email"
                                        type="email"
                                        value={form.email}
                                        onChange={(event) =>
                                            setForm((prev) => ({ ...prev, email: event.target.value }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                    Annulla
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Salvataggio...' : 'Salva modifiche'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid gap-4">
                            <PatientField label="Nome" value={patient.name} />
                            <PatientField label="Cognome" value={patient.surname} />
                            <PatientField label="Codice fiscale" value={patient.fiscal_code} />
                            <PatientField label="Data di nascita" value={decodedCf?.birthDateFormatted} />
                            <PatientField label="Età" value={decodedCf?.age ? `${decodedCf.age} anni` : undefined} />
                            <PatientField label="Sesso" value={decodedCf?.gender} />
                            <PatientField label="Comune di nascita" value={decodedCf?.birthPlace} />
                            <PatientField label="Indirizzo" value={patient.residence_address} />
                            <PatientField label="Telefono" value={patient.phone} />
                            <PatientField label="Email" value={patient.email} />
                        </div>
                    )
                ) : (
                    <p className="text-sm text-muted-foreground">Nessun dato disponibile</p>
                )}
            </DialogContent>
        </Dialog>
    );
}

function PatientField({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <div className="grid gap-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{value || '—'}</p>
        </div>
    );
}

export type { PatientDetails };

type DecodedCodiceFiscale = {
    birthDateFormatted: string;
    age: number;
    gender: 'M' | 'F';
    birthPlace: string;
};

function decodeCodiceFiscale(cf: string, cadastralMap: Map<string, { comune: string; provincia: string }>): DecodedCodiceFiscale | null {
    const cleaned = cf.trim().toUpperCase();
    if (cleaned.length < 16) return null;

    const yearPart = cleaned.slice(6, 8);
    const monthLetter = cleaned.charAt(8);
    const dayPart = cleaned.slice(9, 11);
    const comuneCode = cleaned.slice(11, 15);

    const months: Record<string, number> = {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
        E: 5,
        H: 6,
        L: 7,
        M: 8,
        P: 9,
        R: 10,
        S: 11,
        T: 12,
    };

    const yearNum = Number.parseInt(yearPart, 10);
    const monthNum = months[monthLetter];
    const dayNumRaw = Number.parseInt(dayPart, 10);

    if (!Number.isFinite(yearNum) || !monthNum || !Number.isFinite(dayNumRaw)) return null;

    const isFemale = dayNumRaw > 40;
    const day = isFemale ? dayNumRaw - 40 : dayNumRaw;
    const currentYear = new Date().getFullYear();
    const century = yearNum + 1900 > currentYear ? 1900 : 2000;
    const year = century + yearNum;

    const birthDate = new Date(Date.UTC(year, monthNum - 1, day));
    const today = new Date();
    let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
    const m = today.getUTCMonth() - birthDate.getUTCMonth();
    if (m < 0 || (m === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
        age -= 1;
    }

    const comuneData = cadastralMap.get(comuneCode);
    const birthPlace = comuneData
        ? `${comuneData.comune} (${comuneData.provincia})`
        : comuneCode || 'ND';

    const birthDateFormatted = birthDate.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    return {
        birthDateFormatted,
        age,
        gender: isFemale ? 'F' : 'M',
        birthPlace,
    };
}
