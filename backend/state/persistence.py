import json
from pathlib import Path
from typing import Any

def _find_tier_state() -> Path:
    """Locate tier_state.json relative to this file or the working directory."""
    candidate = Path(__file__).resolve().parent.parent.parent / "tier_state.json"
    if candidate.exists():
        return candidate
    cwd_candidate = Path.cwd() / "tier_state.json"
    if cwd_candidate.exists():
        return cwd_candidate
    return candidate

TIER_STATE_PATH = _find_tier_state()

TIER_ORDER = ["PEAK", "SSS", "S", "A", "B", "C"]


def load_tier_state() -> dict[str, Any]:
    """Load tier state from JSON file. Returns {order: [...], tiers: {...}}."""
    if not TIER_STATE_PATH.exists():
        return {"order": [], "tiers": {}}
    with open(TIER_STATE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_tier_state(state: dict[str, Any]) -> None:
    """Save tier state to JSON file."""
    with open(TIER_STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)


def tier_state_to_containers(state: dict[str, Any]) -> list[dict]:
    """Convert flat {order, tiers} to multi-container format for the frontend.

    Returns a list like:
    [{"header": "PEAK", "items": ["aespa", "MEOVV", ...]}, ...]
    preserving within-tier order from the order list.
    """
    tiers_map: dict[str, list[str]] = {t: [] for t in TIER_ORDER}
    tier_lookup = state.get("tiers", {})
    for group in state.get("order", []):
        tier = tier_lookup.get(group, "C")
        tiers_map[tier].append(group)
    return [{"header": t, "items": tiers_map[t]} for t in TIER_ORDER]


def containers_to_tier_state(containers: list[dict]) -> dict[str, Any]:
    """Convert multi-container format back to flat {order, tiers}."""
    order: list[str] = []
    tiers: dict[str, str] = {}
    for container in containers:
        header = container["header"]
        for item in container.get("items", []):
            order.append(item)
            tiers[item] = header
    return {"order": order, "tiers": tiers}
