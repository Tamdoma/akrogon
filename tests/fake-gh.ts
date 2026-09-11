#!/usr/bin/env bun
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';
import { resolve } from 'node:path';

const stepSchema = z.object({
  stdout: z.string(),
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
process.stdout.write(step.stdout);
process.stderr.write(step.stderr);
appendFileSync(path + '.events', 'end\n');
process.exit(step.code);
