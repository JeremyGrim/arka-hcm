import path from 'path';
import type { HcmRootConfig } from '../types';

export function hcmRoot(config: HcmRootConfig): string {
  return config.hcmRoot;
}

export function missionsRoot(config: HcmRootConfig): string {
  return path.join(hcmRoot(config), 'state', 'missions');
}

export function missionDir(config: HcmRootConfig, missionId: string): string {
  return path.join(missionsRoot(config), missionId);
}

export function missionMetaPath(config: HcmRootConfig, missionId: string): string {
  return path.join(missionDir(config, missionId), 'meta.json');
}

export function missionStatusPath(config: HcmRootConfig, missionId: string): string {
  return path.join(missionDir(config, missionId), 'status.json');
}

export function missionJournalPath(config: HcmRootConfig, missionId: string): string {
  return path.join(missionDir(config, missionId), 'journal.jsonl');
}

export function missionDecisionsPath(config: HcmRootConfig, missionId: string): string {
  return path.join(missionDir(config, missionId), 'decisions.json');
}

export function missionNextActionsPath(config: HcmRootConfig, missionId: string): string {
  return path.join(missionDir(config, missionId), 'next_actions.json');
}

export function missionEvidenceDir(config: HcmRootConfig, missionId: string): string {
  return path.join(missionDir(config, missionId), 'evidence');
}

export function missionSnapshotsDir(config: HcmRootConfig, missionId: string): string {
  return path.join(missionDir(config, missionId), 'snapshots');
}

