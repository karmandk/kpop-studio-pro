import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

try:
    from api.ytmusic import router as ytmusic_router
    from api.llm import router as llm_router
    from state.persistence import (
        load_tier_state,
        save_tier_state,
        tier_state_to_containers,
        containers_to_tier_state,
    )
except ImportError:
    from backend.api.ytmusic import router as ytmusic_router
    from backend.api.llm import router as llm_router
    from backend.state.persistence import (
        load_tier_state,
        save_tier_state,
        tier_state_to_containers,
        containers_to_tier_state,
    )

app = FastAPI(title="K-Pop Studio Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ytmusic_router, prefix="/api")
app.include_router(llm_router, prefix="/api")


@app.get("/api/tiers")
def get_tiers():
    state = load_tier_state()
    return tier_state_to_containers(state)


@app.put("/api/tiers")
def update_tiers(containers: list[dict]):
    state = containers_to_tier_state(containers)
    save_tier_state(state)
    return {"ok": True}


# Serve React static build in production
DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(DIST_DIR / "index.html")
