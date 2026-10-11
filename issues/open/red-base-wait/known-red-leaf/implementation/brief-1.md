# Brief 1 — U1: comparison record and red record modules (wave 1)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/known-red-leaf-u1

## 1. Goal

Create the two new modules the phase command will consume: `src/compare.ts` (comparison record schema + move validation) and `src/red-record.ts` (append-only red record + open/resolve under the existing global lock), and add the `log` field to the `base-runs.jsonl` record line. Plan decisions D2, D3, D4, D5, D6.

## 2. Acceptance criteria

1. `bun run typecheck` is clean with the new exports.
2. `src/base-run.ts` writes `log: <path>` on the `base-runs.jsonl` record line where the path equals the `log:` path it prints to stdout; schema tolerates older lines without `log` (`optional`).
3. `compare.ts` exports a zod schema whose parse of a valid compared record succeeds and whose parse rejects: unknown keys (e.g. `retry2`), `state` outside `inconsistent|compared`, a `compared` record missing `counterpart_revision`/`base`, an `inconsistent` record carrying counterpart fields, missing `retry`, missing `units`, blank `scope`/`runner`/`name`/`log`.
4. `validateComparisons` throws `Error` naming the field or file for each criterion-2 refusal the planned tests encode (file missing or unparsable, schema invalid, log path absent, `leaf_revision` ≠ `git rev-parse HEAD`, counterpart ≠ `git merge-base HEAD <trackingRef>`, no matching `readBaseRuns` line — wrong leaf/slot/start-before-prompted_at/base/command/log or missing `end`/`exit`, file outside `leaf.path`), and refuses any unit with `verdict !== 'known-red'` or `own_criterion` when `requested` is `implement`, `check.review` or `merge`.
5. `applyComparison`/`resolveComparison` never call `withLock`; they re-read `issues/red-records.jsonl` inside the call: a `known-red` unit with no active entry for the same unit identity and provenance appends one `opened` event and is returned for noticing; an already-active match opens nothing; a unit whose `base.outcome === 'pass'` appends `resolved` only for an active entry whose `first_seen` equals the record's `counterpart_revision` or is its ancestor (`isAncestor` from `src/batch.ts`).
6. `activeRed` folds `opened`/`resolved`/`notice` events: active entries, each with its latest notice result (`{shown, reason}` or `error`).

Your code will be exercised only by U2's wiring; write no tests. Run the schema through a throwaway `bun -e` parse check (paste the output) — do not commit a test file.

## 3. Read-first

- `src/base-run.ts` — `baseRunSchema` :23-42, `readBaseRuns` :45-55, record write :128-141, log path + print :157-168, completion rewrite :170-191. Pattern to copy for the JSONL record file.
- `src/attempts.ts` :60-100 — append-only record pattern.
- `src/config.ts` — `base(repo, cwd)` :273, `trackingRef` (from `./preflight`).
- `src/state.ts` — `Leaf`, `State` (`prompted_at` :98).
- `src/batch.ts` — `isAncestor(cwd, a, b)` :78.
- `src/routing.ts` — `Slot` type.
- `tests/compare.test.ts` — the committed contract: record YAML shape your schema must parse (see `record()` helper :127-172), fabricated `baseRunLine` fields (:64-95), fabricated `opened` event shape `openedEntry` (:215-227). Read it fully.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and interfaces

Owns: `src/compare.ts` (new), `src/red-record.ts` (new), `src/base-run.ts` (edit). No prerequisites; lands first. Nothing else may edit these files.

In `src/base-run.ts`: add `log: z.string().optional()` to `baseRunSchema`; move the `implementation` mkdir and `log` path computation before record construction and set `record.log` so the written line carries it.

`src/compare.ts` exports:

```ts
export const comparisonSchema: z.ZodType<Comparison>; // strict, discriminated on `state`
export type Comparison = { /* inferred from schema */ };
export type ComparisonUnit = { runner, file, name, own_criterion?, leaf{outcome,log}, retry{outcome,log}, base?{outcome,log}, verdict };
export declare class ComparisonError extends Error {}
export function validateComparisons(
  repo: Repo, leaf: Leaf, state: State, slot: Slot, worktree: string, files: string[],
  requested: Phase,
): Promise<Comparison[]>;
```

