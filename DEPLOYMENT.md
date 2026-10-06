# Hosting and Deployment (Render)

The Render Blueprint creates a static React site, a FastAPI service, and a managed PostgreSQL database. It sets the API URL, production secret, exact frontend CORS origin, and React Router rewrite. The API creates its current ORM tables and required role records when it starts.

## Deploy

1. Connect the GitHub repository `vadlavishal-85/AI-Driven-Smart-Healthcare` to Render and sync the Blueprint from `render.yaml`.
2. Confirm the resource plans before creating them. The checked-in Blueprint uses Render's free web service and Postgres plans for a review/demo deployment.
3. Wait for the API `/ready` check and frontend build to pass. Render assigns these URLs from the current names:
   - Frontend: `https://smarthealthcare-frontend.onrender.com`
   - API: `https://smarthealthcare-api-6ebh.onrender.com`
4. Verify `/health`, `/ready`, `/database/health`, and `/docs` on the API URL. When `ENABLE_DEMO_ACCOUNTS=true`, the API creates the patient, doctor, and admin demo accounts using the three generated `DEMO_*_PASSWORD` values in the Render service environment. These are public presentation accounts and must only be used with fictional data. For normal use, sign in with the bootstrap administrator and provision doctors through `POST /admin/doctors` in `/docs`.

If Render reports that a service name is already taken, update both the corresponding names and URL values in `render.yaml`, then sync again. Keep `CORS_ORIGINS` set to the exact deployed frontend origin.

## Database and privacy limits

The Blueprint provisions PostgreSQL for the implemented APIs. PostgreSQL is selected through `DATABASE_URL`; local MySQL remains supported with `APP_DATABASE_BACKEND=mysql`. Local development defaults to a persistent SQLite file so a fresh checkout works without a database server.

Render's free PostgreSQL database expires 30 days after creation, has no backups, and is documented for testing/hobby use rather than production. The free app services can spin down when idle. Do not store real patient information or clinical data in this demo deployment. For a durable live system, use a paid database plan with backups, access controls, and an appropriate healthcare privacy/compliance review before handling real patient data.

## Implemented workflows and limits

Patient registration, login, role checks, profile updates, and password changes use the database. Patients can create appointments for active, administrator-provisioned doctors, view only their own appointments, and cancel eligible bookings. Assigned doctors can view their own appointment schedule, confirm or close appointments, and write diagnosis, treatment plan, and clinical notes. Patients can read clinical information attached to their own appointments. Appointment booking checks for an already scheduled or confirmed appointment for the same doctor and time.

Only appointment and account workflows are backed by the API. Other module pages such as medical-record search, prescriptions, analytics, and data exchange remain demonstration content; do not rely on them for real operations or clinical decisions.

The GitHub repository contains the website source tree and Render Blueprint. Never commit `.env` files, database credentials, access tokens, or real patient information.
