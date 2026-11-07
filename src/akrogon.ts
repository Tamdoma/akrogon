#!/usr/bin/env bun
import { parseArgs } from 'node:util';
import { z } from 'zod';
import {
  currentRepo,
  effectiveConfig,
  readGlobal,
  requireRepo,
  type GlobalConfig,
  type Repo,
  type SlotConfig,
} from './config';
import { initialize } from './init';
import { sourcePattern } from './state';
import { slotSchema, type Phase } from './routing';
import { migrateStateHome } from './state-home';
import type { SpaceResolution } from './hc';
import type { Started } from './seat';

await migrateStateHome();

const RETIRED_MERGE_HOLD: string =
  'Merge hold commands are retired; a red merge run follows the red-run endings in skills/merge-issue/SKILL.md';

const verb: string | undefined = process.argv[2];
if (verb === 'unhold' || verb === 'hold-fix') throw new Error(RETIRED_MERGE_HOLD);

const options: Record<string, { type: 'string' | 'boolean' }> =
  verb === 'init'
    ? { from: { type: 'string' }, toolkit: { type: 'string' } }
    : verb === 'phase'
      ? {
          slot: { type: 'string' },
          verdict: { type: 'string' },
          reason: { type: 'string' },
          check: { type: 'boolean' },
          attempt: { type: 'string' },
        }
      : verb === 'land'
        ? { attempt: { type: 'string' } }
        : verb === 'next'
          ? { all: { type: 'boolean' }, resume: { type: 'boolean' }, wake: { type: 'boolean' } }
          : verb === 'seat'
            ? {
                task: { type: 'string' },
                slot: { type: 'string' },
                harness: { type: 'string' },
                model: { type: 'string' },
                effort: { type: 'string' },
              }
            : verb === 'pull' || verb === 'park' || verb === 'unpark' || verb === 'stop'
              ? { all: { type: 'boolean' } }
              : verb === 'close'
                ? { by: { type: 'string' } }
                : verb === 'run-check'
                  ? { name: { type: 'string' }, leaf: { type: 'string' }, holder: { type: 'string' } }
                  : verb === 'verify'
                    ? {
                        sha: { type: 'string' },
                        attempt: { type: 'string' },
                        holder: { type: 'string' },
                        'known-red': { type: 'boolean' },
                      }
                    : verb === 'status'
                      ? { charts: { type: 'boolean' }, json: { type: 'boolean' } }
                      : verb === 'timing'
                        ? { cohort: { type: 'boolean' }, flow: { type: 'boolean' }, since: { type: 'string' } }
                        : {};

const { values, positionals } = parseArgs({
  args: process.argv.slice(3),
  options,
  allowPositionals: true,
  strict: true,
});

