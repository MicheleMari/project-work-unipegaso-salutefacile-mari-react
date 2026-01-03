import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type Status = 'checking' | 'online' | 'offline';

interface ApiStatusProps {
    /**
     * Endpoints to probe for reachability. If not provided, falls back to
     * VITE_HEALTH_ENDPOINTS (comma-separated) or '/'.
     */
    endpoints?: string[];
    refreshMs?: number;
    className?: string;
}

const DEFAULT_REFRESH_MS = 30000;

export function ApiStatus({
    endpoints,
    refreshMs = DEFAULT_REFRESH_MS,
    className,
}: ApiStatusProps) {
    const [status, setStatus] = useState<Status>('checking');

    const urls = useMemo(() => {
        const forceOffline =
            (import.meta.env.VITE_FORCE_OFFLINE_TEST as string | undefined) ===
            'true';

        if (forceOffline) {
            return ['http://127.0.0.1:9/offline-test'];
        }

        if (endpoints?.length) {
            return endpoints;
        }

        const envValue = import.meta.env.VITE_HEALTH_ENDPOINTS as string | undefined;

        if (envValue) {
            return envValue
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean);
        }

        return ['/'];
    }, [endpoints]);

    const effectiveRefreshMs = useMemo(() => {
        const forceOffline =
            (import.meta.env.VITE_FORCE_OFFLINE_TEST as string | undefined) ===
            'true';

        return forceOffline ? 3000 : refreshMs;
    }, [refreshMs]);

    useEffect(() => {
        let isMounted = true;

        const check = async () => {
            try {
                await Promise.all(
                    urls.map(async (url) => {
                        const response = await fetch(url, { method: 'GET' });

                        if (!response.ok) {
                            throw new Error(`Endpoint ${url} not reachable`);
                        }
                    }),
                );

                if (isMounted) {
                    setStatus('online');
                }
            } catch (error) {
                if (isMounted) {
                    setStatus('offline');
                }
            }
        };

        check();
        const interval = setInterval(check, effectiveRefreshMs);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [urls, effectiveRefreshMs]);

    const indicatorColor =
        status === 'online'
            ? 'bg-emerald-500'
            : status === 'offline'
              ? 'bg-red-500'
              : 'bg-amber-400';

    const label =
        status === 'online'
            ? 'Online'
            : status === 'offline'
              ? 'Offline'
              : 'Verifica...';

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground',
                className,
            )}
            aria-live="polite"
        >
            <span
                className={cn(
                    'inline-block h-2.5 w-2.5 rounded-full shadow-inner',
                    indicatorColor,
                    status === 'online'
                        ? 'animate-pulse ring-4 ring-emerald-500/20'
                        : '',
                )}
                aria-hidden
            />
            {label}
        </span>
    );
}
