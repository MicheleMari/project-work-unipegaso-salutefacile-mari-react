import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CurrentDateTimeProps {
    className?: string;
    locale?: string;
}

/**
 * Displays the current date and time, updating every second.
 */
export function CurrentDateTime({
    className,
    locale = 'it-IT',
}: CurrentDateTimeProps) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formattedNow = now.toLocaleString(locale, {
        dateStyle: 'short',
        timeStyle: 'medium',
    });

    return (
        <span
            className={cn(
                'whitespace-nowrap rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground',
                className,
            )}
        >
            {formattedNow}
        </span>
    );
}
