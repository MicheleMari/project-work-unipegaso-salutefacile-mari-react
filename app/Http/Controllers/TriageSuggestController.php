<?php

namespace App\Http\Controllers;

use App\Models\Emergency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TriageSuggestController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'motivo_accesso' => ['required', 'string', 'min:3'],
            'codice_fiscale' => ['nullable', 'string'],
            'vital_signs' => ['nullable', 'array'],
        ]);

        $motivo = mb_strtolower($data['motivo_accesso']);
        $vitalSigns = $data['vital_signs'] ?? [];
        $cf = $data['codice_fiscale'] ?? '';

        $rule = $this->suggestByRules($motivo, $cf, $vitalSigns);
        $history = $this->suggestByHistory($motivo);

        $finalCode = $this->pickHigherPriority($rule['code'], $history['code'] ?? null);
        $reasons = array_filter([
            $rule['reason'],
            $history['reason'] ?? null,
        ]);

        return response()->json([
            'code' => $finalCode,
            'rule_based' => $rule,
            'history_based' => $history,
            'reason' => implode(' | ', $reasons),
        ]);
    }

    private function suggestByRules(string $motivo, string $cf, array $vitalSigns): array
    {
        $code = 'verde';
        $reasons = [];

        $redKeywords = [
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
        $amberKeywords = [
            'febbre alta',
            'trauma',
            'vomito persistente',
            'ipotensione',
            'tachicardia',
            'dolore addominale',
            'cefalea intensa',
            'convulsione',
            'parto',
            'rottura membranes',
            'politrauma',
            'frattura esposta',
            'ematemesi',
            'incidente',
            'incidente stradale',
            'tamponamento',
            'collisione',
        ];
        $mildKeywords = [
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

        if ($this->containsAny($motivo, $redKeywords) || ($this->containsAny($motivo, ['incidente']) && str_contains($motivo, 'grave'))) {
            $code = $this->elevate($code, 'rosso');
            $reasons[] = 'Motivo di accesso indica criticità/trauma grave';
        } elseif ($this->containsAny($motivo, $amberKeywords)) {
            $code = $this->elevate($code, 'giallo');
            $reasons[] = 'Motivo di accesso con potenziale rischio';
        } elseif ($this->containsAny($motivo, $mildKeywords)) {
            $code = $this->elevate($code, 'verde');
            $reasons[] = 'Sintomi lievi/moderati nel motivo di accesso';
        }

        $vitals = $this->parseVitals($vitalSigns);

        if ($vitals['systolic'] !== null && $vitals['systolic'] < 90) {
            $code = $this->elevate($code, 'rosso');
            $reasons[] = 'PA sistolica < 90';
        } elseif ($vitals['systolic'] !== null && $vitals['systolic'] < 100) {
            $code = $this->elevate($code, 'arancio');
            $reasons[] = 'PA sistolica < 100';
        }

        if ($vitals['heartRate'] !== null && $vitals['heartRate'] > 130) {
            $code = $this->elevate($code, 'arancio');
            $reasons[] = 'Frequenza cardiaca > 130';
        } elseif ($vitals['heartRate'] !== null && $vitals['heartRate'] > 110) {
            $code = $this->elevate($code, 'giallo');
            $reasons[] = 'Frequenza cardiaca > 110';
        }

        if ($vitals['saturation'] !== null && $vitals['saturation'] < 90) {
            $code = $this->elevate($code, 'rosso');
            $reasons[] = 'Saturazione < 90%';
        } elseif ($vitals['saturation'] !== null && $vitals['saturation'] < 94) {
            $code = $this->elevate($code, 'arancio');
            $reasons[] = 'Saturazione < 94%';
        }

        if ($vitals['temperature'] !== null && $vitals['temperature'] >= 39.5) {
            $code = $this->elevate($code, 'giallo');
            $reasons[] = 'Temperatura ≥ 39.5°C';
        }

        $cfInfo = $this->decodeCfLight($cf);
        if ($cfInfo !== null && $cfInfo['age'] >= 75 && $this->priorityOrder($code) > $this->priorityOrder('arancio')) {
            $code = 'arancio';
            $reasons[] = 'Età > 75 anni: prudenza';
        }

        if (empty($reasons)) {
            $reasons[] = 'Dati limitati: impostato verde di default';
        }

        return [
            'code' => $code,
            'reason' => implode('; ', $reasons),
        ];
    }

    private function suggestByHistory(string $motivo): array
    {
        $tokens = $this->extractTokens($motivo);
        if (empty($tokens)) {
            return [
                'code' => null,
                'reason' => null,
                'matches' => 0,
            ];
        }

        $recent = Emergency::query()
            ->select(['alert_code', 'description'])
            ->whereNotNull('alert_code')
            ->whereNotNull('description')
            ->orderByDesc('created_at')
            ->limit(120)
            ->get();

        $matches = $recent->filter(function ($emergency) use ($tokens) {
            $desc = mb_strtolower((string) $emergency->description);
            $hits = 0;
            foreach ($tokens as $token) {
                if (str_contains($desc, $token)) {
                    $hits++;
                    if ($hits >= 2) {
                        return true;
                    }
                }
            }
            return false;
        });

        if ($matches->count() < 3) {
            return [
                'code' => null,
                'reason' => null,
                'matches' => $matches->count(),
            ];
        }

        $counts = [];
        foreach ($matches as $match) {
            $code = $match->alert_code;
            if (!$code) {
                continue;
            }
            $counts[$code] = ($counts[$code] ?? 0) + 1;
        }

        if (empty($counts)) {
            return [
                'code' => null,
                'reason' => 'Emergenze simili senza codice registrato',
                'matches' => $matches->count(),
            ];
        }

        $mostFrequent = null;
        $maxCount = 0;
        foreach ($counts as $code => $count) {
            if ($count > $maxCount || ($count === $maxCount && $this->priorityOrder($code) < $this->priorityOrder($mostFrequent))) {
                $mostFrequent = $code;
                $maxCount = $count;
            }
        }

        $highestSeverity = array_reduce(array_keys($counts), function ($carry, $code) {
            if ($carry === null) {
                return $code;
            }
            return $this->priorityOrder($code) < $this->priorityOrder($carry) ? $code : $carry;
        }, null);

        $historyCode = $this->pickHigherPriority($mostFrequent, $highestSeverity);
        $reason = "Casi simili recenti suggeriscono {$historyCode}";

        return [
            'code' => $historyCode,
            'reason' => $reason,
            'matches' => $matches->count(),
        ];
    }

    private function pickHigherPriority(?string $a, ?string $b): ?string
    {
        if (!$a && !$b) return null;
        if ($a && !$b) return $a;
        if ($b && !$a) return $b;

        return $this->priorityOrder($a) <= $this->priorityOrder($b) ? $a : $b;
    }

    private function priorityOrder(?string $code): int
    {
        $normalized = strtolower($code ?? '');
        return match ($normalized) {
            'rosso' => 1,
            'arancio', 'arancione' => 2,
            'giallo' => 3,
            'verde' => 4,
            'bianco' => 5,
            default => 6,
        };
    }

    private function elevate(string $current, string $target): string
    {
        return $this->priorityOrder($target) < $this->priorityOrder($current) ? $target : $current;
    }

    private function containsAny(string $text, array $keywords): bool
    {
        foreach ($keywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return true;
            }
        }
        return false;
    }

    private function parseVitals(array $vitalSigns): array
    {
        $bp = $vitalSigns['blood_pressure'] ?? null;
        $systolic = null;
        $diastolic = null;
        if (is_string($bp)) {
            if (preg_match('/(\\d{2,3})\\D+(\\d{2,3})/', $bp, $matches)) {
                $systolic = (int) $matches[1];
                $diastolic = (int) $matches[2];
            }
        }

        $temperature = isset($vitalSigns['body_temperature'])
            ? (float) str_replace(',', '.', $vitalSigns['body_temperature'])
            : null;
        $heartRate = isset($vitalSigns['heart_rate']) ? (int) $vitalSigns['heart_rate'] : null;
        $saturation = isset($vitalSigns['oxygen_saturation']) ? (int) $vitalSigns['oxygen_saturation'] : null;

        return [
            'systolic' => $systolic,
            'diastolic' => $diastolic,
            'temperature' => $temperature,
            'heartRate' => $heartRate,
            'saturation' => $saturation,
        ];
    }

    private function decodeCfLight(string $cf): ?array
    {
        $cleaned = strtoupper(trim($cf));
        if (strlen($cleaned) < 11) return null;

        $yearPart = substr($cleaned, 6, 2);
        $monthLetter = substr($cleaned, 8, 1);
        $dayPart = substr($cleaned, 9, 2);

        $months = [
            'A' => 1,
            'B' => 2,
            'C' => 3,
            'D' => 4,
            'E' => 5,
            'H' => 6,
            'L' => 7,
            'M' => 8,
            'P' => 9,
            'R' => 10,
            'S' => 11,
            'T' => 12,
        ];

        $yearNum = (int) $yearPart;
        $monthNum = $months[$monthLetter] ?? null;
        $dayNumRaw = (int) $dayPart;

        if (!$monthNum || $dayNumRaw <= 0) return null;

        $isFemale = $dayNumRaw > 40;
        $day = $isFemale ? $dayNumRaw - 40 : $dayNumRaw;

        $currentYear = (int) date('Y');
        $century = $yearNum + 1900 > $currentYear ? 1900 : 2000;
        $year = $century + $yearNum;

        $birthDate = strtotime(sprintf('%04d-%02d-%02d', $year, $monthNum, $day));
        if ($birthDate === false) return null;

        $today = new \DateTimeImmutable('now');
        $birth = new \DateTimeImmutable(date('c', $birthDate));
        $age = $today->diff($birth)->y;

        return [
            'age' => $age,
            'gender' => $isFemale ? 'F' : 'M',
        ];
    }

    private function extractTokens(string $text): array
    {
        $clean = preg_replace('/[^\\p{L}\\p{N}\\s]/u', ' ', $text);
        $parts = preg_split('/\\s+/', $clean ?? '', flags: PREG_SPLIT_NO_EMPTY);
        $tokens = array_filter($parts, fn($p) => mb_strlen($p) >= 4);
        return array_values(array_unique(array_map('mb_strtolower', $tokens)));
    }
}
