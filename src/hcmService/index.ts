import type { HcmService, HcmRequest, HcmResponse, HcmRootConfig } from './types';
import { makeError, HcmErrorCodes } from './errors';
import { getMissionContext } from './ops/getMissionContext';
import { appendJournal } from './ops/appendJournal';
import { addEvidence } from './ops/addEvidence';
import { updateNextActions } from './ops/updateNextActions';
import { getDecisions } from './ops/getDecisions';
import { listMissions } from './ops/listMissions';
import { snapshotMission } from './ops/snapshotMission';
import { dayRollup } from './ops/dayRollup';
import { prepareDayContext } from './ops/prepareDayContext';
import { rotateJournal } from './ops/rotateJournal';

export * from './types';
export * from './errors';

export function createHcmService(root?: string): HcmService {
  const config: HcmRootConfig = {
    hcmRoot: root ?? process.env.HCM_ROOT ?? './hcm'
  };

  return {
    async handle(request: HcmRequest): Promise<HcmResponse> {
      const baseResponse: Omit<HcmResponse, 'data' | 'status' | 'error'> = {
        request_id: request.request_id,
        op: request.op
      };

      try {
        let data: any;
        switch (request.op) {
          case 'HCM_GET_MISSION_CONTEXT':
            data = await getMissionContext(config, request.payload);
            break;
          case 'HCM_APPEND_JOURNAL':
            data = await appendJournal(config, request.payload);
            break;
          case 'HCM_ADD_EVIDENCE':
            data = await addEvidence(config, request.caller, request.payload);
            break;
          case 'HCM_UPDATE_NEXT_ACTIONS':
            data = await updateNextActions(config, request.payload);
            break;
          case 'HCM_GET_DECISIONS':
            data = await getDecisions(config, request.payload);
            break;
          case 'HCM_LIST_MISSIONS':
            data = await listMissions(config, request.payload);
            break;
          case 'HCM_SNAPSHOT_MISSION':
            data = await snapshotMission(config, request.payload);
            break;
          case 'HCM_DAY_ROLLUP':
            data = await dayRollup(config, request.payload);
            break;
          case 'HCM_PREPARE_DAY_CONTEXT':
            data = await prepareDayContext(config, request.payload);
            break;
          case 'HCM_ROTATE_JOURNAL':
            data = await rotateJournal(config, request.payload);
            break;
          default:
            throw makeError(HcmErrorCodes.INVALID_PAYLOAD, `Unknown op: ${request.op}`);
        }

        return {
          ...baseResponse,
          status: 'ok',
          error: null,
          data
        };
      } catch (err: any) {
        const hcmError =
          err && err.code && Object.values(HcmErrorCodes).includes(err.code)
            ? err
            : makeError(HcmErrorCodes.IO_ERROR, 'Unexpected error', { error: String(err) });

        return {
          ...baseResponse,
          status: 'error',
          error: hcmError,
          data: null
        };
      }
    }
  };
}

