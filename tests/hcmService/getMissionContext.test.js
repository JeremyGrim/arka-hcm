"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hcmService_1 = require("../../src/hcmService");
const service = (0, hcmService_1.createHcmService)('./hcm');
describe('HCM_GET_MISSION_CONTEXT', () => {
    it('retourne le contexte de mission pour example-tenant-discovery-001', async () => {
        const res = await service.handle({
            op: 'HCM_GET_MISSION_CONTEXT',
            request_id: 'test-1',
            caller: { type: 'system', id: 'test' },
            payload: {
                mission_id: 'example-tenant-discovery-001',
                options: { include_decisions: true, include_next_actions: true, include_last_entries: 2 }
            }
        });
        expect(res.status).toBe('ok');
        expect(res.data.mission_id).toBe('example-tenant-discovery-001');
        expect(res.data.meta).toBeDefined();
        expect(res.data.status).toBeDefined();
    });
});
