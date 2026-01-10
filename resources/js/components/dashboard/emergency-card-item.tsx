import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Ambulance, Stethoscope } from 'lucide-react';
import type { EmergencyItem } from '@/components/dashboard/emergency-types';

type EmergencyCardItemProps = {
    item: EmergencyItem;
    codiceClassName: string;
    statusClassName: string;
    displayStatus: string;
    waitElapsed: string;
    waitTone: { className: string; icon: 'alert' | 'none'; tone: 'green' | 'yellow' | 'red' };
    showInvestigationActions: boolean;
    allowInvestigationActions: boolean;
    showSpecialistActions: boolean;
    isClosing: boolean;
    showSpecialistOutcomeLink: boolean;
    showOmiAction: boolean;
    omiLoading: boolean;
    onOpenPatientDetails: (patientId?: number | string, patientName?: string) => void;
    onOpenFlow: (item: EmergencyItem) => void;
    onOpenStatus: (item: EmergencyItem) => void;
    onOpenSpecialist: (item: EmergencyItem) => void;
    onOpenDetails: (item: EmergencyItem) => void;
    onOpenDischarge: (item: EmergencyItem) => void;
    onOpenAdmission: (item: EmergencyItem) => void;
    onSetOmi: (item: EmergencyItem) => void;
};

export function EmergencyCardItem({
    item,
    codiceClassName,
    statusClassName,
    displayStatus,
    waitElapsed,
    waitTone,
    showInvestigationActions,
    allowInvestigationActions,
    showSpecialistActions,
    isClosing,
    showSpecialistOutcomeLink,
    showOmiAction,
    omiLoading,
    onOpenPatientDetails,
    onOpenFlow,
    onOpenStatus,
    onOpenSpecialist,
    onOpenDetails,
    onOpenDischarge,
    onOpenAdmission,
    onSetOmi,
}: EmergencyCardItemProps) {
    const normalizedStatus = (item.stato ?? '').replace(/\./g, '').toLowerCase();
    const isAdmitted = normalizedStatus === 'ricovero';
    const isChiusura = normalizedStatus === 'chiusura';
    return (
        <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background/70 p-3 shadow-xs md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
                <Badge variant="outline" className={codiceClassName}>
                    {item.codice}
                </Badge>
                <div className="space-y-1">
                    <button
                        type="button"
                        className="flex items-center gap-2 text-left text-sm font-semibold leading-tight underline-offset-4 hover:underline"
                        onClick={() => onOpenPatientDetails(item.patientId, item.paziente)}
                    >
                        {item.isFrom118 ? (
                            <Ambulance className="size-4 text-blue-600 dark:text-blue-200" />
                        ) : null}
                        {item.paziente}
                    </button>
                    <p className="text-xs text-muted-foreground">{item.arrivo}</p>
                    {['risolto_in_ambulanza', 'obi', 'ricovero'].includes(normalizedStatus) ? null : (
                        <div
                            className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-[11px] font-semibold ${waitTone.className}`}
                        >
                            {waitTone.icon === 'alert' ? (
                                <AlertTriangle className="size-3.5" />
                            ) : (
                                <Ambulance className="size-3.5" />
                            )}
                            <span>Attesa {waitElapsed}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground md:items-end">
                {isAdmitted ? (
                    <>
                        <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                                statusClassName || 'bg-muted text-muted-foreground'
                            }`}
                        >
                            <Stethoscope className="size-3.5" />
                            {displayStatus}
                        </span>
                        <div className="text-xs text-muted-foreground">Reparto di ricovero</div>
                        <div className="text-sm font-semibold text-foreground">
                            {item.admissionDepartment || 'Non indicato'}
                        </div>
                        <Button
                            variant="link"
                            size="sm"
                            className="px-0 text-blue-700 hover:text-blue-600 dark:text-blue-200"
                            onClick={() => onOpenAdmission(item)}
                        >
                            Stampa verbale di ricovero
                        </Button>
                    </>
                ) : (
                    <>
                        <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                                statusClassName || 'bg-muted text-muted-foreground'
                            }`}
                        >
                            <Stethoscope className="size-3.5" />
                            {displayStatus}
                        </span>
                        {allowInvestigationActions ? (
                            <Button
                                size="sm"
                                variant="outline"
                                className="mt-1 font-medium"
                                onClick={() => onOpenFlow(item)}
                            >
                                <Stethoscope className="mr-2 size-4" aria-hidden="true" />
                                Richiesta accertamenti preliminari
                            </Button>
                        ) : null}
                        {allowInvestigationActions ? (
                            <Button
                                variant="link"
                                size="sm"
                                className="px-0 text-emerald-700 hover:text-emerald-600 dark:text-emerald-200"
                                onClick={() => onOpenStatus(item)}
                            >
                                Rivedi esami e consulenze
                            </Button>
                        ) : null}
                        {showSpecialistActions && item.specialist && !isClosing ? (
                            <Button
                                variant="link"
                                size="sm"
                                className="px-0 text-blue-700 hover:text-blue-600 dark:text-blue-200"
                                onClick={() => onOpenSpecialist(item)}
                            >
                                Visualizza specialista chiamato
                            </Button>
                        ) : null}
                        {showSpecialistOutcomeLink && isChiusura ? (
                            <Button
                                variant="link"
                                size="sm"
                                className="px-0 text-blue-700 hover:text-blue-600 dark:text-blue-200"
                                onClick={() => onOpenDetails(item)}
                            >
                                Esito visita specialistica
                            </Button>
                        ) : null}
                    </>
                )}
                {isClosing ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-200 bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/15 dark:border-emerald-800 dark:text-emerald-100"
                            onClick={() => onOpenDischarge(item)}
                        >
                            Dimetti
                        </Button>
                        {showOmiAction ? (
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-purple-200 bg-purple-500/10 text-purple-800 hover:bg-purple-500/15 dark:border-purple-800 dark:text-purple-100"
                                onClick={() => onSetOmi(item)}
                                disabled={omiLoading}
                            >
                                {omiLoading ? 'Invio...' : 'O.B.I.'}
                            </Button>
                        ) : null}
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 bg-red-500/10 text-red-800 hover:bg-red-500/15 dark:border-red-900 dark:text-red-100"
                            onClick={() => onOpenAdmission(item)}
                        >
                            Ricovera
                        </Button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
