# Agents

## Cursor Cloud specific instructions

### Services overview

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| FastAPI backend | `PYTHONPATH=/workspace uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` | 8000 | SQLite DB (`aliafrica.db`) auto-creates on first startup. Swagger UI at `/docs`. |
| React frontend | `cd frontend && npm run dev -- --host 0.0.0.0` | 5173 | Vite dev server. Connects to backend at `http://127.0.0.1:8000` by default (override via `VITE_API_BASE_URL`). |

### Gotchas

- **PYTHONPATH**: The repo has no `pyproject.toml` or `setup.py`. You must set `PYTHONPATH=/workspace` when running `pytest`, `uvicorn`, or any Python command that imports from `app.*`.
- **bcrypt/passlib compatibility**: `passlib[bcrypt]` requires `bcrypt<4.1` to avoid a `ValueError` on password hashing. The update script pins this automatically.
- **CORS**: The backend needs CORS middleware to serve the React frontend in development. The middleware has been added to `app/main.py` allowing `localhost:5173` and `127.0.0.1:5173`.
- **No migrations**: SQLite DB is created automatically by the FastAPI lifespan handler. Delete `aliafrica.db` to reset.

### Standard commands

See `README.md` for full details. Quick reference:

- **Tests**: `PYTHONPATH=/workspace pytest -q`
- **Lint (frontend)**: `cd frontend && npx eslint .`
- **Build (frontend)**: `cd frontend && npm run build`
