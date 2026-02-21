from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel
from ytmusicapi import YTMusic

router = APIRouter()
logger = logging.getLogger(__name__)

_song_cache: dict[str, list[dict]] = {}


class FetchRequest(BaseModel):
    groups: list[str]
    year: str


class SongResult(BaseModel):
    group: str
    tier: str | None = None
    title: str
    video_id: str
    views: str
    year: str
    album: str


def _get_view_count(yt: YTMusic, video_id: str) -> str:
    """Fetch the real YouTube view count for a video via get_song()."""
    try:
        song_data = yt.get_song(video_id)
        vd = song_data.get("videoDetails", {})
        count = vd.get("viewCount", "0")
        return count if count and count.isdigit() else "0"
    except Exception:
        logger.warning("Failed to fetch view count for %s", video_id)
        return "0"


@router.post("/songs/fetch")
def fetch_songs(req: FetchRequest) -> list[dict[str, Any]]:
    cache_key = f"{','.join(sorted(req.groups))}_{req.year}"
    if cache_key in _song_cache:
        return _song_cache[cache_key]

    yt = YTMusic()
    results: list[dict[str, Any]] = []
    seen_vids: set[str] = set()

    for group in req.groups:
        try:
            search = yt.search(group, filter="artists")
            if not search:
                continue
            artist_id = search[0].get("browseId")
            if not artist_id:
                continue

            artist_data = yt.get_artist(artist_id)

            for section_key in ("singles", "albums"):
                section = artist_data.get(section_key, {})
                items = section.get("results", [])
                for item in items:
                    browse_id = item.get("browseId")
                    if not browse_id:
                        continue
                    try:
                        album = yt.get_album(browse_id)
                    except Exception:
                        logger.warning("Failed to fetch album %s", browse_id)
                        continue

                    if str(album.get("year", "")) != str(req.year):
                        continue

                    album_title = album.get("title", "Unknown Album")
                    for track in album.get("tracks", []):
                        vid = track.get("videoId")
                        if not vid or vid in seen_vids:
                            continue
                        seen_vids.add(vid)
                        results.append({
                            "group": group,
                            "title": track.get("title", "Unknown"),
                            "video_id": vid,
                            "views": "",
                            "year": str(album.get("year", req.year)),
                            "album": album_title,
                        })
        except Exception:
            logger.exception("Error fetching data for %s", group)
            continue

    for entry in results:
        entry["views"] = _get_view_count(yt, entry["video_id"])

    _song_cache[cache_key] = results
    return results


@router.get("/artist/thumbnail")
def get_artist_thumbnail(name: str) -> dict[str, str]:
    try:
        yt = YTMusic()
        search = yt.search(name, filter="artists")
        if search and search[0].get("thumbnails"):
            return {"url": search[0]["thumbnails"][-1]["url"]}
    except Exception:
        logger.warning("Failed to fetch thumbnail for %s", name)
    return {"url": ""}
