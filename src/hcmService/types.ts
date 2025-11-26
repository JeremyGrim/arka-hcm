export type HcmOp =
  | 'HCM_GET_MISSION_CONTEXT'
  | 'HCM_APPEND_JOURNAL'
  | 'HCM_ADD_EVIDENCE'
  | 'HCM_UPDATE_NEXT_ACTIONS'
  | 'HCM_GET_DECISIONS'
  | 'HCM_LIST_MISSIONS'
  | 'HCM_SNAPSHOT_MISSION'
  | 'HCM_DAY_ROLLUP'
  | 'HCM_PREPARE_DAY_CONTEXT'
  | 'HCM_ROTATE_JOURNAL';

export interface HcmRequest {
  op: HcmOp;
  request_id: string;
  caller: {
    type: 'agent' | 'human' | 'system';
    id: string;
  };
  payload: any;
}

export interface HcmError {
  code: string;
  message: string;
  details?: any;
}

export interface HcmResponse {
  request_id: string;
  op: HcmOp;
  status: 'ok' | 'error';
  error: HcmError | null;
  data: any;
}

export interface HcmService {
  handle(request: HcmRequest): Promise<HcmResponse>;
}

export type HcmRootConfig = {
  hcmRoot: string;
};

