# Plan: record-only-reuse

`debate: no`; synthesized directly from brief/design against the landed merge-batch surfaces. A refused batch push restacks, compares old/new main and tested/restacked top outside the record folders plus `issues/config.yaml`, and prints `reuse` (keep the green run) or `rerun` (fresh checks required). A restack conflict always means `rerun`.

## Decisions

- D1. `batchSchema` in `src/state.ts` gains two optional keys: `tested_main` (SHA of the remote base the tested stack stood on) and `decision` (`'reuse' | 'rerun'`). `tested_top` remains the tested stack SHA, `candidate` remains the head actually submitted to `git push` — after a decided refusal the record holds tested SHA (`tested_top`), pushed SHA (`candidate`) and `decision`. `built_on` keeps tracking the *current* stack base (latest main), so all original-main comparisons read `tested_main`, never `built_on`.
- D2. `batchCheck` writes `tested_top`/`tested_main` only when `record.decision !== 'reuse'`, preserving the original pair on a reused record. `tested_main = git merge-base <head> <trackingRef>` — one call, correct for applied and `solo` records, more accurate than `built_on` when the remote moved between build and check.
- D3. `batchPush` refusal write additionally clears `tested_main` and `decision` alongside `tested_top` (one line; `pending.record` passed to `restack` is the pre-clear copy, so the decision evaluation still sees the original pair). The slot gate becomes `head === record.tested_top || (record.decision === 'reuse' && head === record.top)`: after a reuse, `top` is the publication candidate the push accepts.
- D4. `restack` gains a `conflicted` flag set on every `!staged.ok` iteration. On the final successful build, before the existing locked apply, evaluate in `repo.root` (M1=`record.tested_main`, M2=`builtOn`, T1=`record.tested_top`, T2=`staged.top`):
  - `git diff --quiet M1 M2 -- ':(top)' ':(top,exclude)issues' ':(top,exclude)learnings'`
  - `git diff --quiet T1 T2 -- ':(top)' ':(top,exclude)issues' ':(top,exclude)learnings'`
  - `git diff --quiet M1 M2 -- ':(top)issues/config.yaml'`
  via `run` — code 0 equal, 1 differs, anything else throws `CommandError`. `reuse` requires all three quiet, `!conflicted`, and both tested fields present; otherwise `rerun`.
- D5. Record writes in `restack`. Reuse payload: `built_on: M2`, `top: T2`, `members` with new tips, `holder: { base: M2, head: holderHead }`, `applied: true`, `tested_top: T1`, `tested_main: M1`, `decision: 'reuse'`, **`candidate: undefined`**. The candidate stays unset until `batchPush` submits it — `reconcileBatch` (src/next.ts) treats `applied && candidate !== undefined` as push-pending and would dissolve a reused record whose candidate has not landed. Rerun payload: same stack fields with `tested_top`, `tested_main` cleared, `decision: 'rerun'`, `candidate: undefined`. Holder-conflict and dirty-holder endings clear both tested fields, set `decision: 'rerun'` (record keeps the decision), and print the rebase line.
- D6. Printed contract (replaces `fresh checks required` everywhere in `restack`):
  - `reuse tested=<T1-sha> pushed=<T2-sha>` — green run valid, no check rerun.
  - `rerun tested=<T1-sha|none> pushed=<T2-sha>` — fresh checks required; `none` when the push was refused before any `--check`.
  - `rerun rebase <slug> onto <M2-sha>` — holder-conflict/dirty-holder ending (unchanged shape, word `rerun` substituted).
  Every later refusal re-evaluates against the preserved T1/M1, so a second record-only advance after a reuse reuses again and `tested_top` stays T1.
- D7. `skills/merge-issue/SKILL.md`: `reuse tested=<t> pushed=<p>` means copy the printed line into `review-B.md`, then run `merged --check`, gather the completion owners' briefs, and `merged` under the same `--attempt` — checks are not rerun. `rerun ...` and `rerun rebase ...` mean exactly what `fresh checks required ...` meant today. A reprompted `top=` on a reused record stays safe: B may rerun checks, but `batchCheck` preserves the original tested pair and the push gate accepts `top`.
- D8. `docs/guide/setup.md`: under the `checks` bullet add the record-folder rule — checks must not read tracked files under `issues/` (except `issues/config.yaml`, the check list itself) or `learnings/`; a green batch run can be reused when only those folders moved on the default branch.
- D9. Tests live in `tests/batch-merge.test.ts` beside `batchFixture`/`soloFixture`. New local helper `advanceRemote(f, files: Record<string,string>): Promise<string>`: detached worktree on `origin/main`, write files, commit, `git push origin HEAD:main`, remove worktree, return the new main SHA (used by new tests; existing inline copies stay). A counter file under `f.home` outside the repo simulates B's check runs — the test appends a line exactly where the seat would run checks.

Not owned (merge-batch): record creation, build/apply/restore mechanics, conflict resolution rules, attempt fences, reconcile.

## Read first

- `src/phase.ts` — `batchCheck` (tested write + gates), `batchPush` (refusal write ~line 465, slot gate ~line 451, `candidate: head` ~line 454), `restack` (three print sites ~lines 604/608/634), `finishPush` (lost-reply branch stays).
- `src/state.ts` — `batchSchema`.
- `src/batch.ts` — helper home for the two diff wrappers.
- `src/next.ts` — `reconcileBatch` (~line 808): `applied && candidate` means push-pending; never set `candidate` before `batchPush`.
- `src/preflight.ts` — `trackingRef`.
- `tests/batch-merge.test.ts` — `batchFixture`, `soloFixture`, `remoteTip`, `remoteSubjects`, refused-push test (~line 283), member-conflict restack test (~line 624).
- `tests/helpers.ts` — `fixture`, `cli` (cwd parameter for criterion 8).
- `tests/batch-dispatch.test.ts` — `fresh checks required` assertion ~line 176.
- `skills/merge-issue/SKILL.md`, `docs/guide/merge.md`, `docs/guide/state.md`, `docs/guide/setup.md`.
- `learnings/LESSONS.md` — wording-coupled assertions (2026-10-01) and stale-rule-in-docs sweep (2026-09-14).

