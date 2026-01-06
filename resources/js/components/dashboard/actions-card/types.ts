export type ActionItem = {
    title: string;
    accent: 'amber' | 'blue' | 'emerald';
    badge: string;
    badgeTone?: 'solid' | 'muted';
};

export type CreatedEmergency = {
    id: number;
    description?: string | null;
    alert_code?: string | null;
    status?: string | null;
    patient: {
        id: number;
        name: string;
        surname: string;
    };
};

export type PriorityCode = 'bianco' | 'verde' | 'giallo' | 'arancio' | 'rosso';

export function priorityOrder(code: string) {
    const normalized = code.toLowerCase();
    if (normalized === 'rosso') return 1;
    if (normalized === 'arancio' || normalized === 'arancione') return 2;
    if (normalized === 'giallo') return 3;
    if (normalized === 'verde') return 4;
    return 5;
}
