import type { HcmError } from './types';

export const HcmErrorCodes = {
  MISSION_NOT_FOUND: 'MISSION_NOT_FOUND',
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  IO_ERROR: 'IO_ERROR',
  ACCESS_DENIED: 'ACCESS_DENIED',
  CONFLICTING_UPDATE: 'CONFLICTING_UPDATE'
} as const;

export type HcmErrorCode = (typeof HcmErrorCodes)[keyof typeof HcmErrorCodes];

export function makeError(code: HcmErrorCode, message: string, details?: any): HcmError {
  return { code, message, details };
}

