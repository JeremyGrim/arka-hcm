import type { HcmRootConfig } from '../types';

export interface RotateJournalPayload {
  mission_id: string;
  date: string;
}

// Stub v1 – rotation non implémentée, mais op reconnue.
export async function rotateJournal(
  _config: HcmRootConfig,
  payload: RotateJournalPayload
): Promise<{ rotated: boolean }> {
  return { rotated: false };
}