switch (verb) {
  case 'config':
    z.tuple([]).parse(positionals);
    console.log(await effectiveConfig(process.cwd()));
    break;
  case 'preflight':
    z.tuple([]).parse(positionals);
    await (await import('./preflight')).preflightCommand(process.cwd());
    break;
  case 'init':
    z.tuple([]).parse(positionals);
    await initialize(
      process.cwd(),
      z.string().optional().parse(values.from),
      z.string().optional().parse(values.toolkit),
    );
    break;
  case 'phase': {
    const [slug, phase]: [string, string] = z.tuple([z.string(), z.string()]).parse(positionals);
    const { phaseCommand, MoveCommittedError } = await import('./phase');
    const { mergeWake, phaseWake } = await import('./next');
    let committed: { repo: Repo; to?: Phase } | undefined;
    try {
      const result: { repo: Repo; committed: boolean; to?: Phase } = await phaseCommand(
        slug,
        phase,
        values.slot,
        values.verdict,
        values.reason,
        values.check,
        values.attempt,
      );
      if (result.committed) committed = result;
    } catch (error) {
      if (error instanceof MoveCommittedError) committed = error;
      throw error;
    } finally {
      if (committed !== undefined) {
        await mergeWake(readGlobal(), committed.repo, committed.to);
        await phaseWake(readGlobal(), committed.repo, slug);
      }
    }
    break;
  }
  case 'land': {
    const [slug]: [string] = z.tuple([z.string()]).parse(positionals);
    await (await import('./land')).landCommand(slug, z.string().trim().min(1).parse(values.attempt));
    break;
  }
  case 'next':
    if (
      positionals.length + Number(values.all === true) + Number(values.resume === true) + Number(values.wake === true) >
      1
    )
      throw new Error('Use a target, --all, --resume or --wake, not combined');
    await (
      await import('./next')
    ).nextCommand(
      values.wake === true
        ? '--wake'
        : values.resume === true
          ? '--resume'
          : values.all === true
            ? '--all'
            : positionals[0],
    );
    break;
  case 'seat': {
    const task: string | undefined = z.string().trim().min(1).optional().parse(values.task);
    if (positionals.length > 0) {
      const [slug, slot]: [string, 'A' | 'B'] = z.tuple([z.string(), slotSchema]).parse(positionals);
      if (values.slot !== undefined || values.harness !== undefined || values.model !== undefined)
        throw new Error('Use <slug> <A|B> or --slot with --harness, --model and --effort, not both');
      await (await import('./next')).seatCommand(slug, slot, task);
      break;
    }
    const caller: string | undefined = process.env.HC_TERMINAL_ID;
    if (caller === undefined || caller === '')
      throw new Error('akrogon seat --slot runs only inside an hc terminal: HC_TERMINAL_ID is not set');
    const letter: string = z
      .string()
      .regex(/^[a-z]$/i, 'slot must be one letter')
      .parse(values.slot)
      .toLowerCase();
    const config: SlotConfig = {
      harness: z.string().min(1).parse(values.harness),
      model: z.string().min(1).parse(values.model),
      effort: z.string().min(1).parse(values.effort),
    };
    const global: GlobalConfig = readGlobal();
    const repo: Repo = await requireRepo(global, process.cwd());
    const space: SpaceResolution = await (await import('./hc')).repoSpace(repo);
    if (!space.ok) throw new Error(space.reason);
    const started: Started | null = await (
      await import('./seat')
    ).startConsultant(global, repo, { session: space.session, space: space.space.id }, caller, letter, config, task);
    if (started?.outcome === 'failed') process.exitCode = 1;
    break;
  }
  case 'pull':
    z.tuple([]).parse(positionals);
    await (await import('./pull')).pullCommand(values.all === true);
    break;
  case 'close': {
    const [source]: [string] = z.tuple([z.string().regex(sourcePattern)]).parse(positionals);
    const by: string = z.string().trim().min(1).parse(values.by);
    await (await import('./pull')).closeCommand(source, by);
    break;
  }
  case 'sync':
    z.tuple([]).parse(positionals);
    await (await import('./sync')).syncCommand(process.cwd());
    break;
  case 'pack': {
    if (positionals.length === 0)
      throw new Error('Usage: akrogon pack issues/closed/<owner> | issues/chart/<chart> ...');
    const repo: Repo = await requireRepo(readGlobal(), process.cwd());
    process.exitCode = await (await import('./pack-command')).packCommand(repo, positionals, process.cwd());
    break;
  }
  case 'park':
  case 'unpark':
    if (values.all === true && positionals.length !== 0) throw new Error('Use issue names or --all, not both');
    if (values.all !== true && positionals.length === 0) throw new Error('Name at least one issue or pass --all');
    await (await import('./park')).parkCommand(verb, positionals, values.all === true, process.cwd());
    break;
  case 'pause':
    z.tuple([]).parse(positionals);
    await (await import('./pause')).pauseCommand(verb, process.cwd());
    break;
  case 'unpause': {
    z.tuple([]).parse(positionals);
    await (await import('./pause')).pauseCommand(verb, process.cwd());
    const repo: Repo = await requireRepo(readGlobal(), process.cwd());
    await (await import('./next')).unpausePass(repo);
    break;
  }
  case 'stop':
    if (positionals.length + Number(values.all === true) !== 1) throw new Error('Usage: akrogon stop <slug> | --all');
    await (await import('./stop')).stopCommand(positionals[0], values.all === true, process.cwd());
    break;
  case 'stop-run':
    z.array(z.string()).max(1).parse(positionals);
    await (await import('./stop-run')).stopRunCommand(positionals[0]);
    break;
  case 'start': {
    const [slug]: [string] = z.tuple([z.string()]).parse(positionals);
    await (await import('./stop')).startCommand(slug, process.cwd());
    break;
  }
  case 'status':
    if (values.charts === true && positionals.length !== 0) throw new Error('Use a slug or --charts, not both');
    if (values.json === true && (positionals.length !== 0 || values.charts === true))
      throw new Error('Use --json alone: akrogon status --json');
    z.array(z.string()).max(1).parse(positionals);
    await (await import('./status')).statusCommand(positionals[0], values.charts === true, values.json === true);
    break;
  case 'leftovers':
    z.tuple([]).parse(positionals);
    await (await import('./leftovers')).leftoversCommand(process.cwd());
    break;
  case 'listen':
    z.tuple([]).parse(positionals);
    await (await import('./listen')).listenCommand();
    break;
  case 'install':
    z.tuple([]).parse(positionals);
    await (await import('./install')).install();
    break;
  case 'timing': {
    const usage: string = 'Usage: akrogon timing <slug> | --cohort --since <iso> | --flow --since <YYYY-MM-DD>';
    const gate: boolean = values.cohort === true || values.flow === true;
    if (
      (values.cohort === true && values.flow === true) ||
      (gate && (values.since === undefined || positionals.length !== 0)) ||
      (!gate && (values.since !== undefined || positionals.length !== 1))
    )
      throw new Error(usage);
    await (
      await import('./timing-report')
    ).timingCommand(
      process.cwd(),
      values.cohort === true
        ? { since: z.iso.datetime().parse(values.since) }
        : values.flow === true
          ? { flow: z.iso.date().parse(values.since) }
          : { slug: positionals[0] },
    );
    break;
  }
  case 'flaky':
    z.tuple([]).parse(positionals);
    await (await import('./flaky')).flakyCommand(process.cwd());
    break;
  case 'log': {
    const [recorded]: [string] = z.tuple([z.string()]).parse(positionals);
    const global: GlobalConfig = readGlobal();
    const repo: Repo | null = await currentRepo(global, process.cwd());
    const { readLog, readLogAcross } = await import('./evidence');
    const bytes: Uint8Array =
      repo === null
        ? await readLogAcross(global, recorded, process.cwd())
        : await readLog(repo, recorded, process.cwd());
    process.stdout.write(bytes);
    break;
  }
  case 'run-check': {
    const optional: z.ZodOptional<z.ZodString> = z.string().optional();
    process.exitCode = await (
      await import('./run-check')
    ).runCheck(
      process.cwd(),
      optional.parse(values.name),
      optional.parse(values.leaf),
      optional.parse(values.holder),
      positionals,
    );
    break;
  }
  case 'verify': {
    z.tuple([]).parse(positionals);
    const optional: z.ZodOptional<z.ZodString> = z.string().trim().min(1).optional();
    process.exitCode = await (
      await import('./verify')
    ).verify(
      process.cwd(),
      optional.parse(values.sha),
      optional.parse(values.attempt),
      optional.parse(values.holder),
      values['known-red'] === true,
    );
    break;
  }
  case 'verify-pass': {
    const [dir]: [string] = z.tuple([z.string()]).parse(positionals);
    await (await import('./verify')).verifyPassCommand(dir);
    break;
  }
  case 'guard':
    process.exitCode = await (await import('./guard')).guard(process.cwd(), positionals);
    break;
  case 'rollback':
    z.tuple([]).parse(positionals);
    await (await import('./rollback')).rollback();
    break;
  default:
    throw new Error(
      'Usage: akrogon <install|listen|init|config|preflight|phase|land|next|seat|pull|close|park|unpark|pause|unpause|stop|stop-run|start|sync|status|leftovers|timing|flaky|log|run-check|verify|guard|pack|rollback>',
    );
}
