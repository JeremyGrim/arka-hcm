#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { createHcmService } from '../hcmService';
import { HcmErrorCodes } from '../hcmService/errors';

type CliCommand = 'init' | 'check' | 'show' | 'list';

interface CliOptions {
  [key: string]: string | boolean | undefined;
}

interface ParsedArgs {
  command: CliCommand | null;
  subcommand?: string;
  options: CliOptions;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);
  const command = (args[0] as CliCommand | undefined) ?? null;
  let subcommand: string | undefined;
  let index = 1;

  if (args[1] && !args[1].startsWith('--')) {
    subcommand = args[1];
    index = 2;
  }

  const options: CliOptions = {};
  for (let i = index; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        options[key] = next;
        i++;
      } else {
        options[key] = true;
      }
    }
  }

  return { command, subcommand, options };
}

async function cmdInit(options: CliOptions): Promise<number> {
  const root = (options.path as string) ?? './hcm';
  const tenantId = options['tenant-id'] as string | undefined;
  const tenantName = (options['tenant-name'] as string | undefined) ?? tenantId;
  const env = (options['env'] as string | undefined) ?? 'dev';

  if (!tenantId) {
    // eslint-disable-next-line no-console
    console.error('Missing required option: --tenant-id');
    return 1;
  }

  try {
    const metaPath = path.join(root, 'meta.json');
    const now = new Date().toISOString();

    // Create base directories
    await fs.mkdir(root, { recursive: true });
    await fs.mkdir(path.join(root, 'stable'), { recursive: true });
    await fs.mkdir(path.join(root, 'domain'), { recursive: true });
    await fs.mkdir(path.join(root, 'state', 'missions'), { recursive: true });
    await fs.mkdir(path.join(root, 'state', 'team'), { recursive: true });
    await fs.mkdir(path.join(root, 'hindex'), { recursive: true });

    // meta.json: create only if missing
    try {
      await fs.access(metaPath);
      // eslint-disable-next-line no-console
      console.log('meta.json already exists, keeping existing file.');
    } catch {
      const meta = {
        hcm_version: '1.0.0',
        tenant_id: tenantId,
        tenant_name: tenantName ?? tenantId,
        environment: env,
        description: `Hybrid Collective Memory pour ${tenantName ?? tenantId}.`,
        created_at: now,
        updated_at: now
      };
      await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
    }

    const agentsPath = path.join(root, 'state', 'team', 'agents.json');
    const humansPath = path.join(root, 'state', 'team', 'humans.json');

    try {
      await fs.access(agentsPath);
    } catch {
      await fs.writeFile(agentsPath, JSON.stringify({ agents: [] }, null, 2), 'utf-8');
    }

    try {
      await fs.access(humansPath);
    } catch {
      await fs.writeFile(humansPath, JSON.stringify({ humans: [] }, null, 2), 'utf-8');
    }

    // eslint-disable-next-line no-console
    console.log(`HCM init: OK at ${root}`);
    return 0;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('HCM init: write error', err?.message ?? String(err));
    return 2;
  }
}

async function cmdCheck(options: CliOptions): Promise<number> {
  const root = (options.path as string) ?? './hcm';
  const metaPath = path.join(root, 'meta.json');
  const stateMissions = path.join(root, 'state', 'missions');
  const agentsPath = path.join(root, 'state', 'team', 'agents.json');
  const humansPath = path.join(root, 'state', 'team', 'humans.json');
  const stableDir = path.join(root, 'stable');
  const domainDir = path.join(root, 'domain');
  const hindexDir = path.join(root, 'hindex');

  let ok = true;
  const messages: string[] = [];

  // meta.json
  try {
    const raw = await fs.readFile(metaPath, 'utf-8');
    const meta = JSON.parse(raw);
    if (!meta.hcm_version || !meta.tenant_id || !meta.environment) {
      ok = false;
      messages.push('- meta.json: missing required fields');
    } else {
      messages.push('- meta.json: OK');
    }
  } catch (err: any) {
    ok = false;
    if (err.code === 'ENOENT') {
      messages.push('- meta.json: missing');
    } else {
      messages.push(`- meta.json: invalid (${err.message ?? String(err)})`);
    }
  }

  // Directories
  async function checkDir(dir: string, label: string) {
    try {
      const stat = await fs.stat(dir);
      if (!stat.isDirectory()) {
        ok = false;
        messages.push(`- ${label}: not a directory`);
      } else {
        messages.push(`- ${label}: present`);
      }
    } catch {
      ok = false;
      messages.push(`- ${label}: missing`);
    }
  }

  await checkDir(stableDir, 'stable/');
  await checkDir(domainDir, 'domain/');
  await checkDir(stateMissions, 'state/missions/');
  await checkDir(hindexDir, 'hindex/');

  // JSON parse for team files
  async function checkJson(file: string, label: string) {
    try {
      const raw = await fs.readFile(file, 'utf-8');
      JSON.parse(raw);
      messages.push(`- ${label}: OK (JSON valide)`);
    } catch (err: any) {
      ok = false;
      if (err.code === 'ENOENT') {
        messages.push(`- ${label}: missing`);
      } else {
        messages.push(`- ${label}: invalid JSON (${err.message ?? String(err)})`);
      }
    }
  }

  await checkJson(agentsPath, 'state/team/agents.json');
  await checkJson(humansPath, 'state/team/humans.json');

  if (ok) {
    // eslint-disable-next-line no-console
    console.log('HCM check: OK');
  } else {
    // eslint-disable-next-line no-console
    console.log('HCM check: FAILED');
  }
  // eslint-disable-next-line no-console
  console.log(messages.join('\n'));

  return ok ? 0 : 1;
}

