"""Omni Life AI service entrypoint (STEP 1 scaffold — STEP 6 expands MIMI)."""

from fastapi import FastAPI

app = FastAPI(title="Omni Life AI", version="0.1.0")


@app.get("/health")
def health():
    return {"ok": True, "service": "omni-life-ai"}
