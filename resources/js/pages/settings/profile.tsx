import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    type ChangeEvent,
    type DragEvent,
    useEffect,
    useRef,
    useState,
} from 'react';

import AvatarCropDialog from '@/components/avatar-crop-dialog';
import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useInitials } from '@/hooks/use-initials';
import { edit } from '@/routes/profile';
import { Trash } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Impostazioni profilo',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        auth.user.avatar ?? null,
    );
    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
        null,
    );
    const [cropState, setCropState] = useState<{
        file: File | null;
        url: string | null;
    }>({
        file: null,
        url: null,
    });
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const getInitials = useInitials();

    const revokeObjectUrl = (url?: string | null) => {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    };

    useEffect(() => {
        return () => {
            revokeObjectUrl(avatarPreview);
        };
    }, [avatarPreview]);

    useEffect(() => {
        updateFileInput(selectedAvatarFile);
    }, [selectedAvatarFile]);

    useEffect(() => {
        return () => {
            revokeObjectUrl(cropState.url);
        };
    }, [cropState.url]);

    const updateFileInput = (file: File | null) => {
        if (!fileInputRef.current) return;

        const dataTransfer = new DataTransfer();

        if (file) {
            dataTransfer.items.add(file);
        }

        fileInputRef.current.files = dataTransfer.files;

        if (!file) {
            fileInputRef.current.value = '';
        }
    };

    const startCrop = (file: File) => {
        const objectUrl = URL.createObjectURL(file);

        setCropState((current) => {
            revokeObjectUrl(current.url);
            return { file, url: objectUrl };
        });
        setIsCropOpen(true);
    };

    const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            updateFileInput(selectedAvatarFile);
            return;
        }

        setRemoveAvatar(false);
        startCrop(file);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];

        if (!file) {
            return;
        }

        setRemoveAvatar(false);
        startCrop(file);
    };

    const handleRemoveAvatar = () => {
        revokeObjectUrl(avatarPreview);
        revokeObjectUrl(cropState.url);

        setIsCropOpen(false);
        setSelectedAvatarFile(null);
        updateFileInput(null);
        setAvatarPreview(null);
        setRemoveAvatar(true);
        setCropState({ file: null, url: null });
    };

    const handleCropClose = () => {
        revokeObjectUrl(cropState.url);
        setCropState({ file: null, url: null });
        setIsCropOpen(false);
        updateFileInput(selectedAvatarFile);
    };

    const handleCropComplete = (file: File, dataUrl: string) => {
        setSelectedAvatarFile(file);
        updateFileInput(file);
        setAvatarPreview((current) => {
            revokeObjectUrl(current);
            return dataUrl;
        });
        setRemoveAvatar(false);
        revokeObjectUrl(cropState.url);
        setCropState({ file: null, url: null });
        setIsCropOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Impostazioni profilo" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Informazioni profilo"
                        description="Aggiorna nome e indirizzo email"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        encType="multipart/form-data"
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="remove_avatar"
                                    value={removeAvatar ? '1' : '0'}
                                />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nome</Label>

                                        <Input
                                            id="name"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="given-name"
                                            placeholder="Nome"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="surname">Cognome</Label>

                                        <Input
                                            id="surname"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.surname}
                                            name="surname"
                                            required
                                            autoComplete="family-name"
                                            placeholder="Cognome"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.surname}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Indirizzo email</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="email@example.com"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Ruolo</Label>
                                    <Input
                                        value={
                                            auth.user.permission?.name ??
                                            'Ruolo non assegnato'
                                        }
                                        disabled
                                        readOnly
                                        className="bg-muted text-muted-foreground"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="avatar">Foto profilo</Label>

                                    <div className="flex flex-wrap items-start gap-4">
                                        <div className="relative">
                                            <Avatar className="size-20">
                                                <AvatarImage
                                                    key={
                                                        avatarPreview ??
                                                        auth.user.avatar ??
                                                        'avatar-fallback'
                                                    }
                                                    className="object-cover"
                                                    src={avatarPreview ?? undefined}
                                                    alt={auth.user.name}
                                                />
                                                <AvatarFallback>
                                                    {getInitials(auth.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {(avatarPreview ||
                                                (auth.user.avatar &&
                                                    !removeAvatar)) && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveAvatar}
                                                    className="absolute -right-2 -top-2 inline-flex size-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                    aria-label="Rimuovi foto profilo"
                                                >
                                                    <Trash
                                                        className="h-4 w-4 text-white"
                                                        strokeWidth={2.2}
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                            )}
                                        </div>

                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDrop={handleDrop}
                                            className="flex min-h-28 w-full max-w-xl cursor-pointer items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 px-4 py-6 text-center transition hover:border-foreground/60 hover:bg-muted"
                                        >
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-foreground">
                                                    Trascina qui una foto o clicca per caricarla
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    PNG, JPG, JPEG, SVG o WEBP fino a 10 MB.
                                                </p>
                                                <Input
                                                    id="avatar"
                                                    ref={fileInputRef}
                                                    name="avatar"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleAvatarChange}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <InputError
                                        className="mt-2"
                                        message={errors.avatar}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Il tuo indirizzo email non è
                                                verificato.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Clicca qui per inviare di
                                                    nuovo l'email di verifica.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    Un nuovo link di verifica è
                                                    stato inviato alla tua
                                                    email.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Salva
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Salvato
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />

                <AvatarCropDialog
                    open={isCropOpen}
                    file={cropState.file}
                    imageUrl={cropState.url}
                    onClose={handleCropClose}
                    onComplete={handleCropComplete}
                />
            </SettingsLayout>
        </AppLayout>
    );
}
