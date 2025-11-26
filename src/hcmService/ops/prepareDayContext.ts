import type { HcmRootConfig } from '../types';
import { missionSnapshotsDir, missionNextActionsPath } from '../fs/paths';
import { readJsonFile } from '../fs/readJson';
import path from 'path';
import fs from 'fs/promises';

export interface PrepareDayContextPayload {
  mission_id: string;
  date: string; // YYYY-MM-DD
}

export async function prepareDayContext(
  config: HcmRootConfig,
  payload: PrepareDayContextPayload
): Promise<{ mission_id: string; day_context: any }> {
  const { mission_id, date } = payload;

  const daySnapshotPath = path.join(missionSnapshotsDir(config, mission_id), `${date}.day.json`);
  const yesterdaySnapshot = await readJsonFile<any>(daySnapshotPath);

  let openActions: any[] = [];
  try {
    const nextActionsJson = await readJsonFile<{ next_actions: any[] }>(
      missionNextActionsPath(config, mission_id)
    );
    openActions = (nextActionsJson.next_actions ?? []).filter(
      (a) => a.status !== 'done' && a.status !== 'cancelled'
    );
  } catch {
    openActions = [];
  }

  const todayObjectivesHint: string[] = [];
  for (const action of openActions) {
    if (typeof action.title === 'string') {
      todayObjectivesHint.push(action.title);
    }
  }

  return {
    mission_id,
    day_context: {
      yesterday_snapshot: yesterdaySnapshot,
      open_actions: openActions,
      today_date: date,
      today_objectives_hint: todayObjectivesHint
    }
  };
}

