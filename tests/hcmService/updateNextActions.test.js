"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hcmService_1 = require("../../src/hcmService");
const hcmRoot = './hcm';
const service = (0, hcmService_1.createHcmService)(hcmRoot);
describe('HCM_UPDATE_NEXT_ACTIONS', () => {
    it('crée et met à jour des actions', async () => {
        const createRes = await service.handle({
            op: 'HCM_UPDATE_NEXT_ACTIONS',
            request_id: 'test-actions-1',
            caller: { type: 'agent', id: 'arka_pmo_01' },
            payload: {
                mission_id: 'example-tenant-discovery-001',
                actions: [
                    {
                        title: 'Action de test 1',
                        description: 'Desc',
                        owner_type: 'agent',
                        owner_id: 'arka_pmo_01',
                        priority: 'high',
                        status: 'todo'
                    }
                ]
            }
        });
        expect(createRes.status).toBe('ok');
        const created = createRes.data.next_actions.find((a) => a.title === 'Action de test 1');
        expect(created).toBeDefined();
        const updateRes = await service.handle({
            op: 'HCM_UPDATE_NEXT_ACTIONS',
            request_id: 'test-actions-2',
            caller: { type: 'agent', id: 'arka_pmo_01' },
            payload: {
                mission_id: 'example-tenant-discovery-001',
                actions: [
                    {
                        action_id: created.action_id,
                        status: 'done'
                    }
                ]
            }
        });
        expect(updateRes.status).toBe('ok');
        const updated = updateRes.data.next_actions.find((a) => a.action_id === created.action_id);
        expect(updated.status).toBe('done');
    });
});
