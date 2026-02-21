from __future__ import annotations

import logging
import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)


class AnalyzeRequest(BaseModel):
    song: str
    group: str
    groq_api_key: str | None = None


SYSTEM_PROMPT = (
    "You are a K-Pop music analyst. Provide a concise, insightful analysis "
    "(3-5 sentences) of the given song. Cover the musical style, notable production "
    "elements, and how it fits into the group's discography. Be specific and avoid "
    "generic praise."
)


@router.post("/llm/analyze")
async def analyze_song(req: AnalyzeRequest) -> dict[str, str]:
    api_key = req.groq_api_key or os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="No Groq API key provided. Set GROQ_API_KEY or pass it in the request.",
        )

    try:
        from groq import Groq

        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Analyze the song '{req.song}' by {req.group}.",
                },
            ],
            max_tokens=512,
            temperature=0.7,
        )
        return {"analysis": completion.choices[0].message.content or ""}
    except Exception as e:
        logger.exception("Groq analysis failed")
        raise HTTPException(status_code=500, detail=str(e))
