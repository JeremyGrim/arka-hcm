import { readJsonFile } from '../fs/readJson';
import {
  missionMetaPath,
  missionStatusPath,
  missionJournalPath,
  missionDecisionsPath,
  missionNextActionsPath
} from '../fs/paths';
import type { HcmRootConfig } from '../types';
import { makeError, HcmErrorCodes } from '../errors';
import fs from 'fs/promises';

export interface GetMissionContextPayload {
  mission_id: string;
  options?: {
    include_decisions?: boolean;
    include_next_actions?: boolean;
    include_last_entries?: number;
  };
}

export async function getMissionContext(
  config: HcmRootConfig,
  payload: GetMissionContextPayload
): Promise<any> {
  const { mission_id, options } = payload;
  if (!mission_id) {
    throw makeError(HcmErrorCodes.INVALID_PAYLOAD, 'mission_id is required');
  }

  // meta
  let meta;
  try {
    meta = await readJsonFile(missionMetaPath(config, mission_id));
  } catch (err: any) {
    if (err.code === HcmErrorCodes.IO_ERROR) {
      throw makeError(HcmErrorCodes.MISSION_NOT_FOUND, `Mission not found: ${mission_id}`, {
        mission_id
      });
    }
    throw err;
  }

  const status = await readJsonFile(missionStatusPath(config, mission_id));

  // journal (read last N lines if requested)
  let lastEntries: any[] = [];
  const lastCount = options?.include_last_entries ?? 0;
  if (lastCount > 0) {
    try {
      const raw = await fs.readFile(missionJournalPath(config, mission_id), 'utf-8');
      const lines = raw
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const last = lines.slice(-lastCount);
      lastEntries = last.map((line) => JSON.parse(line));
    } catch (err: any) {
      // journal is optional; if missing, just return empty list
      if (err.code !== 'ENOENT') {
        throw makeError(HcmErrorCodes.IO_ERROR, 'Error reading journal', { mission_id, error: String(err) });
      }
    }
  }

  let decisions: any[] | undefined;
  if (options?.include_decisions) {
    try {
      const decisionsJson = await readJsonFile<{ decisions: any[] }>(
        missionDecisionsPath(config, mission_id)
      );
      decisions = decisionsJson.decisions ?? [];
    } catch (err: any) {
      if (err.code !== HcmErrorCodes.IO_ERROR) {
        throw err;
      }
      decisions = [];
    }
  }

  let nextActions: any[] | undefined;
  if (options?.include_next_actions) {
    try {
      const nextActionsJson = await readJsonFile<{ next_actions: any[] }>(
        missionNextActionsPath(config, mission_id)
      );
      nextActions = nextActionsJson.next_actions ?? [];
    } catch (err: any) {
      if (err.code !== HcmErrorCodes.IO_ERROR) {
        throw err;
      }
      nextActions = [];
    }
  }

  return {
    mission_id,
    meta,
    status,
    last_journal_entries: lastEntries,
    decisions,
    next_actions: nextActions
  };
}

