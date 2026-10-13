#!/usr/bin/env bun
import { parseArgs } from 'node:util';
import { z } from 'zod';
import { effectiveConfig, readGlobal, requireRepo, type Repo } from './config';
import { initialize } from './init';
import { sourcePattern } from './state';
import { type Phase } from './routing';

const RETIRED_MERGE_HOLD: string =
  'Merge hold commands are retired; a base-red merge run follows the known-red comparison rule in skills/merge-issue/SKILL.md';

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
          compare: { type: 'string', multiple: true } as { type: 'string' },
          'red-on-base': { type: 'string' },
          command: { type: 'string' },
          culprit: { type: 'string' },
        }
      : verb === 'next'
        ? { all: { type: 'boolean' }, resume: { type: 'boolean' } }
        : verb === 'pull' || verb === 'park' || verb === 'unpark'
          ? { all: { type: 'boolean' } }
          : verb === 'close'
            ? { by: { type: 'string' } }
            : verb === 'run-check'
              ? { name: { type: 'string' }, leaf: { type: 'string' }, holder: { type: 'string' } }
              : verb === 'base-run'
                ? { base: { type: 'string' }, attempt: { type: 'string' }, cwd: { type: 'string' } }
                : verb === 'status'
                  ? { charts: { type: 'boolean' } }
                  : verb === 'timing'
                    ? { cohort: { type: 'boolean' }, since: { type: 'string' } }
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
    const { mergeWake } = await import('./next');
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
        values['red-on-base'],
        values.command,
        values.culprit,
        undefined,
        z.array(z.string()).optional().parse(values.compare),
      );
      if (result.committed) committed = result;
    } catch (error) {
      if (error instanceof MoveCommittedError) committed = error;
      throw error;
    } finally {
      if (committed !== undefined) await mergeWake(readGlobal(), committed.repo, committed.to);
    }
    break;
  }
  case 'next':
    if (positionals.length + Number(values.all === true) + Number(values.resume === true) > 1)
      throw new Error('Use a target, --all or --resume, not combined');
    await (
      await import('./next')
    ).nextCommand(values.resume === true ? '--resume' : values.all === true ? '--all' : positionals[0]);
    break;
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
  case 'status':
    if (values.charts === true && positionals.length !== 0) throw new Error('Use a slug or --charts, not both');
    z.array(z.string()).max(1).parse(positionals);
    await (await import('./status')).statusCommand(positionals[0], values.charts === true);
    break;
  case 'install':
    z.tuple([]).parse(positionals);
    await (await import('./install')).install();
    break;
  case 'timing': {
    if (values.cohort === true && (values.since === undefined || positionals.length !== 0))
      throw new Error('Usage: akrogon timing --cohort --since <iso>');
    if (values.cohort !== true && (values.since !== undefined || positionals.length !== 1))
      throw new Error('Usage: akrogon timing <slug>');
    await (
      await import('./timing-report')
    ).timingCommand(
      process.cwd(),
      values.cohort === true ? { since: z.iso.datetime().parse(values.since) } : { slug: positionals[0] },
    );
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
  case 'base-run': {
    const baseSha: string = z.string().trim().min(1).parse(values.base);
    if (positionals.length === 0)
      throw new Error('Usage: akrogon base-run --base <sha> [--attempt <id>] [--cwd <rel>] -- <argv>...');
    const optional: z.ZodOptional<z.ZodString> = z.string().optional();
    process.exitCode = await (
      await import('./base-run')
    ).baseRun(process.cwd(), baseSha, optional.parse(values.attempt), optional.parse(values.cwd), positionals);
    break;
  }
  case 'guard':
    process.exitCode = await (await import('./guard')).guard(process.cwd(), positionals);
    break;
  default:
    throw new Error(
      'Usage: akrogon <install|init|config|preflight|phase|next|pull|close|park|unpark|pause|unpause|sync|status|timing|run-check|base-run|guard>',
    );
}
