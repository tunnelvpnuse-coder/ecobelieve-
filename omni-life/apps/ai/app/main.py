"""Omni Life AI service entrypoint."""

from fastapi import FastAPI

app = FastAPI(title="Omni Life AI Service")


@app.get("/health")
def health() -> dict[str, str]:
    """Return service health for probes."""
    return {"status": "ok"}
