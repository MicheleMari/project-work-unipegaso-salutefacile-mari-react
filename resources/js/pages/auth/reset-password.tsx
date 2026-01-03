import { update } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    return (
        <AuthLayout
            title="Reimposta password"
            description="Inserisci la nuova password qui sotto"
        >
            <Head title="Reimposta password" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                className="mt-1 block w-full"
                                readOnly
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    className="mt-1 block w-full pr-12"
                                    autoFocus
                                    placeholder="Password"
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
                                    name="password_confirmation"
                                    type={
                                        showPasswordConfirmation
                                            ? 'text'
                                            : 'password'
                                    }
                                    autoComplete="new-password"
                                    className="mt-1 block w-full pr-12"
                                placeholder="Conferma password"
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
                                className="mt-2"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-4 w-full"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner />}
                            Reimposta password
                        </Button>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
