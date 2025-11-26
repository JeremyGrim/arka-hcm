import { appendJournalLine } from '../fs/appendJournalLine';
import { missionJournalPath } from '../fs/paths';
import type { HcmRootConfig } from '../types';
import { makeError, HcmErrorCodes } from '../errors';

export interface AppendJournalPayload {
  mission_id: string;
  entry: {
    author_type: 'agent' | 'human' | 'system';
    author_id: string;
    entry_type: string;
    message: string;
    context?: any;
  };
}

export async function appendJournal(
  config: HcmRootConfig,
  payload: AppendJournalPayload
): Promise<{ success: true }> {
  const { mission_id, entry } = payload;
  if (!mission_id || !entry) {
    throw makeError(HcmErrorCodes.INVALID_PAYLOAD, 'mission_id and entry are required');
  }
  if (!entry.author_type || !entry.author_id || !entry.entry_type || !entry.message) {
    throw makeError(HcmErrorCodes.INVALID_PAYLOAD, 'entry is missing required fields');
  }

  const enriched = {
    ...entry,
    timestamp: new Date().toISOString()
  };

  await appendJournalLine(missionJournalPath(config, mission_id), enriched);
  return { success: true };
}

