# Sub-brief 1: `--culprit` command and tests

## 1. Goal

Implement plan.md D1-D3 (and the command half of D5): `akrogon phase <holder> check.fix --slot B --attempt <id> --culprit <slug>` ejects one leaf from a red batch. Plus the new `tests/culprit.test.ts` proving brief done-criteria 1-5.

## 2. Numbered acceptance criteria

1. A batch of holder H and members M1, M2 ended with `--culprit M1` leaves H and M2 in `merge` at their saved heads, M1 in `check.fix` at its saved head with `merge_stamp` unchanged and `fix_rounds` one higher, `batch: undefined` on the holder, and one attempt line `{ outcome: 'ejected', culprit: 'M1', members: [M1, M2] }`. Command stdout contains `ejected M1` and `moved check.fix`.
2. A culprit whose `fix_rounds` already reaches configured `fix_rounds` ends `failed` with `failure.cause === 'attempts'`, `failure.phase === 'merge'` and `reason 'fix rounds exhausted'` (the shared cap inside `transition`; no special-casing).
3. `--culprit H` on the same batch leaves M1 and M2 in `merge` at saved heads and moves H to `check.fix`.
4. Refusals, each exiting nonzero, naming its reason, and leaving `batch`, every branch, every worktree and `merge-attempts.jsonl` untouched: stale or missing `--attempt`; `--culprit` naming a slug that is not the holder or a member still in `merge`; a dirty culprit worktree; `--culprit` without `--slot B`; `--culprit` on `merged` or another phase; `--culprit` combined with `--check` or `--red-on-base`; a merge leaf holding no batch record.
5. `check.fix` without `--culprit` still prints `batch split, holder keeps <n> of <m> members` (existing tests in `tests/batch-merge.test.ts` and `tests/merge-attempts.test.ts` cover this; do not duplicate beyond the criteria 1-4 file).

## 3. Read-first list

- `src/phase.ts:238-320` (`transition` guards and cap), `src/phase.ts:382-396` (`memberEntries`), `src/phase.ts:774-883` (`phaseCommand`; the `--red-on-base` ending at 811-843 is the exact shape to mirror), `src/akrogon.ts:14-27,58-78` (options map and dispatch).
- `src/batch.ts:93-125`, `src/attempts.ts` (`appendAttempt(repo, holder, batch, outcome, culprit)` already takes the culprit), `src/state.ts:35-95` (`Batch`, `BatchMember`), `src/routing.ts:47-56`.
- `tests/merge-attempts.test.ts` — copy its `batchFixture`/`soloFixture`/`branchAt`/`attemptLines`/`headOf` helpers and `AKROGON_LEAF_TEMP_ROOT` boilerplate verbatim into the new file (its record includes `started`).
- `tests/hold.test.ts:358-425` — the refusal test shape to mirror.
- `ponytail.md` in the implement-issue skill folder.

## 4. Change list and needed interfaces

- `src/akrogon.ts`: add `culprit: { type: 'string' }` to the `phase` options record; pass `values.culprit` as a new trailing `rawCulprit` argument to `phaseCommand`.
- `src/phase.ts`: `phaseCommand` gains trailing `rawCulprit`; parse `const culprit = z.string().trim().min(1).optional().parse(rawCulprit)`. Upfront checks (before the lock, beside the `redOnBase` block), in this order:
  1. `if (check && culprit !== undefined) throw new Error('--check cannot combine with --culprit')`
  2. `if (culprit !== undefined && requested !== 'check.fix') throw new Error('--culprit is only valid for check.fix')`
  3. `if (culprit !== undefined && redOnBase !== undefined) throw new Error('--culprit cannot combine with --red-on-base')`
  4. `if (culprit !== undefined && slot !== 'B') throw new Error('--culprit requires --slot B')`
