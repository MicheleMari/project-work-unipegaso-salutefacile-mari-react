import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import codiciCatastali from '@/data/codici_catastali.json';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

type CadastralCode = {
    codice: string;
    comune: string;
    provincia: string;
};

type FiscalCodeToolProps = {
    trigger: ReactNode;
    defaults?: {
        nome?: string;
        cognome?: string;
    };
    onFiscalCodeComputed: (codiceFiscale: string) => void;
};

export function FiscalCodeTool({ trigger, defaults, onFiscalCodeComputed }: FiscalCodeToolProps) {
    const [open, setOpen] = useState(false);
    const [nome, setNome] = useState(defaults?.nome ?? '');
    const [cognome, setCognome] = useState(defaults?.cognome ?? '');
    const [dataNascita, setDataNascita] = useState('');
    const [sesso, setSesso] = useState<'M' | 'F'>('M');
    const [comuneQuery, setComuneQuery] = useState('');
    const [selectedComune, setSelectedComune] = useState<CadastralCode | null>(null);
    const [error, setError] = useState<string | null>(null);

    const cadastralList = useMemo(() => codiciCatastali as CadastralCode[], []);
    const codiceComuneMap = useMemo(
        () => new Map(cadastralList.map((item) => [item.codice.toUpperCase(), item])),
        [cadastralList],
    );

    const resetForm = () => {
        setNome(defaults?.nome ?? '');
        setCognome(defaults?.cognome ?? '');
        setDataNascita('');
        setSesso('M');
        setComuneQuery('');
        setSelectedComune(null);
        setError(null);
    };

    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open, defaults?.nome, defaults?.cognome]);

    const filteredComuni = useMemo(() => {
        return filterComuni(cadastralList, comuneQuery);
    }, [cadastralList, comuneQuery]);

    const resolvedComuneCode = useMemo(() => {
        const term = comuneQuery.trim().toUpperCase();
        if (selectedComune) return selectedComune.codice;
        if (term.length === 4 && codiceComuneMap.has(term)) return term;
        return null;
    }, [comuneQuery, selectedComune, codiceComuneMap]);

    const handleCalcola = () => {
        const codiceFiscale = calcolaCodiceFiscale({
            nome,
            cognome,
            sesso,
            dataNascita,
            codiceComune: resolvedComuneCode,
        });

        if (!codiceFiscale) {
            setError('Compila correttamente tutti i campi per calcolare il codice fiscale.');
            return;
        }

        setError(null);
        onFiscalCodeComputed(codiceFiscale);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Calcola codice fiscale</DialogTitle>
                    <DialogDescription>
                        Inserisci i dati anagrafici: calcoleremo il codice fiscale e lo inseriremo
                        automaticamente nel modulo di triage.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-1.5">
                        <Label htmlFor="cf-tool-nome">Nome</Label>
                        <Input
                            id="cf-tool-nome"
                            value={nome}
                            onChange={(event) => setNome(event.target.value)}
                            autoComplete="given-name"
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="cf-tool-cognome">Cognome</Label>
                        <Input
                            id="cf-tool-cognome"
                            value={cognome}
                            onChange={(event) => setCognome(event.target.value)}
                            autoComplete="family-name"
                        />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="cf-tool-data">Data di nascita</Label>
                            <Input
                                id="cf-tool-data"
                                type="date"
                                value={dataNascita}
                                onChange={(event) => setDataNascita(event.target.value)}
                            />
                        </div>
                        <GenderToggle value={sesso} onChange={setSesso} />
                    </div>

                    <ComuneSelector
                        query={comuneQuery}
                        onQueryChange={(value) => {
                            setComuneQuery(value);
                            setSelectedComune(null);
                        }}
                        comuni={filteredComuni}
                        onSelect={(comune) => {
                            setSelectedComune(comune);
                            setComuneQuery(`${comune.comune} (${comune.provincia})`);
                        }}
                    />

                    {resolvedComuneCode ? (
                        <p className="text-xs text-muted-foreground">
                            Codice catastale selezionato: {resolvedComuneCode}
                        </p>
                    ) : null}

                    {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
                </div>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Annulla
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={handleCalcola}>
                        Calcola e inserisci
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function GenderToggle({
    value,
    onChange,
}: {
    value: 'M' | 'F';
    onChange: (value: 'M' | 'F') => void;
}) {
    return (
        <div className="grid gap-1.5">
            <Label>Sesso</Label>
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant={value === 'M' ? 'default' : 'outline'}
                    onClick={() => onChange('M')}
                    className="flex-1"
                >
                    Uomo
                </Button>
                <Button
                    type="button"
                    variant={value === 'F' ? 'default' : 'outline'}
                    onClick={() => onChange('F')}
                    className="flex-1"
                >
                    Donna
                </Button>
            </div>
        </div>
    );
}

function ComuneSelector({
    query,
    onQueryChange,
    comuni,
    onSelect,
}: {
    query: string;
    onQueryChange: (value: string) => void;
    comuni: CadastralCode[];
    onSelect: (comune: CadastralCode) => void;
}) {
    return (
        <div className="grid gap-1.5">
            <Label htmlFor="cf-tool-comune">Comune di nascita</Label>
            <Input
                id="cf-tool-comune"
                placeholder="Cerca comune o inserisci codice catastale"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
            />
            <div className="rounded-md border bg-muted/30">
                {comuni.map((item) => (
                    <button
                        key={item.codice}
                        type="button"
                        onClick={() => onSelect(item)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                        <span className="font-medium">{item.comune}</span>
                        <span className="text-xs text-muted-foreground">
                            {item.provincia} · {item.codice}
                        </span>
                    </button>
                ))}
                {!comuni.length ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">Nessun comune trovato</p>
                ) : null}
            </div>
        </div>
    );
}

function filterComuni(cadastralList: CadastralCode[], comuneQuery: string) {
    const term = comuneQuery.trim().toUpperCase();
    if (!term) {
        return cadastralList.slice(0, 6);
    }

    return cadastralList
        .filter(
            (item) =>
                item.comune.toUpperCase().includes(term) ||
                item.codice.toUpperCase() === term ||
                `${item.comune.toUpperCase()} (${item.provincia.toUpperCase()})`.includes(term),
        )
        .slice(0, 8);
}

function calcolaCodiceFiscale({
    nome,
    cognome,
    sesso,
    dataNascita,
    codiceComune,
}: {
    nome: string;
    cognome: string;
    sesso: 'M' | 'F';
    dataNascita: string;
    codiceComune: string | null;
}) {
    const cleanedNome = nome.trim().toUpperCase();
    const cleanedCognome = cognome.trim().toUpperCase();
    if (!cleanedNome || !cleanedCognome || !dataNascita || !codiceComune) return null;

    const birthParts = dataNascita.split('-').map((part) => Number.parseInt(part, 10));
    if (birthParts.length !== 3 || birthParts.some((part) => Number.isNaN(part))) return null;
    const [year, month, day] = birthParts;

    const cognomeCode = buildNameCode(cleanedCognome, false);
    const nomeCode = buildNameCode(cleanedNome, true);
    const yearCode = year.toString().slice(-2).padStart(2, '0');
    const monthCode = 'ABCDEHLMPRST'.charAt(month - 1);
    if (!monthCode) return null;
    const dayCode = (day + (sesso === 'F' ? 40 : 0)).toString().padStart(2, '0');

    const partial = `${cognomeCode}${nomeCode}${yearCode}${monthCode}${dayCode}${codiceComune}`;
    const control = buildControlChar(partial);
    return `${partial}${control}`;
}

function buildNameCode(value: string, isNome: boolean) {
    const consonants = (value.match(/[BCDFGHJKLMNPQRSTVWXYZ]/g) ?? []).join('');
    const vowels = (value.match(/[AEIOU]/g) ?? []).join('');

    let base = consonants;
    if (isNome && consonants.length >= 4) {
        base = consonants[0] + consonants[2] + consonants[3];
    }

    const code = (base + vowels + 'XXX').slice(0, 3);
    return code;
}

function buildControlChar(partial: string) {
    const oddValues: Record<string, number> = {
        0: 1,
        1: 0,
        2: 5,
        3: 7,
        4: 9,
        5: 13,
        6: 15,
        7: 17,
        8: 19,
        9: 21,
        A: 1,
        B: 0,
        C: 5,
        D: 7,
        E: 9,
        F: 13,
        G: 15,
        H: 17,
        I: 19,
        J: 21,
        K: 2,
        L: 4,
        M: 18,
        N: 20,
        O: 11,
        P: 3,
        Q: 6,
        R: 8,
        S: 12,
        T: 14,
        U: 16,
        V: 10,
        W: 22,
        X: 25,
        Y: 24,
        Z: 23,
    };

    const evenValues: Record<string, number> = {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        A: 0,
        B: 1,
        C: 2,
        D: 3,
        E: 4,
        F: 5,
        G: 6,
        H: 7,
        I: 8,
        J: 9,
        K: 10,
        L: 11,
        M: 12,
        N: 13,
        O: 14,
        P: 15,
        Q: 16,
        R: 17,
        S: 18,
        T: 19,
        U: 20,
        V: 21,
        W: 22,
        X: 23,
        Y: 24,
        Z: 25,
    };

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const total = partial.split('').reduce((sum, char, index) => {
        const table = (index + 1) % 2 === 0 ? evenValues : oddValues;
        return sum + (table[char] ?? 0);
    }, 0);

    return alphabet.charAt(total % 26);
}
