import axios, { type AxiosRequestConfig } from 'axios';
import { ensureCsrfCookie, getXsrfCookie, refreshCsrfCookie } from './csrf';

type JsonBody = Record<string, unknown> | null | undefined;

const defaultHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
};

const parseErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const payload = error.response?.data as { message?: unknown } | undefined;
        if (payload && typeof payload.message === 'string') {
            return payload.message;
        }
        if (error.response) {
            return `Richiesta fallita (${error.response.status})`;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'Richiesta fallita';
};

const requestOnce = async <T>(endpoint: string, options: AxiosRequestConfig = {}) => {
    if (!getXsrfCookie()) {
        await ensureCsrfCookie();
    }

    return axios.request<T>({
        ...options,
        url: endpoint,
        method: options.method ?? 'get',
        headers: {
            ...defaultHeaders,
            ...(options.headers || {}),
        },
    });
};

export async function apiRequest<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
    try {
        const response = await requestOnce<T>(endpoint, options);
        if (response.status === 204) {
            return undefined as T;
        }
        return response.data as T;
    } catch (error) {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status === 419) {
            await refreshCsrfCookie();
            const response = await requestOnce<T>(endpoint, options);
            if (response.status === 204) {
                return undefined as T;
            }
            return response.data as T;
        }

        throw new Error(parseErrorMessage(error));
    }
}

export const postJson = <T>(endpoint: string, body: JsonBody) =>
    apiRequest<T>(endpoint, {
        method: 'post',
        data: body ?? undefined,
    });

export const putJson = <T>(endpoint: string, body: JsonBody) =>
    apiRequest<T>(endpoint, {
        method: 'put',
        data: body ?? undefined,
    });

export const patchJson = <T>(endpoint: string, body: JsonBody) =>
    apiRequest<T>(endpoint, {
        method: 'patch',
        data: body ?? undefined,
    });