- `src/phase.ts`, inside the existing `leaf.state.phase === 'merge' && record !== undefined && (requested === 'merged' || requested === 'check.fix')` block (inside `.lock`), a new `else if (culprit !== undefined)` branch between the `redOnBase` branch and `requested === 'merged'`:
  - Membership: culprit leaf is the holder (`leaf.state.slug === culprit`, use `leaf`) or a slug in `memberEntries(repo, record)` (use its `entry.leaf`); otherwise throw `Error(\`--culprit ${culprit} is not the holder or a carried member of ${leaf.state.slug}\`)`. A member whose leaf left `merge` is absent from `memberEntries` and is refused by the same message.
  - `savedHead`: member culprit → `entry.member.head`; holder culprit → `record.solo === true ? 'HEAD' : record.holder.head`.
  - Preflight, mirroring the merge → check.fix guards of `transition`, all throwing before any write: `culpritLeaf.state.done.includes('B')` → `` `--culprit ${culprit}: slot B already recorded` ``; `await requireClean(culpritLeaf.state.worktree)`; `await requireNoIssueFiles(repo, culpritLeaf.state.worktree!, culpritLeaf.path, target(repo), savedHead)`; `await requireTestChangeCitations(repo, culpritLeaf.state.worktree!, target(repo), savedHead)`. Guard the `worktree!` non-null assertion the same way `transition` does: run those two calls only when `culpritLeaf.state.worktree !== undefined`.
  - Writes, in this order: `await restoreMembers(repo, memberEntries(repo, record).map((entry) => ({ ...entry.member, leaf: entry.leaf })))`; `await restoreHolder(repo, leaf, record)` (no-ops on solo); `saveState(leaf.path, { ...readState(leaf.path), batch: undefined })`; `appendAttempt(repo, leaf.state.slug, record, 'ejected', culprit)`; `console.log(\`ejected ${culprit}\`)`; `await transition(repo, culpritLeaf, 'check.fix', 'B', undefined, undefined, false, onCommitted)` — pass `undefined` for verdict and reason, explicit `'B'` for slot. No `batch_limit`, no `solo` marks.
  - `memberEntries` already returns `{ member, leaf }` entries; recompute it once per use site as the surrounding code does.
- `tests/culprit.test.ts` (new file): `test.serial` tests for criteria 1-4. Pause the repo (`cli(f, ['pause'])`) before the ending call where you assert `batch: undefined` or rebuilt members deterministically; for criterion 1 also `unpause` + `akrogon next` and assert the holder's new batch carries only `mem-b`. Cap test writes `issues/config.yaml` `{ fix_rounds: 1, checks: { test: 'bun test' }, grounding: 'none' }` and creates the culprit leaf with `fix_rounds: 1`. Refusal test: assert batch record, all branch heads at applied tips/saved heads as before, worktrees unchanged, and `attemptLines(f)` empty after each refusal.

## 5. Do-not, reasons and exceptions

- Do not modify `tests/merge-attempts.test.ts`, `tests/hold.test.ts`, `tests/batch-merge.test.ts` or any existing test: shared fixtures, criterion 5 stays proven by them.
- Do not set `batch_limit` or `solo` on ejection: the locked design ejects without either; the next `mergeTurn` rebuilds from the queue.
- Do not run the transition's full `transition(checkOnly)` for preflight: it validates `HEAD`, not the saved head, and skips the cap — explicitly insufficient per the design.
- Do not touch `skills/`, `docs/`, `README.md` or `tests/command-reference.test.ts`: owned by unit 2.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

Reasons and exceptions restated: existing tests and docs are out of scope to keep the diff minimal and owned paths disjoint; interface or plan conflicts come back as a mismatch, never local scope creep.

## 6. Ordered steps

1. Write `tests/culprit.test.ts` criteria tests (criteria 1-4) against the fixture shape from `tests/merge-attempts.test.ts`; run it — every test fails (`--culprit` unknown option).
2. `src/akrogon.ts` options + `src/phase.ts` parse and upfront refusals; rerun — refusal-shape tests progress, ending tests still fail.
3. `src/phase.ts` culprit branch: membership, saved head, preflight, writes, transition.
4. Rerun the new file until green; then run the shared commands below.

Advisory size: 3 files (2 edited, 1 new ~350 lines), under 60 turns.

## 7. Commands

Changed-test gate (run in this worktree): `: "2595d71097880793bb369c26248b657663a45aa0" && bun test --changed="2595d71097880793bb369c26248b657663a45aa0" --timeout=30000`

While iterating also run the new file directly: `bun test tests/culprit.test.ts --timeout=30000`, and the touched-behavior neighbors `bun test tests/merge-attempts.test.ts tests/hold.test.ts --timeout=30000` once before finishing. Format edited files with `bun run format` (prettier; if it rewrites unrelated files, revert those).

## 8. Done-when, evidence and report

All five acceptance criteria proven by green `tests/culprit.test.ts`; neighbor files still green; commits on the detached worktree HEAD. One commit or two (feat + test) is fine; `tests/culprit.test.ts` is a new file so no `Test-Change:` trailer is needed, and the `src/` files need none. Deliberate-break proof: comment out the `appendAttempt` call once and confirm the criteria-1 test goes red, then restore.

Return with:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
Plus: commit IDs.
