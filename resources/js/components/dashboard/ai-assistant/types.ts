import type { LucideIcon } from 'lucide-react';

export type PromptTemplate = {
    title: string;
    description: string;
    prompt: string;
    icon: LucideIcon;
};

export type QuickAction = PromptTemplate;
export type ClinicalService = PromptTemplate;

export type ApiTriageAnalysis = {
    severity?: string | null;
    specialist?: string | null;
    summary?: string | null;
    recommendations?: string[] | null;
};
