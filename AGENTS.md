# AGENTS.md

## Cursor Cloud specific instructions

### Architecture

Aliafrica is a two-tier monorepo: a Python/FastAPI backend (`app/`) and a React/TypeScript frontend (`frontend/`). The backend uses SQLite (auto-created file `aliafrica.db` on startup) with no migration tooling (Alembic is not configured). See `README.md` for the full endpoint list and workflow.

### Running services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Backend API | `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` | 8000 | Run from repo root; SQLite DB auto-created |
| Frontend SPA | `npm run dev -- --host 0.0.0.0` | 5173 | Run from `frontend/`; set `VITE_API_BASE_URL=http://127.0.0.1:8000` |

### Known gotchas

- **CORS**: The backend needs `CORSMiddleware` allowing `http://127.0.0.1:5173` and `http://localhost:5173` for the frontend to connect in dev. If CORS errors appear, add the middleware to `app/main.py`.
- **bcrypt compatibility**: `passlib[bcrypt]` with bcrypt >= 4.3 causes `ValueError: password cannot be longer than 72 bytes` on Python 3.12. Pin `bcrypt<4.3` (e.g. `pip install 'bcrypt<4.3'`).
- **PYTHONPATH**: Tests require `PYTHONPATH=.` to resolve the `app` module. Run `PYTHONPATH=. pytest -q` from repo root.
- **No `__init__.py` in `app/services/`**: The directory lacks it but imports still work via the parent `app/__init__.py`. Don't be surprised if your IDE flags it.

### Lint / Test / Build

- **Backend tests**: `cd /workspace && PYTHONPATH=. pytest -q` (4 tests)
- **Frontend lint**: `cd /workspace/frontend && npx eslint .`
- **Frontend type-check**: `cd /workspace/frontend && npx tsc -b --noEmit`
- **Frontend build**: `cd /workspace/frontend && npm run build`

### Environment variables

See `.env.example`. Defaults work for local dev without any `.env` file. `ALIAFRICA_SECRET_KEY` defaults to `"change-me-in-production"` in `app/security.py`.
