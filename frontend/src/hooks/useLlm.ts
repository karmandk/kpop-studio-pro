import { useState, useCallback, useRef } from "react";
import type { AppSettings } from "../lib/types";
import { analyzeWithGroq } from "../lib/api";

const OLLAMA_URL = "http://localhost:11434";
const OLLAMA_MODEL = "llama3.1";

const SYSTEM_PROMPT =
  "You are a K-Pop music analyst. Provide a concise, insightful analysis " +
  "(3-5 sentences) of the given song. Cover the musical style, notable production " +
  "elements, and how it fits into the group's discography. Be specific and avoid " +
  "generic praise.";

async function checkOllamaAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function analyzeWithOllama(song: string, group: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analyze the song '${song}' by ${group}.` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.message?.content || "";
}

export function useLlm(settings: AppSettings) {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const ollamaChecked = useRef<boolean | null>(null);

  const analyze = useCallback(
    async (song: string, group: string, videoId?: string): Promise<string | null> => {
      setAnalyzingId(videoId || `${group}_${song}`);
      try {
        const backend = settings.llmBackend;

        if (backend === "ollama" || backend === "auto") {
          if (ollamaChecked.current === null) {
            ollamaChecked.current = await checkOllamaAvailable();
          }

          if (backend === "ollama" && !ollamaChecked.current) {
            throw new Error(
              "Ollama is not reachable at localhost:11434. " +
                "Make sure Ollama is running and OLLAMA_ORIGINS is set.",
            );
          }

          if (ollamaChecked.current) {
            try {
              return await analyzeWithOllama(song, group);
            } catch (e) {
              if (backend === "ollama") throw e;
              // auto: fall through to Groq
            }
          }
        }

        return await analyzeWithGroq(song, group, settings.groqApiKey || undefined);
      } catch (e) {
        console.error("LLM analysis failed:", e);
        return `Analysis failed: ${e instanceof Error ? e.message : "Unknown error"}`;
      } finally {
        setAnalyzingId(null);
      }
    },
    [settings.llmBackend, settings.groqApiKey],
  );

  return { analyze, analyzingId };
}
