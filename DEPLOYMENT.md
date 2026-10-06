# Hosting and Deployment (Render)

The Render Blueprint creates a static React site, a FastAPI service, and a managed PostgreSQL database. It sets the API URL, production secret, exact frontend CORS origin, and React Router rewrite. The API creates its current ORM tables and required role records when it starts.

## Deploy

1. Connect the GitHub repository `vadlavishal-85/AI-Driven-Smart-Healthcare` to Render and sync the Blueprint from `render.yaml`.
2. Confirm the resource plans before creating them. The checked-in Blueprint uses Render's free web service and Postgres plans for a review/demo deployment.
3. Wait for the API `/ready` check and frontend build to pass. Render assigns these URLs from the current names:
   - Frontend: `https://smarthealthcare-frontend.onrender.com`
   - API: `https://smarthealthcare-api.onrender.com`
4. Verify `/health`, `/ready`, `/database/health`, and `/docs` on the API URL. Register a patient account, sign in, edit the profile, and change the password to verify the connected database.

If Render reports that a service name is already taken, update both the corresponding names and URL values in `render.yaml`, then sync again. Keep `CORS_ORIGINS` set to the exact deployed frontend origin.

## Database and privacy limits

The Blueprint provisions PostgreSQL, so a separate MySQL or MongoDB service is not required for the implemented APIs. PostgreSQL is selected through `DATABASE_URL`; existing local MySQL configuration remains supported. MongoDB health is informational and optional because current API routes do not use MongoDB.

Render's free PostgreSQL database expires 30 days after creation, has no backups, and is documented for testing/hobby use rather than production. The free app services can spin down when idle. Do not store real patient information or clinical data in this demo deployment. For a durable live system, use a paid database plan with backups, access controls, and an appropriate healthcare privacy/compliance review before handling real patient data.

## Current functionality boundary

The backend implements patient registration, login, role checks, profile updates, and password changes. The healthcare module pages still contain demo/static content and some alert-only actions; patient/doctor directories, appointments, medical records, clinical notes, prescriptions, data exchange, and analytics are not yet backed by API operations. Deployment makes the implemented account workflows reachable; it does not turn those prototype screens into clinical workflows.

The supplied GitHub repository currently contains presentation files. Include this website source tree in the repository before syncing the Blueprint. Never commit `.env` files, database credentials, access tokens, or real patient information.
