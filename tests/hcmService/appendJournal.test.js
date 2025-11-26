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
describe('HCM_APPEND_JOURNAL', () => {
    it('append une entrée au journal', async () => {
        const res = await service.handle({
            op: 'HCM_APPEND_JOURNAL',
            request_id: 'test-append-1',
            caller: { type: 'agent', id: 'test_agent' },
            payload: {
                mission_id: 'example-tenant-discovery-001',
                entry: {
                    author_type: 'agent',
                    author_id: 'test_agent',
                    entry_type: 'note',
                    message: 'Entrée de journal de test',
                    context: { test: true }
                }
            }
        });
        expect(res.status).toBe('ok');
        const journalPath = path_1.default.join(hcmRoot, 'state/missions/example-tenant-discovery-001/journal.jsonl');
        const raw = await promises_1.default.readFile(journalPath, 'utf-8');
        const lines = raw
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
        expect(lines.length).toBeGreaterThan(0);
    });
});
