import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    return (
        <AuthLayout
            title="Crea un account"
            description="Inserisci i tuoi dati per creare un account"
        >
            <Head title="Registrati" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nome e cognome"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Indirizzo email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Password"
                                        className="pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((value) => !value)
                                        }
                                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-2 inline-flex items-center rounded-md p-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px]"
                                        aria-label={
                                            showPassword
                                                ? 'Nascondi password'
                                                : 'Mostra password'
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <Eye
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Conferma password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={
                                            showPasswordConfirmation
                                                ? 'text'
                                                : 'password'
                                        }
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Conferma password"
                                        className="pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswordConfirmation(
                                                (value) => !value,
                                            )
                                        }
                                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-2 inline-flex items-center rounded-md p-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px]"
                                        aria-label={
                                            showPasswordConfirmation
                                                ? 'Nascondi password'
                                                : 'Mostra password'
                                        }
                                    >
                                        {showPasswordConfirmation ? (
                                            <EyeOff
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <Eye
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Crea account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Hai già un account?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
