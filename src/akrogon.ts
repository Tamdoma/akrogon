#!/usr/bin/env bun
import { parseArgs } from 'node:util';
import { z } from 'zod';
import { effectiveConfig } from './config';
import { initialize } from './init';

const verb: string | undefined = process.argv[2];

const options: Record<string, { type: 'string' | 'boolean' }> =
  verb === 'init'
    ? { from: { type: 'string' }, toolkit: { type: 'string' } }
    : verb === 'phase'
      ? { slot: { type: 'string' }, verdict: { type: 'string' }, reason: { type: 'string' } }
      : verb === 'next' || verb === 'pull' || verb === 'park' || verb === 'unpark'
        ? { all: { type: 'boolean' } }
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
    await (await import('./phase')).phaseCommand(slug, phase, values.slot, values.verdict, values.reason);
    break;
  }
  case 'next':
    if (values.all === true && positionals.length !== 0) throw new Error('Use a target or --all, not both');
    z.array(z.string()).max(1).parse(positionals);
    await (await import('./next')).nextCommand(values.all === true ? '--all' : positionals[0]);
    break;
  case 'pull':
    z.tuple([]).parse(positionals);
    await (await import('./pull')).pullCommand(values.all === true);
    break;
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
    throw new Error('Usage: akrogon <install|init|config|phase|next|pull|park|unpark|sync|status>');
}