Schema shape (match `record()` in tests/compare.test.ts):
`command: string[] (min 1)`, `cwd: string`, `scope: string (min 1)`, `material: string (min 1)`, `leaf_revision: string (min 1)`, `log: string (min 1)`, `run: {complete: z.union([z.literal(true), z.string().min(1)])}`, `retry: {log, complete, outcome: 'pass'|'fail'}`, `state: 'inconsistent'|'compared'` discriminated: `compared` adds `counterpart_revision` + `base: {log, complete}` and requires `units: min(1)`; `inconsistent` forbids counterpart fields. Units: `runner`/`name` min 1, `file` any string, `own_criterion?: z.literal(true)`, `leaf`/`retry`: `{outcome: 'pass'|'fail'|'missing', log: min1}`, `base` same (required when record is `compared`), `verdict: 'known-red'|'new'|'unverified'`. Use `z.strictObject` so `retry2` or counterpart keys on `inconsistent` are rejected by schema.

`validateComparisons` performs, throwing `ComparisonError` naming the field/file: file resolves under `leaf.path`; exists + `Bun.YAML.parse`; schema; every `log` referenced (top-level, `retry.log`, `base.log`, every unit outcome `log`) `existsSync`; `leaf_revision === git rev-parse HEAD` in `worktree`; for `compared`: `counterpart_revision === await base(repo, worktree)` and a `readBaseRuns(repo)` line exists with `leaf === leaf.state.slug`, `slot` equal to the moving slot, `start > state.prompted_at[slot]` (absent `prompted_at` refuses), `base === counterpart_revision`, `command` deep-equal to `record.command`, `log === record.base.log`, and `end`/`exit` present; when `requested ∈ {implement, check.review, merge}` every unit `verdict === 'known-red'` and `own_criterion` absent. Errors should interpolate the field name (tests match `/state/`, `/scope/`, `/retry/`, `/leaf_revision/`, `/counterpart_revision/`, `/slot|base-run/`, `/end|exit|base-run/`, `/new|unit/`, `/unverified|unit/`, `/criterion|criteria|own/`, `/leaf|outside/`).

`src/red-record.ts` exports:

```ts
export const redEventSchema; // discriminated on event: opened|notice|resolved
export type RedEvent, RedEntry { id, unit {runner,file,name}, provenance {command,cwd,scope,material}, first_seen, at, file, notice?: {shown,reason}|{error} }
export function redRecordsPath(repo: Repo): string;              // issues/red-records.jsonl
export function readRedRecords(repo: Repo): RedEvent[];
export function activeRed(repo: Repo): RedEntry[];
export function applyComparison(repo: Repo, file: string, record: Comparison): RedEntry[];   // opens; returns entries needing a notice
export function resolveComparison(repo: Repo, file: string, record: Comparison): Promise<void>;
export function appendNotice(repo: Repo, id: string, result: {shown: boolean, reason: string} | {error: string}): void;
```

`applyComparison`: re-read, for each `compared`-record unit with `verdict === 'known-red'` and no `own_criterion`, when no active entry has identical unit identity (`runner`/`file`/`name`) and provenance (`command`/`cwd`/`scope`/`material`), append `opened` (id = `randomUUID()` short or full, `first_seen` = `counterpart_revision`, `file` = record path); return the opened entries.
`resolveComparison`: for each unit with `base.outcome === 'pass'`, re-read, for an active entry with matching identity+provenance append `resolved` (id, `resolving` = counterpart, `file`) only when `entry.first_seen === counterpart || await isAncestor(repo.root, entry.first_seen, counterpart)`. Entries never resolve on absence, other provenance or a newer `first_seen`.
`appendNotice`: append `{event:'notice', id, ...(result), at}` — errors stored as `{error: message}`.

## 5. Do-not

- No `withLock` inside red-record functions — `phase.ts` already holds the global lock; a nested `flock` deadlocks (locked decision).
- No reads of log contents; validation checks existence only.
- Do not edit `src/phase.ts`, `src/akrogon.ts`, `src/status.ts`, tests, or any doc — other units own them; return a mismatch instead.
- Do not invent extra refusals beyond section 4; return a mismatch if a test contradicts this brief.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Read the read-first files and `tests/compare.test.ts` fully.
2. `bun install` in your worktree.
3. Write `src/red-record.ts`, then `src/compare.ts`, then the `base-run.ts` edit.
4. `bun run typecheck` — clean.
5. Parse-check both schemas with `bun -e` on a valid and an invalid YAML/object each; paste output.
6. Commit your chunk as one commit `feat: add comparison record and red record modules` on the detached HEAD.

Advisory size: about 3 files, under 60 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with `AKROGON_BASE=64f27d0e3c4ae254a6aafd49ea393033dc677606` — `tests/base-run.test.ts` turns green once `log` lands on the record line; all `tests/compare.test.ts` and `tests/red-docs.test.ts` failures persist (they wait on U2/U3), and `tests/command-reference.test.ts` stays red until the README row. No other failures are yours to repair; typecheck must be clean.

## 8. Done-when, evidence and report

Fill these lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
