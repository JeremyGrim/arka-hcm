import { missionNextActionsPath } from '../fs/paths';
import type { HcmRootConfig } from '../types';
import { readJsonFile } from '../fs/readJson';
import { writeJsonFile } from '../fs/writeJson';
import { makeError, HcmErrorCodes } from '../errors';
import crypto from 'crypto';

export interface UpdateNextActionsPayload {
  mission_id: string;
  actions: Array<{
    action_id?: string | null;
    title?: string;
    description?: string;
    owner_type?: 'agent' | 'human';
    owner_id?: string;
    created_at?: string;
    due_date?: string | null;
    status?: string;
    priority?: string;
    related_phase?: string;
  }>;
}

export async function updateNextActions(
  config: HcmRootConfig,
  payload: UpdateNextActionsPayload
): Promise<{ next_actions: any[] }> {
  const { mission_id, actions } = payload;
  if (!mission_id || !Array.isArray(actions)) {
    throw makeError(HcmErrorCodes.INVALID_PAYLOAD, 'mission_id and actions array are required');
  }

  let current: { next_actions: any[] } = { next_actions: [] };
  try {
    current = await readJsonFile(missionNextActionsPath(config, mission_id));
  } catch (err: any) {
    if (err.code !== HcmErrorCodes.IO_ERROR) {
      throw err;
    }
  }

  const map = new Map<string, any>();
  for (const existing of current.next_actions) {
    if (existing.action_id) {
      map.set(existing.action_id, existing);
    }
  }

  for (const action of actions) {
    if (!action.action_id) {
      const newId = `act-${crypto.randomBytes(4).toString('hex')}`;
      const now = new Date().toISOString();
      map.set(newId, {
        action_id: newId,
        created_at: now,
        status: 'todo',
        priority: 'medium',
        ...action
      });
    } else {
      const existing = map.get(action.action_id);
      if (!existing) {
        throw makeError(
          HcmErrorCodes.CONFLICTING_UPDATE,
          `Action not found for update: ${action.action_id}`,
          { action_id: action.action_id }
        );
      }
      map.set(action.action_id, {
        ...existing,
        ...action
      });
    }
  }

  const nextActions = Array.from(map.values());
  await writeJsonFile(missionNextActionsPath(config, mission_id), { next_actions: nextActions });
  return { next_actions: nextActions };
}

