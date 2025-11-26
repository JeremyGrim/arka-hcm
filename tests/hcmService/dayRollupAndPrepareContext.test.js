"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const hcmService_1 = require("../../src/hcmService");
const hcmRoot = './hcm';
const service = (0, hcmService_1.createHcmService)(hcmRoot);
describe('HCM_DAY_ROLLUP et HCM_PREPARE_DAY_CONTEXT', () => {
    const date = '2025-11-26';
    it('crée un snapshot de journée et prépare un day_context', async () => {
        const rollupRes = await service.handle({
            op: 'HCM_DAY_ROLLUP',
            request_id: 'test-rollup-1',
            caller: { type: 'system', id: 'cron' },
            payload: {
                mission_id: 'example-tenant-discovery-001',
                date
            }
        });
        expect(rollupRes.status).toBe('ok');
        const snapshotPath = path_1.default.join(hcmRoot, `state/missions/example-tenant-discovery-001/snapshots/${date}.day.json`);
        const raw = await promises_1.default.readFile(snapshotPath, 'utf-8');
        const snapshot = JSON.parse(raw);
        expect(snapshot.snapshot_id).toBe(`day-${date}`);
        const ctxRes = await service.handle({
            op: 'HCM_PREPARE_DAY_CONTEXT',
            request_id: 'test-dayctx-1',
            caller: { type: 'system', id: 'cron' },
            payload: {
                mission_id: 'example-tenant-discovery-001',
                date
            }
        });
        expect(ctxRes.status).toBe('ok');
        expect(ctxRes.data.mission_id).toBe('example-tenant-discovery-001');
        expect(ctxRes.data.day_context.yesterday_snapshot.snapshot_id).toBe(`day-${date}`);
    });
});
