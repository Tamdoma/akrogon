# Brief 1: worktree-keep-rule — reconcile keep rule, lock guard and removed records (U1)

## 1. Goal

Implement plan.md decisions D1–D6 and D8 in `src/reconcile.ts` only: the sweep removes a registered worktree only when it is an akrogon kind it knows is finished, a git-locked worktree is always kept with its lock reason, and every removal is recorded in the repo's reconcile report.

## 2. Numbered acceptance criteria

1. `git worktree list --porcelain` is parsed once per pass into `Map<string, { head: string; branch?: string; locked: string | false }>` replacing the `registered: Set<string>`; `locked` is the reason text (`''` when bare `locked`), `branch` is absent when detached.
2. In the per-leaf loop, right after the `registered` check, a locked `leaf.state.worktree` is kept `locked worktree (<reason>)` (`locked worktree` when the reason is `''`). In the candidate sweep, right after the `existsSync`/`handled`/`registered` checks pass and before `knownSlugs`/leaf/kind evaluation, a locked path is kept the same way.
3. In the candidate sweep, after the leaf-slug and active-worker keeps and before the verify/batch/live/pane checks: `owner === undefined && !name.startsWith('verify-') && !name.startsWith('batch-')` keeps the path as `unmanaged worktree` — a `<name>-u<N>` whose prefix is no leaf slug lands here. Scratch kinds keep every existing rule (verify `verify-*` records, batch `.owner` records, `<leaf>-u<N>` of a finished leaf, single `--force` allowed for them).
4. `removeWorktree(repo, path, force, rule)` on success pushes `{ path, head, rule }` plus `branch` only when not detached to `removedWorktrees` (branch/head from the porcelain map) in addition to `removed.push(path)`. Rule names: `merged leaf`, `failed leaf`, `old-root migration` (active leaf's legacy-root worktree removed for recreation), `ended verify`, `dead batch owner`, `unrecorded batch`, `worker of finished leaf` (owner merged or failed). `git worktree prune` still runs when any worktree was removed (gate on `removedWorktrees.length` or equivalent).
5. `keptReportSchema` gains `removed: z.array(z.strictObject({ path: z.string(), head: z.string(), rule: z.string(), branch: z.string().optional() })).optional()`. `writeKept(file, kept, removed?)` writes `{ kept, removed }` only when `removed` is defined; `writeKeptReport(repo, kept, removed)` forwards; the host report call passes none. New export `readRemoved(repo)` mirrors `readKept` (returns `[]` when the field is absent). A report written before this change (no `removed` key) still parses.
6. The leaf's planned tests stay untouched — see Do-not. They go green only when the code above is correct.

## 3. Read-first list

- `src/reconcile.ts` — `reconcile`, `removeWorktree`, candidate sweep, `keptReportSchema`, `readReport`/`readKept`/`writeKept`/`readHostKept`. The porcelain parse and both loops are all here; copy the surrounding code style (types on every binding, `Result` for command output, `z.strictObject` schemas).
- `src/leftovers.ts` — consumer of `readKept`; `unmanaged worktree` and `locked worktree` reasons must stay outside `inUse`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Plan context if needed: `/home/ivan/Work/infra/akrogon/issues/open/live-worktree-guard/worktree-keep-rule/plan.md`.

## 4. Change list and needed interfaces

Owns: `src/reconcile.ts` only. Sibling worker owns `skills/chart-issues/SKILL.md` — do not touch it, nor any test file, nor `src/leftovers.ts`/`src/status.ts` (no change needed there; verified by A).

New/edited surface inside `src/reconcile.ts`:

```ts
type RemovedRecord = { path: string; head: string; rule: string; branch?: string };
type WorktreeRow = { head: string; branch?: string; locked: string | false };
const removedRecordSchema = z.strictObject({
  path: z.string(),
  head: z.string(),
  rule: z.string(),
  branch: z.string().optional(),
});
const keptReportSchema = z.strictObject({
  kept: z.array(z.strictObject({ path: z.string(), reason: z.string() })),
  removed: z.array(removedRecordSchema).optional(),
});
export function readRemoved(repo: Repo): RemovedRecord[] // parse + `?? []`, same readReport path or a sibling
function writeKept(file: string, kept: { path: string; reason: string }[], removed?: RemovedRecord[]): void
function writeKeptReport(repo: Repo, kept: { path: string; reason: string }[], removed: RemovedRecord[]): void
```

Inside `reconcile`: keep `const removed: string[]` (return value), add `const removedWorktrees: RemovedRecord[]`; `removeWorktree` gains `rule` and looks up `registered.get(path)` for head/branch (always present on its call paths — registered paths only). Final `writeKeptReport(repo, kept, removedWorktrees)`. The porcelain parse emits one row per `worktree <path>` stanza: `HEAD <sha>`, optional `branch refs/heads/<name>` (strip the `refs/heads/` prefix), `detached` (no branch), `locked` or `locked <reason>`.

Chunks that must land first: none — wave 1 unit.
Shared test resources: none (your targeted tests are in `tests/keep-rule.test.ts` + `tests/reconcile.test.ts`, owned by A, already committed red).

## 5. Do-not, reasons and exceptions

- Do not edit, add or delete any test file — planned tests are A's; a red or wrong planned test returns a mismatch with evidence.
- Do not touch `skills/chart-issues/SKILL.md` — owned by the sibling unit.
- Do not change any existing keep reason string, scratch-kind rule or `force` use — criterion 3 keeps today's removals; only the lock check and fallthrough are new.
- Do not add a `--force --force` path or unlock worktrees in code — the design forbids passing a lock.
- Do not return output outside `akrogon run-check` for kept command results.

Exceptions: a revised brief from A authorizing a change; a red planned test whose expectation is wrong is a mismatch, never a test edit.

## 6. Ordered steps

1. `src/reconcile.ts`: extend `keptReportSchema`, add `readRemoved`, widen `writeKept`/`writeKeptReport` (criteria 5).
2. Same file: parse porcelain into the row map (criterion 1).
3. Same file: lock keeps in both loops (criterion 2).
4. Same file: unmanaged fallthrough in the candidate sweep (criterion 3).
5. Same file: `rule` parameter + `removedWorktrees` records + prune gate + `writeKeptReport` call (criterion 4).
6. Run the targeted tests (section 7) and iterate until green.

Advisory size: 1 file, under 15 turns.

## 7. Commands

After `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'` in your worktree:

- `akrogon run-check --name 'test' -- bun test tests/keep-rule.test.ts tests/reconcile.test.ts` — the criterion tests; all must pass.
- `akrogon run-check --name 'typecheck' -- bun run typecheck` — must pass.

## 8. Done-when, evidence and report

All criteria in section 2 implemented, both commands green, one commit on the worker head (`fix:`/`feat:` message), no test files touched. Commit must not carry `issues/` paths.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
