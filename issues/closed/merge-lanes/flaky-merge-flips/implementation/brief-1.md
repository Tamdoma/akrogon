# Brief 1: `patch_id` receipt field and cross-tree flip counting (U1)

## 1. Goal

Implement plan decisions D1–D7 in code so `akrogon flaky` counts a named unit red-then-green across a rebase when the leaf's own commits did not change and no base or landed-main run failed the unit between. Plan D1–D7 are binding; they are restated in full below.

## 2. Acceptance criteria

1. `verifyRunSchema` gains `patch_id: z.string().optional()`; every `runOnce` receipt records `patch_id` as the first whitespace field of `git diff <merge-base> <sha> | git patch-id --stable` where merge-base is `git merge-base <sha> refs/remotes/<remote>/<branch>` run in `repo.root`; when the diff is empty the field is absent from the row.
2. `flips` in `src/flaky.ts` counts, per failed named test, a red-then-green pair for items with `compares === undefined` and `scope === 'merge'` of the same leaf (`run.leaf`), keyed `leaf\0name\0command`, when the green immediately follows the red in that sequence and either the trees are equal, or `red.patch_id` is defined and equals `green.patch_id` and no breaking run (criterion in D5 below) ends strictly between them.
3. Same-tree behavior is unchanged in every other respect: nameless tests still count same-tree; `compares` runs never enter the merge-scope consecutive sequence but still pair same-tree through the existing mechanism; the pending-red map is keyed `leaf\0tree\0command` so different leaves sharing a tree no longer pair.
4. Nameless names excluded from cross-tree flips only: names starting `(script) `, names starting `(unnamed)`, `(no test name)`, `(log gone)`.
5. D5 breaking run E: a completed run (`end` set, `setup === 0`) with `r.end < e.end < g.end`, holding an entry with the same `name` and `command`, real `exit !== 0` (not `reused`, not `blocked`), failing the same test (stored `failures` else log names), where `e.compares !== undefined` OR `isAncestor(repo.root, e.sha, tip)` with `tip = git rev-parse <trackingRef>` resolved lazily (only when a candidate E needs it) and memoized per `flips` call. Before `isAncestor`, `git cat-file -e <sha>^{commit}` (exit 0 = present); an absent object is treated as not-ancestor and must not throw.
6. `bun test tests/flaky-merge.test.ts` goes green and `bun test tests/flaky.test.ts` stays green. The test file is already committed and is A's; a red or wrong test returns a mismatch, never a test edit.

## 3. Read-first list

- `src/flaky.ts` (whole file — `names`, `failedTests`, `flips`, `flakyLines`, `flakyCommand`).
- `src/verify.ts` — `verifyRunSchema`, `runOnce` (receipt literal and append site), `newRedUnits`/`knownRedReceipt` (the existing `compares`/`isAncestor`/`failedTests` reading pattern to reuse), `requireGreenReceipt`.
- `src/batch.ts` — `isAncestor(cwd, a, b)` signature and its `CommandError` on unresolvable objects.
- `src/preflight.ts` — `trackingRef(repo)` → `refs/remotes/<remote>/<branch>`.
- `src/shell.ts` — `command`/`run`/`CommandError` for git calls.
- `src/run-check.ts` — `leafFields`/`leafTarget` if you need what `run.leaf` holds.
- `tests/flaky-merge.test.ts` (committed contract — read it, do not edit it), `tests/helpers.ts` (`seedRun`, `cli`).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/verify.ts`: add `patch_id` to the run schema; add `ownPatchId(repo: Repo, sha: string): Promise<string | undefined>` (merge-base via `command`, then a shell pipe `git diff <mb> <sha> | git patch-id --stable` — pass the sha through `sh -c` args, never string-interpolated without quoting; empty output → `undefined`); call it in `runOnce` before the initial receipt append and put `patch_id` on the receipt only when defined. `passRecordSchema` in `src/verify-pass.ts` does NOT change.
- `src/flaky.ts`: rework `flips` per criteria 2–5; import `isAncestor` from `./batch` and `trackingRef` from `./preflight` (no import cycle — neither imports flaky). Store `{ item, run }` in the pending map so the red run's `patch_id`, `end`, `scope`, `leaf`, `compares` are reachable at resolution.
- Owned paths: `src/verify.ts`, `src/flaky.ts`. No other file. Tests are committed already at the lane HEAD you were created from.
- Shared test resource: none. Land first: nothing. Worker worktree creation commit: `11500af8` (filled by A at wave start).

## 5. Do-not, reasons and exceptions

- Do not edit `tests/flaky-merge.test.ts`, `tests/flaky.test.ts` or any other test file — tests are locked after planning; a wrong/red test is a mismatch returned to A.
- Do not add the field to `passRecordSchema` or forward it through the pass record — the value is derived inside `runOnce`, per plan D2.
- Do not change `names`, `failedTests`, `flakyLines`, `flakyCommand` or the printed output format — the contract is unchanged.
- Do not run `git stash` in any form — all worktrees share one stash; set work aside with a WIP commit and, before returning, `git reset --soft 11500af8` and make the unit's returned commit once.
- Do not broaden the same-tree key beyond adding `leaf` — today's command-only matching inside one leaf is the contract.
- Do not resolve `tip` eagerly — a flaky run on a repo with no between-candidates must not need the tracking ref; laziness is also what keeps fixture tests with fake shas from ever calling git.
- Do not run `akrogon verify` or any configured `checks` command — A owns those; run only the section 7 commands. Keep output via `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. `src/verify.ts`: schema field + `ownPatchId` + receipt write. Criterion 1.
2. `src/flaky.ts`: `flips` rework (pending map entry shape, leaf-scoped same-tree key, merge consecutive sequence, nameless filter, between-guard with lazy tip and `cat-file -e`). Criteria 2–5.
3. `bun test tests/flaky-merge.test.ts` — all 7 green. Criterion 6.
4. `bun test tests/flaky.test.ts` — all 8 green (no regression).
5. Commit once on the detached HEAD, message like `feat: flaky counts red-then-green across a rebase with unchanged own commits`.

Advisory size: about 2 files and under 16 turns; work clearly beyond it returns a mismatch with evidence.

## 7. Commands

- `bun install --frozen-lockfile --backend=copyfile` once first in your worktree.
- `akrogon run-check --name flaky-merge -- bun test tests/flaky-merge.test.ts`
- `akrogon run-check --name flaky-existing -- bun test tests/flaky.test.ts`

No other test command; the full suite and `akrogon verify` belong to A.

## 8. Done-when, evidence and report

Done when all 7 tests in `tests/flaky-merge.test.ts` pass, all 8 in `tests/flaky.test.ts` pass, the diff touches only `src/verify.ts` and `src/flaky.ts`, and one commit exists on top of `11500af8` with its hash reported. Paste the `check <label>: <exit> <path>` lines and the test summary counts.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
