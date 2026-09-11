#!/usr/bin/env bun
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';
import { resolve } from 'node:path';

const stepSchema = z.object({
  stdout: z.string(),
  stateful: z.boolean().default(false),
  stderr: z.string().default(''),
  code: z.number().int().default(0),
  delayMs: z.number().nonnegative().default(0),
  args: z.array(z.string()).optional(),
  probe: z.object({ closed: z.string(), lock: z.string(), worktree: z.string() }).optional(),
});
export type GhStep = z.input<typeof stepSchema>;
const path: string = z.string().parse(process.env.FAKE_GH);
const steps: z.output<typeof stepSchema>[] = z
  .array(stepSchema)
  .min(1)
  .parse(JSON.parse(readFileSync(path, 'utf8')));
const [step, ...remaining]: z.output<typeof stepSchema>[] = steps;
const args: string[] = process.argv.slice(2);
if (step.args !== undefined && JSON.stringify(args) !== JSON.stringify(step.args))
  throw new Error(JSON.stringify({ expected: step.args, actual: args }));
writeFileSync(path, JSON.stringify(remaining));
appendFileSync(path + '.calls', JSON.stringify({ args, cwd: process.cwd() }) + '\n');
appendFileSync(path + '.events', 'start\n');
await Bun.sleep(step.delayMs);
if (step.probe !== undefined) {
  const probe: NonNullable<GhStep['probe']> = step.probe;
  const lock: number = await Bun.spawn(['flock', '-n', probe.lock, 'true']).exited;
  if (!existsSync(probe.closed) || !existsSync(resolve(probe.worktree, '.git')) || lock !== 1)
    throw new Error(JSON.stringify({ probe, lock }));
  appendFileSync(path + '.probes', JSON.stringify({ ...probe, lock, host: process.env.GH_HOST }) + '\n');
}
if (step.stateful) {
  const statePath: string = path + '.state';
  const state: { state: 'OPEN' | 'CLOSED'; comments: string[]; attempts: number } = z
    .object({ state: z.enum(['OPEN', 'CLOSED']), comments: z.array(z.string()), attempts: z.number() })
    .parse(JSON.parse(readFileSync(statePath, 'utf8')));
  if (args[0] === 'api') {
    const pages: { body: string }[][] = [];
    for (let offset: number = 0; offset < state.comments.length; offset += 100)
      pages.push(state.comments.slice(offset, offset + 100).map((body) => ({ body })));
    process.stdout.write(JSON.stringify(pages));
  } else if (args[1] === 'view') {
    process.stdout.write(JSON.stringify({ state: state.state }));
  } else if (args[1] === 'close') {
    const commentIndex: number = args.indexOf('--comment');
    writeFileSync(
      statePath,
      JSON.stringify({
        state: step.code === 0 ? 'CLOSED' : state.state,
        comments: commentIndex === -1 ? state.comments : [...state.comments, args[commentIndex + 1]],
        attempts: state.attempts + 1,
      }),
    );
  } else {
    throw new Error(JSON.stringify({ args }));
  }
} else {
  process.stdout.write(step.stdout);
}
process.stderr.write(step.stderr);
appendFileSync(path + '.events', 'end\n');
process.exit(step.code);
