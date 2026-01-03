import { cn } from '@/lib/utils';
import AppLogoIcon from './app-logo-icon';

interface AppLogoProps {
    className?: string;
    iconClassName?: string;
}

export default function AppLogo({ className, iconClassName }: AppLogoProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div
                className={cn(
                    'flex h-10 w-40 items-center justify-center overflow-visible',
                    iconClassName,
                )}
            >
                <AppLogoIcon className="h-full w-full object-contain" />
            </div>
        </div>
    );
}
