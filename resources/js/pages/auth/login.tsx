import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { refreshCsrfCookie } from '@/lib/csrf';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { type FormComponentSlotProps } from '@inertiajs/core';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { type FormEvent, useRef, useState } from 'react';

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
    const [showPassword, setShowPassword] = useState(false);
    const formRef = useRef<FormComponentSlotProps | null>(null);

    const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();
        await refreshCsrfCookie();
        formRef.current?.submit();
    };

    return (
        <AuthLayout
            title="Accedi al tuo account"
            description="Inserisci Email o Codice Utente e la password per accedere"
        >
            <Head title="Accedi" />

            <Form
                {...store.form()}
                className="flex flex-col gap-6"
                ref={formRef}
                onSubmitCapture={handleLoginSubmit}
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
