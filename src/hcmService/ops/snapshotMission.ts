import type { HcmRootConfig } from '../types';
import { missionSnapshotsDir, missionStatusPath } from '../fs/paths';
import { readJsonFile } from '../fs/readJson';
import { writeJsonFile } from '../fs/writeJson';
import path from 'path';

export interface SnapshotMissionPayload {
  mission_id: string;
  reason?: string;
}

export async function snapshotMission(
  config: HcmRootConfig,
  payload: SnapshotMissionPayload
): Promise<{ snapshot_id: string }> {
  const { mission_id } = payload;
  const status = await readJsonFile<any>(missionStatusPath(config, mission_id));
  const timestamp = new Date().toISOString();
  const snapshotId = `snap-${timestamp}`;

  const snapshot = {
    snapshot_id: snapshotId,
    timestamp,
    mission_id,
    status: {
      phase: status.phase,
      status: status.status,
      progress: status.progress,
      health: status.health
    }
  };

  const fileName = `${timestamp.replace(/:/g, '-')} .snapshot.json`.replace(' ', '');
  const filePath = path.join(missionSnapshotsDir(config, mission_id), fileName);
  await writeJsonFile(filePath, snapshot);
  return { snapshot_id: snapshotId };
}

