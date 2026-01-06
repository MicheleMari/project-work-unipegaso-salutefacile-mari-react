export function getSpecialistRequestStatusClass(status?: string | null) {
    switch (status) {
        case 'completed':
            return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200';
        case 'cancelled':
            return 'bg-red-500/10 text-red-700 dark:text-red-200';
        case 'scheduled':
        case 'in_progress':
        case 'waiting_report':
            return 'bg-amber-500/10 text-amber-700 dark:text-amber-200';
        default:
            return 'bg-slate-500/10 text-slate-700 dark:text-slate-200';
    }
}
