import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type PrivacyCountdownBannerProps = {
    label: string;
    visible: boolean;
};

export function PrivacyCountdownBanner({ label, visible }: PrivacyCountdownBannerProps) {
    const [rendered, setRendered] = useState(visible);

    useEffect(() => {
        if (visible) {
            setRendered(true);
            return;
        }
        const timeout = setTimeout(() => setRendered(false), 200);
        return () => clearTimeout(timeout);
    }, [visible]);

    if (!rendered) return null;

    return (
        <div
            className={cn(
                'fixed inset-x-0 top-0 z-50 flex items-center gap-3 px-4 py-2',
                'bg-amber-400/95 text-amber-950 shadow-md backdrop-blur',
                'border-b border-amber-500/80',
                'transition-transform duration-200 ease-out',
                visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
            )}
            role="status"
        >
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
            <p className="text-sm font-semibold">
                Privacy mode tra {label}. Effettua un&apos;azione sullo schermo per mantenere la
                visualizzazione attiva.
            </p>
        </div>
    );
}
