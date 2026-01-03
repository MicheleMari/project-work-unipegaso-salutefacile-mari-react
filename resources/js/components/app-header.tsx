import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { CurrentDateTime } from '@/components/current-datetime';
import { ApiStatus } from '@/components/api-status';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn, formatDuration, isSameUrl, resolveUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Menu, Search, EyeOff, Eye } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import { PrivacyCountdownBanner } from '@/components/privacy-countdown-banner';

const mainNavItems: NavItem[] = [
    {
        title: 'Pannello Operativo',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const rightNavItems: NavItem[] = [
    {
        title: 'Documentazione',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

const activeItemStyles =
    'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const [privacyMode, setPrivacyMode] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const privacyPassword =
        import.meta.env.VITE_PRIVACY_PASSWORD?.trim() || 'admin';
    const parsedTimeout = Number.parseInt(
        import.meta.env.VITE_PRIVACY_TIMEOUT_SECONDS ?? '300',
        10,
    );
    const autoPrivacyTimeout =
        Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : null;
    const [remainingSeconds, setRemainingSeconds] =
        useState<number | null>(autoPrivacyTimeout);
    const [halfWarningText, setHalfWarningText] = useState<string | null>(null);
    const halfWarnedRef = useRef(false);
    const activityResetRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const root = document.documentElement;
        if (privacyMode) {
            root.classList.add('privacy-mode');
        } else {
            root.classList.remove('privacy-mode');
        }

        return () => {
            root.classList.remove('privacy-mode');
        };
    }, [privacyMode]);

    useEffect(() => {
        if (privacyMode || !autoPrivacyTimeout) {
            return undefined;
        }

        halfWarnedRef.current = false;
        setHalfWarningText(null);
        setRemainingSeconds(autoPrivacyTimeout);

        const halfPoint = Math.floor(autoPrivacyTimeout / 2);
        const interval = setInterval(() => {
            setRemainingSeconds((prev) => {
                const current = typeof prev === 'number' ? prev : autoPrivacyTimeout;
                const next = current - 1;

                if (next <= 0) {
                    setPrivacyMode(true);
                    return autoPrivacyTimeout;
                }

                if (!halfWarnedRef.current && next <= halfPoint) {
                    setHalfWarningText(
                        `Tra ${formatDuration(next)} sarà attivata la privacy mode.`,
                    );
                    halfWarnedRef.current = true;
                }

                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [privacyMode, autoPrivacyTimeout]);

    const resetCountdown = () => {
        if (!autoPrivacyTimeout) return;
        setRemainingSeconds(autoPrivacyTimeout);
        setHalfWarningText(null);
        halfWarnedRef.current = false;
    };

    const handleTogglePrivacy = () => {
        if (!privacyMode) {
            setPrivacyMode(true);
            setPasswordDialogOpen(false);
            return;
        }
        setPasswordDialogOpen(true);
    };

    const handleConfirmPassword = () => {
        if (passwordInput.trim() === privacyPassword) {
            setPrivacyMode(false);
            setPasswordDialogOpen(false);
            setPasswordInput('');
            setPasswordError(null);
            resetCountdown();
            return;
        }
        setPasswordError('Password non corretta. Riprova.');
    };

    useEffect(() => {
        if (!autoPrivacyTimeout) return;

        const handleUserActivity = () => {
            if (privacyMode) return;
            resetCountdown();

            if (activityResetRef.current) {
                clearTimeout(activityResetRef.current);
            }
            activityResetRef.current = setTimeout(() => {
                activityResetRef.current = null;
            }, 200);
        };

        const events: Array<keyof WindowEventMap> = [
            'mousemove',
            'keydown',
            'click',
            'scroll',
            'touchstart',
        ];

        events.forEach((event) => window.addEventListener(event, handleUserActivity));

        return () => {
            events.forEach((event) => window.removeEventListener(event, handleUserActivity));
            if (activityResetRef.current) {
                clearTimeout(activityResetRef.current);
            }
        };
    }, [privacyMode, autoPrivacyTimeout]);

    return (
        <>
            {!privacyMode &&
                autoPrivacyTimeout &&
                typeof remainingSeconds === 'number' && (
                    <PrivacyCountdownBanner
                        label={formatDuration(remainingSeconds)}
                        visible={remainingSeconds <= 10}
                    />
                )}
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px]"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                            >
                                <SheetTitle className="sr-only">
                                    Menu di navigazione
                                </SheetTitle>
                            <SheetHeader className="flex justify-start text-left">
                                <div className="flex h-10 w-40 items-center">
                                    <AppLogoIcon className="h-full w-full object-contain" />
                                </div>
                            </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && (
                                                        <Icon
                                                            iconNode={item.icon}
                                                            className="h-5 w-5"
                                                        />
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {rightNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={resolveUrl(item.href)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && (
                                                        <Icon
                                                            iconNode={item.icon}
                                                            className="h-5 w-5"
                                                        />
                                                    )}
                                                    <span>{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                isSameUrl(
                                                    page.url,
                                                    item.href,
                                                ) && activeItemStyles,
                                                'h-9 cursor-pointer px-3',
                                            )}
                                        >
                                            {item.icon && (
                                                <Icon
                                                    iconNode={item.icon}
                                                    className="mr-2 h-4 w-4"
                                                />
                                            )}
                                            {item.title}
                                        </Link>
                                        {isSameUrl(page.url, item.href) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            <CurrentDateTime className="hidden sm:inline-flex" />
                            <ApiStatus className="hidden md:inline-flex" />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="group h-9 w-9 cursor-pointer"
                            >
                                <Search className="!size-5 opacity-80 group-hover:opacity-100" />
                            </Button>
                            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                                <Button
                                    variant={privacyMode ? 'secondary' : 'ghost'}
                                    size="icon"
                                    className="group h-9 w-9 cursor-pointer"
                                    aria-pressed={privacyMode}
                                    aria-label="Attiva o disattiva privacy mode"
                                    onClick={handleTogglePrivacy}
                                >
                                    {privacyMode ? (
                                        <Eye className="!size-5 opacity-80 group-hover:opacity-100" />
                                    ) : (
                                        <EyeOff className="!size-5 opacity-80 group-hover:opacity-100" />
                                    )}
                                </Button>
                                {!privacyMode &&
                                    autoPrivacyTimeout &&
                                    typeof remainingSeconds === 'number' && (
                                        <span className="hidden text-[11px] font-semibold text-amber-700 lg:inline">
                                            {formatDuration(remainingSeconds)}
                                        </span>
                                    )}
                                {!privacyMode &&
                                    halfWarningText &&
                                    autoPrivacyTimeout &&
                                    typeof remainingSeconds === 'number' &&
                                    remainingSeconds > 10 && (
                                        <p className="hidden text-xs text-amber-600 lg:block">
                                            {halfWarningText}
                                        </p>
                                    )}

                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Disattiva privacy mode</DialogTitle>
                                        <DialogDescription>
                                            Inserisci la password per mostrare i dati sensibili.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-2">
                                        <InputOTP
                                            maxLength={6}
                                            value={passwordInput}
                                            onChange={(value) => {
                                                setPasswordInput(value);
                                                setPasswordError(null);
                                            }}
                                            containerClassName="w-full justify-between"
                                            inputMode="numeric"
                                            autoFocus
                                            aria-label="Inserisci la password a 6 cifre"
                                        >
                                            <InputOTPGroup className="w-full justify-between">
                                                {Array.from({ length: 6 }).map((_, idx) => (
                                                    <InputOTPSlot
                                                        key={idx}
                                                        index={idx}
                                                        className={cn(
                                                            'h-10 w-10 border-input text-lg font-semibold',
                                                            passwordError &&
                                                                'border-destructive ring-1 ring-destructive/40',
                                                        )}
                                                    />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                        {passwordError && (
                                            <p className="text-xs text-destructive">
                                                {passwordError}
                                            </p>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                                            Annulla
                                        </Button>
                                        <Button onClick={handleConfirmPassword}>Sblocca</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <div className="hidden lg:flex">
                                {rightNavItems.map((item) => (
                                    <TooltipProvider
                                        key={item.title}
                                        delayDuration={0}
                                    >
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <a
                                                    href={resolveUrl(item.href)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                >
                                                    <span className="sr-only">
                                                        {item.title}
                                                    </span>
                                                    {item.icon && (
                                                        <Icon
                                                            iconNode={item.icon}
                                                            className="size-5 opacity-80 group-hover:opacity-100"
                                                        />
                                                    )}
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full p-1"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
