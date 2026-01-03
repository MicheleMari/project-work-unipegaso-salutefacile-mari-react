import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { resolveUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { LogIn, X } from 'lucide-react';

type QuickAccessCardProps = {
    identifier: string;
    label?: string;
    displayName?: string | null;
    lastUsedAt?: string;
    avatar?: string | null;
    onLogin: () => void;
    onRemove: () => void;
    disabled?: boolean;
    className?: string;
};

const getInitials = (text: string) =>
    text
        .split('@')[0]
        .split(/[.\s_-]/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'U';

const formatLastUsedLabel = (lastUsedAt?: string) => {
    if (!lastUsedAt) {
        return 'Accesso ricordato su questo dispositivo';
    }

    const parsed = new Date(lastUsedAt);
    if (Number.isNaN(parsed.getTime())) {
        return 'Accesso ricordato su questo dispositivo';
    }

    const formatter = new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return `Ultimo accesso rapido: ${formatter.format(parsed)}`;
};

export default function QuickAccessCard({
    identifier,
    label,
    displayName,
    lastUsedAt,
    avatar,
    onLogin,
    onRemove,
    disabled,
    className,
}: QuickAccessCardProps) {
    const displayLabel = displayName || label || identifier;
    const avatarSrc = avatar ? resolveUrl(avatar) : null;

    return (
        <Card
            className={cn(
                'border-primary/30 bg-primary/5 transition-colors hover:border-primary hover:bg-primary/10',
                disabled && 'opacity-75',
                className,
            )}
        >
            <CardHeader className="flex flex-row items-start gap-3 pb-4">
                <Avatar className="size-12">
                    {avatarSrc && (
                        <AvatarImage
                            src={avatarSrc}
                            alt={`Avatar di ${displayLabel}`}
                            className="bg-neutral-100"
                        />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(displayLabel)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col gap-1">
                    <CardTitle className="text-base leading-tight">
                        Accesso rapido
                    </CardTitle>
                    <CardDescription className="text-sm leading-tight text-foreground">
                        {displayLabel}
                    </CardDescription>
                    <p className="text-xs text-muted-foreground">
                        {formatLastUsedLabel(lastUsedAt)}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="-mt-1"
                    onClick={onRemove}
                    aria-label="Rimuovi account salvato per accesso rapido"
                >
                    <X className="size-4" />
                </Button>
            </CardHeader>
            <CardContent className="pt-0">
                <Button
                    type="button"
                    className="w-full"
                    onClick={onLogin}
                    disabled={disabled}
                >
                    <LogIn className="size-4" aria-hidden="true" />
                    Entra senza password
                </Button>
            </CardContent>
        </Card>
    );
}
