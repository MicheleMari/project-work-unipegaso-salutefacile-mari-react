# SaluteFacile

## Descrizione
SaluteFacile e' una web app per la gestione di un pronto soccorso: triage ed emergenze, visite specialistiche, richieste di esami e produzione di referti. Il backend espone API REST documentate con Swagger, mentre il frontend e' una SPA React integrata via Inertia.

## Tecnologie principali
- Backend: Laravel 12 (PHP 8.2+), Fortify (auth), L5-Swagger (OpenAPI)
- Frontend: React 19 + Inertia, Vite 7, Tailwind CSS 4
- Database: SQLite (default), con seed iniziali

## Documentazione API
- Swagger UI: http://localhost:8000/api/documentation
- Specifiche JSON: http://localhost:8000/docs
- Auth: sessione Laravel (cookie `laravel_session`). Effettua login su `/login`.

## Diagrammi
- ER (immagine): `storage/diagrams/er.png`
- UML (immagine): `storage/diagrams/uml.png`
- Sorgenti PlantUML: `storage/diagrams/er.puml`, `storage/diagrams/uml.puml`

## Avvio rapido (sviluppo)
1) Installa le dipendenze backend
```bash
composer install
```
2) Installa le dipendenze frontend
```bash
npm install
```
3) Configura l'ambiente
```bash
cp .env.example .env
php artisan key:generate
```
4) Database (SQLite di default)
```bash
php artisan migrate --seed
```
5) Avvia tutto in modalita' sviluppo
```bash
composer run dev
```
Il comando avvia server Laravel, queue listener e Vite.

## Build frontend (produzione)
```bash
npm run build
```

## Avvio manuale (se preferisci separare i processi)
```bash
php artisan serve
npm run dev
```

## Dati iniziali (seed)
Esegue `DatabaseSeeder` con permessi, reparti, utenti demo e indagini. Utenti predefiniti:
- ops@ospedale.test / password (Operatore PS)
- cardio@ospedale.test / password (Specialista Cardiologia)
- orto@ospedale.test / password (Specialista Ortopedia)
- admin@ospedale.test / password (Amministratore)
- 118@ospedale.test / password (Operatore 118)

## Configurazione utile
- `APP_URL` in `.env` per l'URL base (default `http://127.0.0.1:8000`)
- `DB_CONNECTION=sqlite` usa `database/database.sqlite`

## Note sulla generazione Swagger
Se modifichi annotazioni OpenAPI e non vedi aggiornamenti:
```bash
php artisan l5-swagger:generate
```
