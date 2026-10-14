import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { base, within, type Repo } from './config';
import { readBaseRuns, type BaseRun } from './base-run';
import { type Phase, type Slot } from './routing';
import { command } from './shell';
import { type Leaf, type State } from './state';

export class ComparisonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ComparisonError';
  }
}

const nonBlank: z.ZodString = z.string().trim().min(1);

const unitOutcomeSchema = z.strictObject({
  outcome: z.enum(['pass', 'fail', 'missing']),
  log: nonBlank,
});

const unitCore = {
  runner: nonBlank,
  file: z.string(),
  name: nonBlank,
  own_criterion: z.literal(true).optional(),
  leaf: unitOutcomeSchema,
  retry: unitOutcomeSchema,
  verdict: z.enum(['known-red', 'new', 'unverified']),
};

const comparedUnitSchema = z.strictObject({ ...unitCore, base: unitOutcomeSchema });
const inconsistentUnitSchema = z.strictObject(unitCore);

const greenUnitSchema = z.strictObject({
  runner: nonBlank,
  file: z.string(),
  name: nonBlank,
  leaf: unitOutcomeSchema,
});

const recordRetry = z.strictObject({
  log: nonBlank,
  complete: z.union([z.literal(true), nonBlank]),
  outcome: z.enum(['pass', 'fail']),
});

const recordCore = {
  command: z.array(z.string()).min(1),
  cwd: z.string(),
  scope: nonBlank,
  material: nonBlank,
  attempt: nonBlank.optional(),
  leaf_revision: nonBlank,
  log: nonBlank,
  run: z.strictObject({ complete: z.union([z.literal(true), nonBlank]) }),
  retry: recordRetry,
};

export const comparisonSchema = z.discriminatedUnion('state', [
  z.strictObject({
    ...recordCore,
    state: z.literal('compared'),
    counterpart_revision: nonBlank,
    base: z.strictObject({ log: nonBlank, complete: z.union([z.literal(true), nonBlank]) }),
    units: z.array(comparedUnitSchema).min(1),
  }),
  z.strictObject({
    ...recordCore,
    state: z.literal('inconsistent'),
    retry: z.strictObject({ log: nonBlank, complete: z.literal(true), outcome: z.literal('pass') }),
    units: z.array(inconsistentUnitSchema),
  }),
  z.strictObject({
    ...recordCore,
    state: z.literal('green'),
    run: z.strictObject({ complete: z.literal(true) }),
    retry: recordRetry.optional(),
    counterpart_revision: nonBlank.optional(),
    units: z.array(greenUnitSchema).min(1),
  }),
]);

export type Comparison = z.infer<typeof comparisonSchema>;
export type ComparisonUnit = Comparison['units'][number];

export async function parseComparison(file: string): Promise<Comparison> {
  if (!existsSync(file)) throw new ComparisonError('Comparison record does not exist: ' + file);
  let data: unknown;
  try {
    data = Bun.YAML.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new ComparisonError('Comparison record ' + file + ' does not parse: ' + error);
  }
  const parsed: z.ZodSafeParseResult<Comparison> = comparisonSchema.safeParse(data);
  if (!parsed.success)
    throw new ComparisonError('Comparison record ' + file + ' is invalid: ' + z.prettifyError(parsed.error));
  return parsed.data;
}

function existingLogs(record: Comparison): string[] {
  const logs: string[] = [record.log];
  if (record.retry !== undefined) logs.push(record.retry.log);
  if (record.state === 'compared') logs.push(record.base.log);
  for (const unit of record.units) {
    logs.push(unit.leaf.log);
    if ('retry' in unit) logs.push(unit.retry.log);
    if ('base' in unit) logs.push(unit.base.log);
  }
  return logs;
}

function sameCommand(a: string[], b: string[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export async function validateComparisons(
  repo: Repo,
  leaf: Leaf,
  state: State,
  slot: Slot,
  worktree: string,
  files: string[],
  requested: Phase,
  merge?: { attempt: string; built_on: string },
): Promise<Comparison[]> {
  const records: Comparison[] = [];
  for (const file of files) {
    const path: string = resolve(leaf.path, file);
    if (!within(path, leaf.path))
      throw new ComparisonError('Comparison record ' + file + ' resolves outside leaf ' + leaf.path);
    const record: Comparison = await parseComparison(path);
    for (const log of existingLogs(record))
      if (!existsSync(log)) throw new ComparisonError('Log file does not exist: ' + log);
    if (merge !== undefined && record.attempt !== merge.attempt)
      throw new ComparisonError(
        'Comparison record ' +
          file +
          ' is bound to attempt ' +
          (record.attempt ?? '(missing)') +
          ', expected ' +
          merge.attempt,
      );
    const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    if (record.leaf_revision !== head)
      throw new ComparisonError(
        merge === undefined
          ? 'leaf_revision ' + record.leaf_revision + ' does not match HEAD ' + head
          : 'Comparison record ' + file + ': leaf_revision ' + record.leaf_revision + ' does not match top ' + head,
      );
    if (record.run.complete !== true)
      throw new ComparisonError('Comparison record ' + file + ': leaf run is not complete');
    if (record.state === 'compared') {
      const counterpart: string = merge?.built_on ?? (await base(repo, worktree));
      if (record.counterpart_revision !== counterpart)
        throw new ComparisonError(
          merge === undefined
            ? 'counterpart_revision ' + record.counterpart_revision + ' does not match leaf base ' + counterpart
            : 'Comparison record ' +
                file +
                ': counterpart ' +
                record.counterpart_revision +
                ' does not match built_on ' +
                counterpart,
        );
      const prompted: string | undefined = state.prompted_at[slot];
      const candidates: BaseRun[] = readBaseRuns(repo).filter(
        (run) =>
          run.leaf === leaf.state.slug &&
          run.slot === slot &&
          run.base === record.counterpart_revision &&
          run.log === record.base.log &&
          sameCommand(run.command, record.command) &&
          (merge === undefined || run.attempt === merge.attempt),
      );
      const timed: BaseRun[] = prompted === undefined ? [] : candidates.filter((run) => run.start > prompted);
      if (timed.length === 0)
        throw new ComparisonError(
          'No base-run record matches slot ' +
            slot +
            ', leaf ' +
            leaf.state.slug +
            ', base ' +
            record.counterpart_revision +
            ', command, log ' +
            record.base.log +
            ' and start after prompted_at ' +
            (prompted ?? '(absent)'),
        );
      if (!timed.some((run) => run.end !== undefined && run.exit !== undefined))
        throw new ComparisonError('Base-run record for log ' + record.base.log + ' has no end or exit');
    }
    if (merge !== undefined && record.state === 'green' && record.retry !== undefined)
      throw new ComparisonError('Comparison record ' + file + ': a green record carries no retry');
    if (
      record.state !== 'green' &&
      (requested === 'implement' || requested === 'check.review' || requested === 'merge' || merge !== undefined)
    )
      for (const unit of record.units) {
        // At merge a green retry of the same command lets the merge continue whatever the first run's verdict.
        if (unit.verdict !== 'known-red' && !(merge !== undefined && record.state === 'inconsistent'))
          throw new ComparisonError(
            'Unit ' + unit.name + ' has verdict ' + unit.verdict + '; only known-red is admissible',
          );
        if (unit.own_criterion === true)
          throw new ComparisonError('Unit ' + unit.name + ' belongs to the leaf own criteria');
      }
    records.push(record);
  }
  return records;
}
