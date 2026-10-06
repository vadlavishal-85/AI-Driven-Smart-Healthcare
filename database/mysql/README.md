# Relational Database Notes

The live Render deployment uses **PostgreSQL**, not this MySQL folder. Render provisions the managed database `smarthealthcare-db` in Singapore and passes its private connection URL to the API through `DATABASE_URL`.

The Python database module remains named `backend/app/database/mysql.py` for compatibility. It supports PostgreSQL through `psycopg`, local SQLite for development, and optional legacy MySQL through PyMySQL.

The live tables come from the SQLAlchemy models in `backend/app/models/`, created at API startup. `schema.sql` in this directory is an older MySQL reference script, is not run by Render, and does not match the deployed ORM schema. See [the backend overview](../../docs/BACKEND_OVERVIEW.md) for the current tables and a safe read-only demonstration.
