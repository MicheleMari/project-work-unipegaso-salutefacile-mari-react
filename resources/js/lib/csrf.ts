let csrfInitialized = false;

export const getCsrfToken = (): string | undefined => {
    if (typeof document === 'undefined') {
        return undefined;
    }

    const meta = document.querySelector('meta[name="csrf-token"]');
    const token = meta?.getAttribute('content')?.trim();

    return token || undefined;
};

export const getXsrfCookie = (): string | undefined => {
    if (typeof document === 'undefined') {
        return undefined;
    }

    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : undefined;
};

export const ensureCsrfCookie = async () => {
    if (csrfInitialized) return;
    // Prime Sanctum cookie once before the first protected call.
    csrfInitialized = true;
    await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' }).catch(() => null);
};

export const refreshCsrfCookie = async () => {
    csrfInitialized = false;
    await ensureCsrfCookie();
};
