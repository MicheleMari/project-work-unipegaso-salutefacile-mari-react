import { priorityOrder, type PriorityCode } from './types';

export type TriageFormSnapshot = {
    motivoAccesso: string;
    codiceFiscale: string;
    pressioneArteriosa: string;
    temperaturaCorporea: string;
    frequenzaCardiaca: string;
    saturazione: string;
};

export function suggestPriorityFromForm(form: TriageFormSnapshot) {
    let code: PriorityCode = 'verde';
    const reasons: string[] = [];
    const motivo = form.motivoAccesso.toLowerCase();

    const redKeywords = [
        'infarto',
        'stemi',
        'dolore toracico',
        'dispnea',
        'sincope',
        'incosciente',
        'emorragia',
        'ictus',
        'emiparesi',
        'afasia',
        'confusione acuta',
        'ustione estesa',
        'shock',
        'anafilassi',
        'incidente grave',
        'investimento',
        'ribaltamento',
        'politrauma',
    ];
    const amberKeywords = [
        'febbre alta',
        'trauma',
        'vomito persistente',
        'ipotensione',
        'tachicardia',
        'dolore addominale',
        'cefalea intensa',
        'convulsione',
        'parto',
        'rottura membrane',
        'politrauma',
        'frattura esposta',
        'ematemesi',
        'incidente',
        'incidente stradale',
        'tamponamento',
        'collisione',
    ];
    const mildKeywords = [
        'febbre',
        'mal di gola',
        'tosse',
        'raffreddore',
        'dolore alla schiena',
        'lombalgia',
        'mal di schiena',
        'contusione',
        'escoriazione',
        'dolore lieve',
        'nausea',
    ];

    if (containsAny(motivo, redKeywords) || (containsAny(motivo, ['incidente']) && motivo.includes('grave'))) {
        code = elevate(code, 'rosso');
        reasons.push('Motivo di accesso indica criticità/trauma grave');
    } else if (containsAny(motivo, amberKeywords)) {
        code = elevate(code, 'giallo');
        reasons.push('Motivo di accesso con potenziale rischio');
    } else if (containsAny(motivo, mildKeywords)) {
        code = elevate(code, 'verde');
        reasons.push('Sintomi lievi/moderati nel motivo di accesso');
    }

    const vitals = parseVitals(form);

    if (vitals.systolic && vitals.systolic < 90) {
        code = elevate(code, 'rosso');
        reasons.push('PA sistolica < 90');
    } else if (vitals.systolic && vitals.systolic < 100) {
        code = elevate(code, 'arancio');
        reasons.push('PA sistolica < 100');
    }

    if (vitals.heartRate && vitals.heartRate > 130) {
        code = elevate(code, 'arancio');
        reasons.push('Frequenza cardiaca > 130');
    } else if (vitals.heartRate && vitals.heartRate > 110) {
        code = elevate(code, 'giallo');
        reasons.push('Frequenza cardiaca > 110');
    }

    if (vitals.saturation && vitals.saturation < 90) {
        code = elevate(code, 'rosso');
        reasons.push('Saturazione < 90%');
    } else if (vitals.saturation && vitals.saturation < 94) {
        code = elevate(code, 'arancio');
        reasons.push('Saturazione < 94%');
    }

    if (vitals.temperature && vitals.temperature >= 39.5) {
        code = elevate(code, 'giallo');
        reasons.push('Temperatura ≥ 39.5°C');
    }

    const cfInfo = decodeCfLight(form.codiceFiscale);
    if (cfInfo?.age && cfInfo.age >= 75 && priorityOrder(code) > priorityOrder('arancio')) {
        code = 'arancio';
        reasons.push('Età > 75 anni: prudenza');
    }

    if (reasons.length === 0) {
        reasons.push('Dati limitati: impostato verde di default');
    }

    return {
        code,
        reason: reasons.join('; '),
    };
}

export function buildVitalSignsPayload(form: TriageFormSnapshot) {
    const bp = form.pressioneArteriosa.trim();
    const payload: Record<string, string | null> = {
        blood_pressure: bp || null,
        body_temperature: form.temperaturaCorporea.trim() || null,
        heart_rate: form.frequenzaCardiaca.trim() || null,
        oxygen_saturation: form.saturazione.trim() || null,
    };
    return payload;
}

function elevate(current: PriorityCode, target: PriorityCode) {
    return priorityOrder(target) < priorityOrder(current) ? target : current;
}

function containsAny(text: string, keywords: string[]) {
    return keywords.some((k) => text.includes(k));
}

function parseVitals(form: TriageFormSnapshot) {
    const bpMatch = form.pressioneArteriosa.match(/(\d{2,3})\D+(\d{2,3})/);
    const systolic = bpMatch ? Number.parseInt(bpMatch[1], 10) : undefined;
    const diastolic = bpMatch ? Number.parseInt(bpMatch[2], 10) : undefined;

    const temperature = form.temperaturaCorporea
        ? Number.parseFloat(form.temperaturaCorporea.replace(',', '.'))
        : undefined;
    const heartRate = form.frequenzaCardiaca ? Number.parseInt(form.frequenzaCardiaca, 10) : undefined;
    const saturation = form.saturazione ? Number.parseInt(form.saturazione, 10) : undefined;

    return { systolic, diastolic, temperature, heartRate, saturation };
}

function decodeCfLight(cf: string) {
    const cleaned = cf.trim().toUpperCase();
    if (cleaned.length < 11) return null;

    const yearPart = cleaned.slice(6, 8);
    const monthLetter = cleaned.charAt(8);
    const dayPart = cleaned.slice(9, 11);

    const months: Record<string, number> = {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
        E: 5,
        H: 6,
        L: 7,
        M: 8,
        P: 9,
        R: 10,
        S: 11,
        T: 12,
    };

    const yearNum = Number.parseInt(yearPart, 10);
    const monthNum = months[monthLetter];
    const dayNumRaw = Number.parseInt(dayPart, 10);

    if (!Number.isFinite(yearNum) || !monthNum || !Number.isFinite(dayNumRaw)) return null;

    const isFemale = dayNumRaw > 40;
    const day = isFemale ? dayNumRaw - 40 : dayNumRaw;

    const currentYear = new Date().getFullYear();
    const century = yearNum + 1900 > currentYear ? 1900 : 2000;
    const year = century + yearNum;

    const birthDate = new Date(Date.UTC(year, monthNum - 1, day));
    const today = new Date();
    let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
    const m = today.getUTCMonth() - birthDate.getUTCMonth();
    if (m < 0 || (m === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
        age -= 1;
    }

    return {
        age,
        gender: isFemale ? 'F' : 'M',
    };
}
