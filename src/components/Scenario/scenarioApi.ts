import type { ScenarioMeta, RunRequest, RunStatus } from "./types";
import type { ApiResponse } from "@/api/types";

const BASE = "/api/diagnosis";

export const scenarioApi = {
  list: async (): Promise<ScenarioMeta[]> => {
    const r = await fetch(`${BASE}/scenarios`);
    if (!r.ok) throw new Error(`list failed: ${r.status}`);
    const j = (await r.json()) as ApiResponse<ScenarioMeta[]>;
    return j.data;
  },
  run: async (body: RunRequest): Promise<void> => {
    const r = await fetch(`${BASE}/run`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`run failed: ${r.status}`);
  },
  stop: async (): Promise<void> => {
    const r = await fetch(`${BASE}/stop`, { method: "POST" });
    if (!r.ok) throw new Error(`stop failed: ${r.status}`);
  },
  status: async (): Promise<RunStatus> => {
    const r = await fetch(`${BASE}/status`);
    if (!r.ok) throw new Error(`status failed: ${r.status}`);
    const j = (await r.json()) as ApiResponse<RunStatus>;
    return j.data;
  },
};
