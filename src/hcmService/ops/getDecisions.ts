import { missionDecisionsPath } from '../fs/paths';
import type { HcmRootConfig } from '../types';
import { readJsonFile } from '../fs/readJson';
import { makeError, HcmErrorCodes } from '../errors';

export interface GetDecisionsPayload {
  mission_id: string;
  filters?: {
    status?: string;
    related_phase?: string;
  };
}

export async function getDecisions(
  config: HcmRootConfig,
  payload: GetDecisionsPayload
): Promise<{ decisions: any[] }> {
  const { mission_id, filters } = payload;
  if (!mission_id) {
    throw makeError(HcmErrorCodes.INVALID_PAYLOAD, 'mission_id is required');
  }

  const json = await readJsonFile<{ decisions: any[] }>(missionDecisionsPath(config, mission_id));
  let decisions = json.decisions ?? [];

  if (filters?.status) {
    decisions = decisions.filter((d) => d.status === filters.status);
  }
  if (filters?.related_phase) {
    decisions = decisions.filter((d) => d.related_phase === filters.related_phase);
  }

  return { decisions };
}

