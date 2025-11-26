import fs from 'fs/promises';
import path from 'path';
import { createHcmService } from '../../src/hcmService';

const hcmRoot = './hcm';
const service = createHcmService(hcmRoot);

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

    const snapshotPath = path.join(
      hcmRoot,
      `state/missions/example-tenant-discovery-001/snapshots/${date}.day.json`
    );
    const raw = await fs.readFile(snapshotPath, 'utf-8');
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

