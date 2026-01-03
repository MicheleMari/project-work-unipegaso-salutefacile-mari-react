import { useCallback, useEffect, useState } from 'react';

export type QuickAccessAccount = {
    identifier: string;
    label?: string;
    lastUsedAt?: string;
    avatar?: string | null;
    displayName?: string | null;
};

const STORAGE_KEY = 'quick-access-account';

const parseAccount = (raw: string | null): QuickAccessAccount | null => {
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as QuickAccessAccount & {
            email?: string;
        };

        const identifier = parsed.identifier || parsed.email;

        if (!identifier) {
            return null;
        }

        return {
            ...parsed,
            identifier,
            avatar: parsed.avatar ?? null,
            displayName: parsed.displayName ?? null,
        };
    } catch (error) {
        console.error('Unable to parse quick access account', error);
        return null;
    }
};

const readAccountFromStorage = (): QuickAccessAccount | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    return parseAccount(window.localStorage.getItem(STORAGE_KEY));
};

export const getInitialQuickAccessAccount = () => readAccountFromStorage();

export function useQuickAccessAccount() {
    const [account, setAccount] = useState<QuickAccessAccount | null>(() =>
        readAccountFromStorage(),
    );

    useEffect(() => {
        setAccount(readAccountFromStorage());
    }, []);

    const persistAccount = useCallback(
        (value: QuickAccessAccount | null) => {
            setAccount(value);

            if (typeof window === 'undefined') {
                return;
            }

            if (value) {
                const payload: QuickAccessAccount = {
                    ...value,
                    lastUsedAt: value.lastUsedAt ?? new Date().toISOString(),
                };

                window.localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(payload),
                );
            } else {
                window.localStorage.removeItem(STORAGE_KEY);
            }
        },
        [],
    );

    const rememberAccount = useCallback(
        (value: QuickAccessAccount) => persistAccount(value),
        [persistAccount],
    );

    const clearAccount = useCallback(
        () => persistAccount(null),
        [persistAccount],
    );

    return {
        account,
        rememberAccount,
        clearAccount,
        hasAccount: Boolean(account),
    } as const;
}
