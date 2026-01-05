<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TriageAnalyzeController extends Controller
{
    /**
     * Analizza i sintomi e restituisce un suggerimento di triage.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'symptoms' => ['required', 'string', 'min:6'],
        ]);

        $symptoms = mb_strtolower($data['symptoms']);

        $severity = $this->guessSeverity($symptoms);
        $specialist = $this->guessSpecialist($symptoms);

        $summary = 'Valutazione preliminare automatizzata in base ai sintomi descritti.';
        $recommendations = $this->buildRecommendations($severity, $specialist);

        return response()->json([
            'severity' => $severity,
            'specialist' => $specialist,
            'summary' => $summary,
            'recommendations' => $recommendations,
        ]);
    }

    private function guessSeverity(string $symptoms): string
    {
        $isRed = $this->hasKeyword($symptoms, [
            'dolore toracico',
            'dispnea',
            'sincope',
            'trauma cranico',
            'emorragia',
            'incosciente',
        ]);

        if ($isRed) {
            return 'rosso';
        }

        $isYellow = $this->hasKeyword($symptoms, [
            'febbre alta',
            'dolore addominale',
            'frattura',
            'vomito persistente',
            'ipotensione',
            'tachicardia',
        ]);

        if ($isYellow) {
            return 'giallo';
        }

        return 'verde';
    }

    private function guessSpecialist(string $symptoms): string
    {
        if ($this->hasKeyword($symptoms, ['torace', 'cardiaco', 'dispnea', 'dolore toracico'])) {
            return 'Cardiologia';
        }

        if ($this->hasKeyword($symptoms, ['trauma', 'frattura', 'osso', 'distorsione'])) {
            return 'Ortopedia';
        }

        if ($this->hasKeyword($symptoms, ['addome', 'addominale', 'nausea', 'vomito'])) {
            return 'Chirurgia Generale';
        }

        if ($this->hasKeyword($symptoms, ['febbre', 'tosse', 'mal di gola', 'influenza'])) {
            return 'Medicina Interna';
        }

        return 'Valutazione medica';
    }

    private function buildRecommendations(string $severity, string $specialist): array
    {
        $common = [
            'Monitorare parametri vitali e saturazione.',
            'Informare il medico di guardia per conferma triage.',
        ];

        if ($severity === 'rosso') {
            return array_merge([
                'Allertare immediatamente la Shock Room.',
                'Avvisare lo specialista di riferimento per valutazione urgente.',
            ], $common);
        }

        if ($severity === 'giallo') {
            return array_merge([
                'Avviare monitoraggio continuo e triage secondario.',
                "Consultare {$specialist} per approfondimento clinico.",
            ], $common);
        }

        return array_merge([
            'Instradare in area verde con osservazione periodica.',
            "Considerare consulenza {$specialist} se i sintomi persistono.",
        ], $common);
    }

    private function hasKeyword(string $haystack, array $keywords): bool
    {
        foreach ($keywords as $keyword) {
            if (str_contains($haystack, $keyword)) {
                return true;
            }
        }

        return false;
    }
}
