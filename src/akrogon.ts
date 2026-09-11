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
      ? { slot: { type: 'string' }, verdict: { type: 'string' } }
      : verb === 'next'
        ? { all: { type: 'boolean' } }
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
    await (await import('./phase')).phaseCommand(slug, phase, values.slot, values.verdict);
    break;
  }
  case 'next':
    if (values.all === true && positionals.length !== 0) throw new Error('Use a target or --all, not both');
    z.array(z.string()).max(1).parse(positionals);
    await (await import('./next')).nextCommand(values.all === true ? '--all' : positionals[0]);
    break;
  case 'status':
    z.array(z.string()).max(1).parse(positionals);
    await (await import('./status')).statusCommand(positionals[0]);
    break;
  case 'install':
    z.tuple([]).parse(positionals);
    await (await import('./install')).install();
    break;
  default:
    throw new Error('Usage: akrogon <install|init|config|phase|next|status>');
}
