import { cn } from '@/lib/utils';

type SwitchProps = {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    className?: string;
    'aria-label'?: string;
};

export function Switch({
    checked,
    onCheckedChange,
    disabled,
    id,
    className,
    'aria-label': ariaLabel,
}: SwitchProps) {
    return (
        <button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full border transition-colors',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none',
                checked
                    ? 'border-emerald-500/70 bg-emerald-500'
                    : 'border-border bg-muted',
                disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                className,
            )}
        >
            <span
                className={cn(
                    'inline-block size-5 rounded-full bg-background shadow-sm transition-transform',
                    checked ? 'translate-x-5' : 'translate-x-0.5',
                )}
            />
        </button>
    );
}
