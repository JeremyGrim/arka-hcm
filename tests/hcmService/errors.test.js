"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hcmService_1 = require("../../src/hcmService");
const service = (0, hcmService_1.createHcmService)('./hcm');
describe('Erreurs HcmService', () => {
    it('renvoie MISSION_NOT_FOUND pour une mission inconnue', async () => {
        const res = await service.handle({
            op: 'HCM_GET_MISSION_CONTEXT',
            request_id: 'err-1',
            caller: { type: 'system', id: 'test' },
            payload: {
                mission_id: 'unknown-mission'
            }
        });
        expect(res.status).toBe('error');
        expect(res.error?.code).toBe('MISSION_NOT_FOUND');
    });
    it('renvoie INVALID_PAYLOAD pour un payload invalide', async () => {
        const res = await service.handle({
            op: 'HCM_APPEND_JOURNAL',
            request_id: 'err-2',
            caller: { type: 'agent', id: 'test' },
            payload: {
                mission_id: '',
                entry: null
            }
        });
        expect(res.status).toBe('error');
        expect(res.error?.code).toBe('INVALID_PAYLOAD');
    });
});
