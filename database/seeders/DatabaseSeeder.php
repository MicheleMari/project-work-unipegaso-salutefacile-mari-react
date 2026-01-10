<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $now = now();

        DB::table('permissions')->upsert([
            ['name' => 'Operatore PS', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Specialista', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Amministratore', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Operatore 118', 'created_at' => $now, 'updated_at' => $now],
        ], ['name'], ['updated_at']);

        DB::table('departments')->upsert([
            ['name' => 'Cardiologia', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Ortopedia', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Chirurgia', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Neurologia', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Pediatria', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Radiologia', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Ostetricia', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Urologia', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dermatologia', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Gastroenterologia', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Endocrinologia', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Oncologia', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Ginecologia', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Psichiatria', 'created_at' => $now, 'updated_at' => $now],
        ], ['name'], ['updated_at']);

        $permissions = DB::table('permissions')->pluck('id', 'name');
        $departments = DB::table('departments')->pluck('id', 'name');

        DB::table('users')->upsert([
            [
                'name' => 'Luca',
                'surname' => 'Rossi',
                'permission_id' => $permissions['Operatore PS'] ?? null,
                'department_id' => null,
                'user_identity_code' => 'OPS001',
                'email' => 'ops@ospedale.test',
                'password_hash' => Hash::make('password'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Giulia',
                'surname' => 'Bianchi',
                'permission_id' => $permissions['Specialista'] ?? null,
                'department_id' => $departments['Cardiologia'] ?? null,
                'user_identity_code' => 'SPEC001',
                'email' => 'cardio@ospedale.test',
                'password_hash' => Hash::make('password'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Marco',
                'surname' => 'Verdi',
                'permission_id' => $permissions['Specialista'] ?? null,
                'department_id' => $departments['Ortopedia'] ?? null,
                'user_identity_code' => 'SPEC002',
                'email' => 'orto@ospedale.test',
                'password_hash' => Hash::make('password'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Admin',
                'surname' => 'System',
                'permission_id' => $permissions['Amministratore'] ?? null,
                'department_id' => null,
                'user_identity_code' => 'ADMIN001',
                'email' => 'admin@ospedale.test',
                'password_hash' => Hash::make('password'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Sergio',
                'surname' => 'Ferrari',
                'permission_id' => $permissions['Operatore 118'] ?? null,
                'department_id' => null,
                'user_identity_code' => '118OPS001',
                'email' => '118@ospedale.test',
                'password_hash' => Hash::make('password'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ], ['email'], ['permission_id', 'department_id', 'user_identity_code', 'password_hash', 'updated_at']);

        DB::table('investigations')->upsert([
            ['title' => 'ECG', 'description' => 'Elettrocardiogramma a 12 derivazioni', 'created_at' => $now, 'updated_at' => $now],
            ['title' => 'Urinocoltura', 'description' => 'Analisi rapida urine', 'created_at' => $now, 'updated_at' => $now],
            ['title' => 'Emogas (EGA)', 'description' => 'Emogasanalisi arteriosa', 'created_at' => $now, 'updated_at' => $now],
            ['title' => 'Prelievo Ematico', 'description' => 'Prelievo per esami ematochimici', 'created_at' => $now, 'updated_at' => $now],
            ['title' => 'Tampone Covid', 'description' => 'Test antigenico rapido', 'created_at' => $now, 'updated_at' => $now],
            ['title' => 'Glucometria', 'description' => 'Misurazione glicemia capillare', 'created_at' => $now, 'updated_at' => $now],
            ['title' => 'Alcol Test', 'description' => 'Test alcolemico', 'created_at' => $now, 'updated_at' => $now],
        ], ['title'], ['description', 'updated_at']);

        $this->call(SpecialistInvestigationsSeeder::class);
    }
}
