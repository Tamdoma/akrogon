#!/usr/bin/env bun
import { parseArgs } from 'node:util';
import { z } from 'zod';
import { effectiveConfig, readGlobal, requireRepo, type Repo } from './config';
import { initialize } from './init';
import { sourcePattern } from './state';
import { type Hold } from './hold';
import { type Phase } from './routing';

const verb: string | undefined = process.argv[2];

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
            : verb === 'status'
              ? { charts: { type: 'boolean' } }
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
  case 'unhold':
    z.tuple([]).parse(positionals);
    await (await import('./hold')).unholdCommand(process.cwd());
    break;
  case 'hold-fix': {
    const [slug]: [string] = z.tuple([z.string().trim().min(1)]).parse(positionals);
    await (await import('./hold')).holdFixCommand(process.cwd(), slug);
    break;
  }
  case 'pause':
    z.tuple([]).parse(positionals);
    await (await import('./pause')).pauseCommand(verb, process.cwd());
    break;
  case 'unpause': {
    z.tuple([]).parse(positionals);
    await (await import('./pause')).pauseCommand(verb, process.cwd());
    const repo: Repo = await requireRepo(readGlobal(), process.cwd());
    const hold: Hold | undefined = (await import('./hold')).heldFor(repo.name);
    if (hold !== undefined)
      console.log(
        `held ${repo.name} on ${hold.sha}: ${hold.command}${hold.fix === undefined ? '' : ` fix ${hold.fix}`}`,
      );
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
  default:
    throw new Error(
      'Usage: akrogon <install|init|config|preflight|phase|next|pull|close|park|unpark|pause|unpause|unhold|hold-fix|sync|status>',
    );
}
