import fs from 'fs/promises';
import path from 'path';
import type { HcmRootConfig } from '../types';
import { missionsRoot, missionMetaPath, missionStatusPath } from '../fs/paths';
import { readJsonFile } from '../fs/readJson';

export interface ListMissionsPayload {
  filters?: {
    status?: string;
    client_id?: string;
  };
}

export async function listMissions(
  config: HcmRootConfig,
  payload: ListMissionsPayload
): Promise<{ missions: any[] }> {
  const root = missionsRoot(config);
  let entries: string[] = [];
  try {
    entries = await fs.readdir(root);
  } catch {
    // no missions directory yet
    return { missions: [] };
  }

  const missions: any[] = [];
  for (const missionId of entries) {
    const metaPath = missionMetaPath(config, missionId);
    const statusPath = missionStatusPath(config, missionId);
    try {
      const meta = await readJsonFile<any>(metaPath);
      const status = await readJsonFile<any>(statusPath);
      missions.push({
        mission_id: missionId,
        title: meta.title,
        status: status.status,
        phase: status.phase,
        health: status.health,
        client_id: meta.client_id
      });
    } catch {
      // ignore missions with invalid or incomplete files
    }
  }

  let filtered = missions;
  const { filters } = payload;
  if (filters?.status) {
    filtered = filtered.filter((m) => m.status === filters.status);
  }
  if (filters?.client_id) {
    filtered = filtered.filter((m) => m.client_id === filters.client_id);
  }

  return { missions: filtered };
}