## Interfaces

- `equalOutsideRecordFolders(repo: Repo, a: string, b: string): Promise<boolean>` in `src/batch.ts` — the two `:(top,exclude)` diffs as one call per pair.
- `recordConfigEqual(repo: Repo, a: string, b: string): Promise<boolean>` in `src/batch.ts` — the `issues/config.yaml` diff.
- `batchSchema` +`tested_main: z.string().optional()`, `decision: z.enum(['reuse', 'rerun']).optional()`.
- `restack(repo, leaf, record)` signature unchanged; prints the D6 lines.

## Waves

### Wave 1

U1 — decision engine, gates, tests.
- Owns: `src/state.ts`, `src/batch.ts`, `src/phase.ts`, `tests/batch-merge.test.ts`, `tests/batch-dispatch.test.ts`.
- Shared test resources: none (own fixture files and counter file under `f.home`).
- Land first: none.
- Criteria: reuse prints `reuse tested=<T1> pushed=<T2>` and keeps tested pair; rerun clears them; second refusal still compares against originals; conflict and dirty paths always rerun; subdirectory invocation identical; existing restack assertions updated to the D6 lines.

### Wave 2

U2 — skill and docs. Land first: U1 (wording must match shipped lines).
- Owns: `skills/merge-issue/SKILL.md`, `docs/guide/setup.md`, `docs/guide/merge.md`, `docs/guide/state.md`.
- Criteria: skill describes `reuse`/`rerun` lines and the `review-B.md` copy instruction; setup.md carries the record-folder rule next to `checks`; merge.md refusal section rewritten; state.md batch keys list `tested_main` and `decision`; `grep -rn "fresh checks required" src tests docs skills` returns nothing.

Docs affected: `skills/merge-issue/SKILL.md`, `docs/guide/setup.md`, `docs/guide/merge.md`, `docs/guide/state.md` (one line each per above); `README.md`, `docs/guide/phases.md`, `docs/guide/next.md`, `src/AREA.md`, `tests/AREA.md` — check for stale `fresh checks required` wording during U2, otherwise unchanged.

## Verification

Proof commands run in the leaf worktree: `bun test tests/batch-merge.test.ts tests/batch-dispatch.test.ts`, then `checks`: `bun run format`, `bun test --timeout=30000`, `bun run typecheck`, `bun test --changed=$AKROGON_BASE --timeout=30000`. Deliberate break per design: drop the `recordConfigEqual` call → criterion-4 test must fail, then restore.

| Criterion | Proof (test/grep) | Failure it catches | Size | Rerun trigger |
| --- | --- | --- | --- | --- |
| 1 record-only commit → one run + push | batch-merge: append counter, `--check`, advance `issues/open/x/state.yaml` + `learnings/history/y.md`, `merged` prints `reuse tested=T1 pushed=T2`; counter==1; recheck+`merged` lands T2; record holds tested_top=T1, candidate=T2, decision=reuse, built_on=M2 | reuse not detected; tested pair overwritten; candidate set early (reconcile dissolve) | minutes | batch-merge.test.ts or src/{phase,batch,state}.ts changed |
| 2 code commit → second run | same shape, advance edits `file`: prints `rerun`, counter==2 after seat rerun, remote tip==T2 | silent reuse of a code change | minutes | same |
| 3 main matching member's change | advance writes `file-mem-a` with the member's identical content: condition (ii) could pass, (i) must fail → `rerun` | main-side diff skipped or wrong base | minutes | same |
| 4 `issues/config.yaml` change | advance commits `issues/config.yaml` → `rerun`; deliberate break drops the check and turns this red | config condition dropped | seconds | same |
| 5 restack conflict incl. learnings | member adds `learnings/history/shared.md`, advance commits same path → `rerun`, member restored+solo, remote tip still M2 until recheck+`merged` | conflicted stack reused; push before green | minutes | same |
| 6 printed line + record + skill | reuse test asserts stdout format and record fields (D1/D5); `grep -n 'review-B.md' skills/merge-issue/SKILL.md` + doc diff shows the copy instruction | wrong SHAs recorded, missing skill instruction | seconds | same |
| 7 second refusal vs originals | after first reuse, advance again record-only: `merged` (gate accepts `head===top`) prints `reuse tested=T1 pushed=T3`; record.tested_top still T1, candidate=T3 | comparison drifted to the reused top | minutes | same |
| 8 subdirectory invocation | same as test 1 but `cli` cwd is a new empty subdir inside the holder worktree | `:(top)` pathspec or repo resolution breaks off-root | seconds | same |
| 9 setup.md rule | `grep -n 'issues/\|learnings' docs/guide/setup.md` shows the rule next to `checks`; doc review confirms wording | rule absent or detached from checks | seconds | docs changed |

No credentials required: design names no env vars and `akrogon status record-only-reuse` prints no `Missing:` lines.

Open limitation (preserved): the record-folder set is fixed (`issues/` minus `issues/config.yaml`, plus `learnings/`); the reuse relies on no check reading those folders — guarded by the D8 doc rule, not enforced at runtime.
