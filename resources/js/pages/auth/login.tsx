import QuickAccessCard from '@/components/auth/quick-access-card';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { useQuickAccessAccount } from '@/hooks/use-quick-access-account';
import { resolveUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head, router } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type SharedData } from '@/types';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({
    status,
    canResetPassword,
}: LoginProps) {
    const [rememberSelected, setRememberSelected] = useState(false);
    const [identifierInput, setIdentifierInput] = useState('');
    const [quickLoginPending, setQuickLoginPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { account, rememberAccount, clearAccount } = useQuickAccessAccount();

    const savedAccount = useMemo(
        () => (account?.identifier ? account : null),
        [account],
    );

    useEffect(() => {
        if (savedAccount?.identifier) {
            setIdentifierInput((current) => current || savedAccount.identifier);
            setRememberSelected(true);
        }
    }, [savedAccount]);

    const handleLoginSuccess = useCallback(
        (page?: { props?: Partial<SharedData> }) => {
            if (!rememberSelected) {
                return;
            }

            const normalizedIdentifier = identifierInput.trim();

            if (!normalizedIdentifier) {
                return;
            }

            const user = page?.props?.auth?.user;
            const avatar =
                user?.avatar ?? (page?.props?.auth as any)?.user?.avatar ?? null;
            const fullName = user
                ? [user.name, user.surname].filter(Boolean).join(' ').trim()
                : null;

            rememberAccount({
                identifier: normalizedIdentifier,
                label: normalizedIdentifier,
                avatar,
                displayName: fullName || normalizedIdentifier,
            });
        },
        [identifierInput, rememberAccount, rememberSelected],
    );

    const handleQuickAccessLogin = useCallback(() => {
        if (!savedAccount?.identifier) {
            return;
        }

        setQuickLoginPending(true);
        const quickAccessPassword =
            import.meta.env.VITE_QUICK_ACCESS_PASSWORD?.trim() || 'password';

        router.post(
            resolveUrl(store()),
            {
                email: savedAccount.identifier,
                password: quickAccessPassword,
                remember: true,
            },
            {
                onSuccess: (page) => {
                    const typedPage = page as unknown as { props?: SharedData };
                    const user = typedPage?.props?.auth?.user ?? null;
                    const avatar = user?.avatar ?? null;
                    const fullName = user
                        ? [user.name, user.surname]
                              .filter(Boolean)
                              .join(' ')
                              .trim()
                        : null;

                    rememberAccount({
                        identifier: savedAccount.identifier,
                        label: savedAccount.label,
                        lastUsedAt: new Date().toISOString(),
                        avatar,
                        displayName: fullName || savedAccount.label,
                    });
                },
                onFinish: () => setQuickLoginPending(false),
            },
        );
    }, [rememberAccount, savedAccount]);

    const handleRemoveQuickAccess = useCallback(() => {
        clearAccount();
        setQuickLoginPending(false);
        setRememberSelected(false);
    }, [clearAccount]);

    return (
        <AuthLayout
            title="Accedi al tuo account"
            description="Inserisci Email o Codice Utente e la password per accedere"
        >
            <Head title="Accedi" />

            {savedAccount && (
                <div className="mb-6 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Accesso rapido
                    </p>
                    <QuickAccessCard
                        identifier={savedAccount.identifier}
                        label={savedAccount.label}
                        displayName={savedAccount.displayName}
                        lastUsedAt={savedAccount.lastUsedAt}
                        avatar={savedAccount.avatar}
                        onLogin={handleQuickAccessLogin}
                        onRemove={handleRemoveQuickAccess}
                        disabled={quickLoginPending}
                    />
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                onSuccess={handleLoginSuccess}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    Email o Codice Utente
                                </Label>
                                <Input
                                    id="email"
                                    type="text"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    value={identifierInput}
                                    onChange={(event) =>
                                        setIdentifierInput(event.target.value)
                                    }
                                    placeholder="email@example.com oppure ABC1234"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Password dimenticata?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Password"
                                        className="pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((value) => !value)}
                                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-2 inline-flex items-center rounded-md p-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px]"
                                        aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" aria-hidden="true" />
                                        ) : (
                                            <Eye className="size-4" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={rememberSelected}
                                    onCheckedChange={(checked) =>
                                        setRememberSelected(Boolean(checked))
                                    }
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Ricordami</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Accedi
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
