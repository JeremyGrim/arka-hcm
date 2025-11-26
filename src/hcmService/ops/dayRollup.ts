import type { HcmRootConfig } from '../types';
import { missionJournalPath, missionSnapshotsDir, missionStatusPath } from '../fs/paths';
import fs from 'fs/promises';
import { readJsonFile } from '../fs/readJson';
import { writeJsonFile } from '../fs/writeJson';
import path from 'path';

export interface DayRollupPayload {
  mission_id: string;
  date: string; // YYYY-MM-DD
}

export async function dayRollup(
  config: HcmRootConfig,
  payload: DayRollupPayload
): Promise<{ snapshot_id: string }> {
  const { mission_id, date } = payload;

  let keyEvents: string[] = [];
  try {
    const raw = await fs.readFile(missionJournalPath(config, mission_id), 'utf-8');
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    for (const line of lines) {
      const entry = JSON.parse(line);
      if (typeof entry.timestamp === 'string' && entry.timestamp.startsWith(date)) {
        keyEvents.push(entry.message);
      }
    }
  } catch {
    keyEvents = [];
  }

  const status = await readJsonFile<any>(missionStatusPath(config, mission_id));

  const snapshotId = `day-${date}`;
  const snapshot = {
    snapshot_id: snapshotId,
    mission_id,
    date,
    summary: keyEvents[0] ?? '',
    key_events: keyEvents,
    decisions_made: [],
    actions_created: [],
    actions_closed: [],
    updated_status: {
      phase: status.phase,
      status: status.status,
      progress: status.progress,
      health: status.health
    }
  };

  const filePath = path.join(missionSnapshotsDir(config, mission_id), `${date}.day.json`);
  await writeJsonFile(filePath, snapshot);
  return { snapshot_id: snapshotId };
}

