import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function ConfirmPassword() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AuthLayout
            title="Conferma la password"
            description="Area protetta: conferma la tua password per continuare."
        >
            <Head title="Conferma password" />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    autoFocus
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

                        <div className="flex items-center">
                            <Button
                                className="w-full"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner />}
                                Conferma password
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
