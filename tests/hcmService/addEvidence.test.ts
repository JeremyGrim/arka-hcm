import fs from 'fs/promises';
import path from 'path';
import { createHcmService } from '../../src/hcmService';

const hcmRoot = './hcm';
const service = createHcmService(hcmRoot);

describe('HCM_ADD_EVIDENCE', () => {
  it('crée une nouvelle evidence et le fichier associé', async () => {
    const res = await service.handle({
      op: 'HCM_ADD_EVIDENCE',
      request_id: 'test-evidence-1',
      caller: { type: 'agent', id: 'arka_analyst_01' },
      payload: {
        mission_id: 'example-tenant-discovery-001',
        evidence: {
          type: 'interview_synthesis',
          title: 'Evidence de test',
          summary: 'Résumé de test'
        }
      }
    });

    expect(res.status).toBe('ok');
    expect(res.data.evidence_id).toBeDefined();

    const filePath = path.join(
      hcmRoot,
      `state/missions/example-tenant-discovery-001/evidence/${res.data.evidence_id}.json`
    );
    const raw = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(raw);
    expect(json.evidence_id).toBe(res.data.evidence_id);
  });
});

