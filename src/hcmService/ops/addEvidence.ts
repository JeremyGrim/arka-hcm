import { missionEvidenceDir } from '../fs/paths';
import type { HcmRootConfig } from '../types';
import { writeJsonFile } from '../fs/writeJson';
import { makeError, HcmErrorCodes } from '../errors';
import path from 'path';
import crypto from 'crypto';

export interface AddEvidencePayload {
  mission_id: string;
  evidence: {
    type: string;
    title: string;
    source?: any;
    confidence?: string;
    summary?: string;
    highlights?: string[];
    tags?: string[];
    attachments?: any[];
  };
}

export async function addEvidence(
  config: HcmRootConfig,
  caller: { type: string; id: string },
  payload: AddEvidencePayload
): Promise<{ evidence_id: string }> {
  const { mission_id, evidence } = payload;
  if (!mission_id || !evidence) {
    throw makeError(HcmErrorCodes.INVALID_PAYLOAD, 'mission_id and evidence are required');
  }
  if (!evidence.type || !evidence.title) {
    throw makeError(HcmErrorCodes.INVALID_PAYLOAD, 'evidence is missing required fields');
  }

  const evidenceId = `ev-${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();
  const enriched = {
    evidence_id: evidenceId,
    created_at: now,
    created_by_type: caller.type,
    created_by_id: caller.id,
    ...evidence
  };

  const filePath = path.join(missionEvidenceDir(config, mission_id), `${evidenceId}.json`);
  await writeJsonFile(filePath, enriched);

  return { evidence_id: evidenceId };
}

