import type { TierContainer, Song } from "./types";

const BASE = "";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

export async function fetchTiers(): Promise<TierContainer[]> {
  return request<TierContainer[]>("/api/tiers");
}

export async function saveTiers(containers: TierContainer[]): Promise<void> {
  await request("/api/tiers", {
    method: "PUT",
    body: JSON.stringify(containers),
  });
}

export async function fetchSongs(groups: string[], year: string): Promise<Song[]> {
  return request<Song[]>("/api/songs/fetch", {
    method: "POST",
    body: JSON.stringify({ groups, year }),
  });
}

export async function getArtistThumbnail(name: string): Promise<string> {
  const data = await request<{ url: string }>(
    `/api/artist/thumbnail?name=${encodeURIComponent(name)}`,
  );
  return data.url;
}

export async function analyzeWithGroq(
  song: string,
  group: string,
  groqApiKey?: string,
): Promise<string> {
  const data = await request<{ analysis: string }>("/api/llm/analyze", {
    method: "POST",
    body: JSON.stringify({ song, group, groq_api_key: groqApiKey }),
  });
  return data.analysis;
}