async function cmdShowMission(options: CliOptions): Promise<number> {
  const root = (options.path as string) ?? './hcm';
  const missionId = options['mission-id'] as string | undefined;

  if (!missionId) {
    // eslint-disable-next-line no-console
    console.error('Missing required option: --mission-id');
    return 1;
  }

  const service = createHcmService(root);
  const res = await service.handle({
    op: 'HCM_GET_MISSION_CONTEXT',
    request_id: `cli-show-${Date.now()}`,
    caller: { type: 'system', id: 'hcm-cli' },
    payload: {
      mission_id: missionId,
      options: {
        include_last_entries: 5
      }
    }
  });

  if (res.status === 'error') {
    if (res.error?.code === HcmErrorCodes.MISSION_NOT_FOUND) {
      // eslint-disable-next-line no-console
      console.error(`Mission not found: ${missionId}`);
      return 2;
    }
    // eslint-disable-next-line no-console
    console.error(`Error: ${res.error?.code} - ${res.error?.message}`);
    return 1;
  }

  const { meta, status, last_journal_entries } = res.data;

  // eslint-disable-next-line no-console
  console.log(`Mission: ${meta.mission_id}`);
  // eslint-disable-next-line no-console
  console.log(`Titre   : ${meta.title}`);
  // eslint-disable-next-line no-console
  console.log(`Client  : ${meta.client_name}`);
  // eslint-disable-next-line no-console
  console.log(`Type    : ${meta.mission_type}`);
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log(`Phase   : ${status.phase}`);
  // eslint-disable-next-line no-console
  console.log(`Statut  : ${status.status}`);
  // eslint-disable-next-line no-console
  console.log(`Santé   : ${status.health}`);
  if (typeof status.progress === 'number') {
    // eslint-disable-next-line no-console
    console.log(`Avancement: ${Math.round(status.progress * 100)}%`);
  }
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('Dernières entrées de journal:');
  for (const entry of last_journal_entries ?? []) {
    // eslint-disable-next-line no-console
    console.log(
      `- [${entry.timestamp}] ${entry.author_type}/${entry.author_id} : ${entry.message}`
    );
  }

  return 0;
}

async function cmdListMissions(options: CliOptions): Promise<number> {
  const root = (options.path as string) ?? './hcm';
  const statusFilter = options.status as string | undefined;

  const service = createHcmService(root);
  const res = await service.handle({
    op: 'HCM_LIST_MISSIONS',
    request_id: `cli-list-${Date.now()}`,
    caller: { type: 'system', id: 'hcm-cli' },
    payload: {
      filters: {
        status: statusFilter
      }
    }
  });

  if (res.status === 'error') {
    // eslint-disable-next-line no-console
    console.error(`Error: ${res.error?.code} - ${res.error?.message}`);
    return 1;
  }

  const missions = res.data.missions ?? [];
  // Header
  // eslint-disable-next-line no-console
  console.log('ID                         | Titre                             | Statut       | Phase');
  // eslint-disable-next-line no-console
  console.log('---------------------------+-----------------------------------+-------------+--------');
  for (const m of missions) {
    const id = (m.mission_id ?? '').toString().padEnd(27).slice(0, 27);
    const title = (m.title ?? '').toString().padEnd(35).slice(0, 35);
    const status = (m.status ?? '').toString().padEnd(11).slice(0, 11);
    const phase = (m.phase ?? '').toString().padEnd(6).slice(0, 6);
    // eslint-disable-next-line no-console
    console.log(`${id} | ${title} | ${status} | ${phase}`);
  }

  return 0;
}

async function main() {
  const parsed = parseArgs(process.argv);

  if (!parsed.command) {
    // eslint-disable-next-line no-console
    console.error('Usage: hcm <init|check|show|list> [subcommand] [options]');
    process.exit(1);
  }

  let exitCode = 0;
  switch (parsed.command) {
    case 'init':
      exitCode = await cmdInit(parsed.options);
      break;
    case 'check':
      exitCode = await cmdCheck(parsed.options);
      break;
    case 'show':
      if (parsed.subcommand !== 'mission') {
        // eslint-disable-next-line no-console
        console.error('Usage: hcm show mission --path <path> --mission-id <id>');
        exitCode = 1;
      } else {
        exitCode = await cmdShowMission(parsed.options);
      }
      break;
    case 'list':
      if (parsed.subcommand !== 'missions') {
        // eslint-disable-next-line no-console
        console.error('Usage: hcm list missions --path <path> [--status <status>]');
        exitCode = 1;
      } else {
        exitCode = await cmdListMissions(parsed.options);
      }
      break;
    default:
      // eslint-disable-next-line no-console
      console.error(`Unknown command: ${parsed.command}`);
      exitCode = 1;
  }

  process.exit(exitCode);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();

