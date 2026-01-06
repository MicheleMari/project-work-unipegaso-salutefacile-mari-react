type JsonBody = Record<string, unknown> | null | undefined;

const defaultHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
};

let csrfInitialized = false;

const getCsrfToken = (): string | undefined => {
    if (typeof document === 'undefined') {
        return undefined;
    }

    const meta = document.querySelector('meta[name="csrf-token"]');
    const token = meta?.getAttribute('content')?.trim();

    return token || undefined;
};

const getXsrfCookie = (): string | undefined => {
    if (typeof document === 'undefined') {
        return undefined;
    }

    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : undefined;
};

const ensureCsrfCookie = async () => {
    if (csrfInitialized) return;
    // Try to prime Sanctum cookie once before the first protected call
    csrfInitialized = true;
    await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' }).catch(() => null);
};

const parseErrorMessage = async (response: Response): Promise<string> => {
    try {
        const payload = await response.json();
        if (typeof payload?.message === 'string') {
            return payload.message;
        }
    } catch {
        // no-op
    }

    return `Richiesta fallita (${response.status})`;
};

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const doFetch = async (): Promise<Response> => {
        if (!getXsrfCookie()) {
            await ensureCsrfCookie();
        }

        const csrfToken = getCsrfToken();
        const xsrfCookie = getXsrfCookie();

        return fetch(endpoint, {
            credentials: 'same-origin',
            ...options,
            headers: {
                ...defaultHeaders,
                ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                ...(xsrfCookie ? { 'X-XSRF-TOKEN': xsrfCookie } : {}),
                ...(options.headers || {}),
            },
        });
    };

    let response = await doFetch();

    // Se la sessione ha perso il token, prova a rigenerarlo e ripeti una volta
    if (response.status === 419) {
        csrfInitialized = false;
        await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' }).catch(() => null);
        response = await doFetch();
    }

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

export const postJson = <T>(endpoint: string, body: JsonBody) =>
    apiRequest<T>(endpoint, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
    });

export const putJson = <T>(endpoint: string, body: JsonBody) =>
    apiRequest<T>(endpoint, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
    });

export const patchJson = <T>(endpoint: string, body: JsonBody) =>
    apiRequest<T>(endpoint, {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
    });
