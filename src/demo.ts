import { createHcmService } from './hcmService';

async function main() {
  const service = createHcmService();
  const response = await service.handle({
    op: 'HCM_GET_MISSION_CONTEXT',
    request_id: 'demo-1',
    caller: { type: 'system', id: 'demo' },
    payload: {
      mission_id: 'example-tenant-discovery-001',
      options: {
        include_decisions: true,
        include_next_actions: true,
        include_last_entries: 3
      }
    }
  });

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(response, null, 2));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

