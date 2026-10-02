import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { parseEnv } from 'node:util';
import { z } from 'zod';
import { expandPath, globalHome, type GlobalConfig } from './config';

const text = z.string().trim().min(1);

export const inputSchema = z.strictObject({
  kind: z.enum(['env', 'file']),
  name: text,
  holder: text,
  purpose: text,
  consumers: z.array(text).min(1),
  steps: text,
  source: text,
  done: text,
});

export const produceSchema = z.strictObject({
  name: text,
  holder: text,
  consumers: z.array(text),
  save: z.strictObject({ entry: text, revision: text, args: z.array(text), value_source: text }),
});

export const fixtureSchema = z.strictObject({
  account: text,
  purpose: text,
  marker: text,
  naming: text,
  count: z.number().int().positive(),
  cleanup: z.array(z.strictObject({ step: text, identity: text })).min(1),
  absence_check: text,
});

export const grantSchema = z.strictObject({
  approved: z.strictObject({ by: text, date: text, answer: text }),
  principal: text,
  account: text,
  credential: z.strictObject({ name: text, holder: text }),
  targets: z.array(text),
  fixtures: z.array(fixtureSchema),
  operations: z.array(text).min(1),
  effects: text,
  bounds: text,
  stop_line: text,
  expires: text.optional(),
});

export const retainedSchema = z.strictObject({
  resources: z.array(text).min(1),
  purpose: text,
  owner: text,
  remove_by: text,
  cost: text,
  exposure: text,
  cleanup: z.strictObject({ identity: text, route: text }),
  reason: text,
});

export const proofSchema = z.strictObject({
  operation: text,
  command: text,
  identity: text,
  target: text,
  version: text,
  date: text,
  result: text,
  cleanup: text,
  limits: text,
  record: text,
});

export const readinessSchema = z.strictObject({
  inputs: z.array(inputSchema),
  produces: z.array(produceSchema),
  grants: z.array(grantSchema),
  retained: z.array(retainedSchema),
  proofs: z.array(proofSchema),
});

export type Readiness = z.infer<typeof readinessSchema>;

export type Gap = { kind: 'env' | 'file'; name: string; holder: string; steps: string };

export function readReadiness(leafPath: string): Readiness | null {
  const file: string = resolve(leafPath, 'readiness.yaml');
  if (!existsSync(file)) return null;
  try {
    return readinessSchema.parse(Bun.YAML.parse(readFileSync(file, 'utf8')));
  } catch (cause) {
    throw new Error(`${file}: ${cause instanceof Error ? cause.message : cause}`);
  }
}

export function holderRoot(global: GlobalConfig, holder: string): string {
  if (Object.hasOwn(global.repos, holder)) return realpathSync(expandPath(global.repos[holder], globalHome()));
  if (isAbsolute(holder)) return holder;
  throw new Error(`Unknown holder ${holder}: not a registered repo or absolute path`);
}

export function gaps(global: GlobalConfig, readiness: Readiness): Gap[] {
  const missing: Gap[] = [];
  for (const input of readiness.inputs) {
    const root: string = holderRoot(global, input.holder);
    if (input.kind === 'env') {
      const envFile: string = resolve(root, '.env');
      const value: string | undefined = existsSync(envFile)
        ? parseEnv(readFileSync(envFile, 'utf8'))[input.name]
        : undefined;
      if (value === undefined || value.trim() === '')
        missing.push({ kind: input.kind, name: input.name, holder: input.holder, steps: input.steps });
    } else {
      const stat = statSync(resolve(root, input.name), { throwIfNoEntry: false });
      if (stat === undefined || stat.size === 0)
        missing.push({ kind: input.kind, name: input.name, holder: input.holder, steps: input.steps });
    }
  }
  return missing;
}
