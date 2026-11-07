#!/usr/bin/env bun
// Strict fake herdr-app: answers only the calls akrogon makes (ls, do tab.rename, do tab.close)
// from the plan in $FAKE_HERDR_APP and records every call with its HERDR_APP_HOME. Any other
// call is recorded as unplanned and refused, so a test fails on an unexpected call.
// Answers follow herdr-app 0.1.13 as captured by the window tier (forks/proofs.md P7).
import { readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';

const planSchema = z.object({
  window: z.enum(['open', 'closed']),
  rename: z.enum(['ok', 'fail']).default('ok'),
  calls: z.array(z.object({ argv: z.array(z.string()), home: z.string().nullable(), planned: z.boolean() })),
});
type Plan = z.infer<typeof planSchema>;

const file: string = z.string().min(1).parse(process.env.FAKE_HERDR_APP);
const plan: Plan = planSchema.parse(JSON.parse(readFileSync(file, 'utf8')));
const argv: string[] = process.argv.slice(2);
const home: string | null = process.env.HERDR_APP_HOME ?? null;
const planned: boolean =
  (argv.length === 1 && argv[0] === 'ls') ||
  (argv.length === 6 && argv[0] === 'do' && argv[1] === 'tab.rename' && argv[2] === '--id' && argv[4] === '--name') ||
  (argv.length === 4 && argv[0] === 'do' && argv[1] === 'tab.close' && argv[2] === '--id');
writeFileSync(file, JSON.stringify({ ...plan, calls: [...plan.calls, { argv, home, planned }] }));
if (!planned) {
  process.stderr.write(`fake herdr-app: unplanned call ${JSON.stringify(argv)}\n`);
  process.exit(99);
}
if (plan.window === 'closed') {
  process.stderr.write(
    `herdr-app: no Herdr window at ${home}/herdr-app.sock: No such file or directory (os error 2)\n`,
  );
  process.exit(1);
}
if (argv[0] === 'ls') {
  process.stdout.write('herdr-app window\n');
  process.exit(0);
}
if (argv[1] === 'tab.rename' && plan.rename === 'fail') {
  process.stderr.write(`herdr-app: tab.rename failed: tab ${argv[3]} not found\n`);
  process.exit(1);
}
process.stdout.write('{"ok":true}\n');
