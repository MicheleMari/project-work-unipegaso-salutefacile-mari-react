<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpecialistInvestigationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();
        $departments = DB::table('departments')->pluck('id', 'name');

        $perDepartment = [
            'Cardiologia' => [
                'Ecocardiogramma transtoracico',
                'Test da sforzo (ergometrico)',
                'Holter ECG 24h',
                'Angio TAC coronarica',
                'Tilt test autonomico',
            ],
            'Ortopedia' => [
                'Rx torace pre-operatorio',
                'RMN ginocchio',
                'TAC arto inferiore',
                'Ecografia muscolo-tendinea',
                'Densitometria ossea (MOC)',
            ],
            'Neurologia' => [
                'Elettroencefalogramma (EEG)',
                'Elettromiografia (EMG)',
                'TC encefalo',
                'RM encefalo',
                'Doppler TSA',
            ],
            'Chirurgia' => [
                'Eco addome completo',
                'TAC addome con mdc',
                'Colonscopia diagnostica',
                'Gastroscopia',
                'ERCP',
            ],
            'Radiologia' => [
                'Rx torace postero-anteriore',
                'TC torace ad alta risoluzione',
                'RMN colonna lombare',
                'Ecografia addome superiore',
                'MOC DEXA total body',
            ],
        ];

        $rows = [];
        foreach ($perDepartment as $departmentName => $titles) {
            $departmentId = $departments[$departmentName] ?? null;
            if (! $departmentId) {
                continue;
            }

            foreach ($titles as $title) {
                $rows[] = [
                    'title' => $title,
                    'department_id' => $departmentId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if ($rows) {
            DB::table('specialist_investigations')->upsert($rows, ['title'], ['department_id', 'updated_at']);
        }
    }
}
