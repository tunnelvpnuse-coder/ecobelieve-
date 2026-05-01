"""Phase-2 style transfer service scaffold."""

from pydantic import BaseModel, Field
from fastapi import APIRouter

router = APIRouter()


class RenderFrameRequest(BaseModel):
    """Input payload for one-frame render requests."""

    frame_base64: str = Field(..., description="Base64-encoded JPEG frame.")
    mode: str = Field(..., description="Stream mode.")
    style_preset: str = Field(..., description="Requested style preset.")


class RenderFrameResponse(BaseModel):
    """Output payload for stylized one-frame renders."""

    frame_base64_png: str = Field(..., description="Base64-encoded PNG frame.")


@router.post("/render/frame", response_model=RenderFrameResponse)
async def render_frame(_: RenderFrameRequest) -> RenderFrameResponse:
    """
    Placeholder stylizer endpoint.

    Step 1 returns a transparent 1x1 PNG placeholder and reserves the API
    contract for Step 5/8 integration work.
    """

    # 1x1 transparent PNG.
    transparent_png = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8"
        "/x8AAwMCAO7+M4cAAAAASUVORK5CYII="
    )
    return RenderFrameResponse(frame_base64_png=transparent_png)
