# Plan: guard-retires-lesson

Debate off (`debate: "no"`); synthesized directly from `brief.md` and `design.md`. `blocked-by: lesson-write-rule` is already landed on `origin/main` (commits e8ceb2a, 135add6, 2d9beca): `skills/lesson-rule.md` exists and this leaf extends it.

## Decisions

- D1 (design, lesson-lifecycle 3a + 4a): a lesson's active line is removed only by the leaf that lands a running mechanical guard covering the lesson's mechanism on every reachable path, in the same diff: the leaf deletes the `LESSONS.md` line and appends `Applied <YYYY-MM-DD> by <guard file:line>: <what it enforces>` to the lesson's history file. Closure, duplicate or rejection never removes a line.
- D2 (design, draft-review-repairs 1a): the union-merge resurrection (`learnings/LESSONS.md merge=union`) is fixed on the merge path, both modes. Mechanism: a `git diff --unified=0 -- 'learnings/history'` pass over `built_on..<tip>` collecting history files with an added `^\+Applied` line; each such file's LESSONS.md line (matched by its `history/<name>` stem, covering the markdown `[text](path)` lines) is removed.
- D3 (planner choice): the mechanical removal lives in new `src/lessons.ts` (pure helpers plus a worktree mutator), invoked from `buildStack` in `src/batch.ts`: after all member rebases and the holder rebase land, run re-removal over `builtOn..HEAD` in the disposable worktree; if any line was dropped, commit one fixup on top so `staged.top` and every recorded member `tip` already carry the removal. Covers the initial build (`next.ts`), restack and solo-record mechanical rebase (`phase.ts`). Design's allowance of `src/phase.ts` is not used for mutation: no live path needs it.
- D4 (planner choice): `merged --check` (`batchCheck` in `src/phase.ts`) gains the verifying half for both modes: history files gaining `+Applied` in `record.built_on..head` must have no `LESSONS.md` line at `head` (read via `git show head:learnings/LESSONS.md`; missing file means pass). Refusal names each retired history file still holding a line. Stack mode routes a refusal through `check.fix` (the existing uncited-file wording generalizes to the lesson lines); solo mode lets B commit the removal.
- D5 (planner choice): solo and `rerun rebase` manual rebases get the re-removal in `merge-issue` skill text placed inside the solo conflict-resolution paragraph, so `rerun rebase` ("resolving conflicts as in the solo form") inherits it: after the rebase completes and before checks, run a pinned `bun -e` one-liner importing `src/lessons.ts` over `record.built_on..HEAD`, then commit the removal as its own scoped commit when the diff is non-empty. The `--check` guard (D4) is the mechanical backstop.
- D6 (design, chart door): `shapes.md` audit and `chart-issues/SKILL.md` handoff text refuse a leaf that owns the complete guard for a lesson its `sources` trace to — a `sources` entry naming a seed whose body names a `learnings/history` path — without a retirement done-criterion naming that history path; a leaf only touching the lesson needs none.
- D7 (design, review bar): `check-issue` accepts a lesson-line removal only when the diff's guard runs on every reachable path of the mechanism; an uncalled or partial guard beside a removal is a Fix, and any removal tied to report closure, duplicate or rejection is a Fix.
- D8 (planner choice): the fresh-agent live run proves criteria 1, 3 and 5 together in three exercises (draft lesson-sourced guard brief; draft lesson-touching non-guard brief; judge a synthetic partial-guard-removal diff under the shipped check-issue text). Live run; restart boundary = rerun the failing exercise(s) and re-paste output into `implementation/report.md`.
- D9 (planner choice): `learnings/LESSONS.md` header sentence ("a line leaves when applied or when /learn-issues removes it") is in scope: criterion 6's sweep must not find `/learn-issues` as the only exit. Tracked file, leaf-editable.
- D10: open limitation preserved for review — the chart-issues direct route pushes without `buildStack`, `batchCheck` or merge-issue solo text, so it carries no re-removal step. The brief names only "solo or in a stack top"; a direct-route landing can still resurrect a retired line. Recorded here, not fixed.
- D11: design/brief note — the design says "in top mode B commits nothing"; the code's solo path (record `solo: true`) does have B rebasing and committing, so the step sits in the skill text there (D5) with `--check` as backstop (D4). No conflict; recorded per the conflict-note convention.

## Read-first (context for implementers)

- `skills/lesson-rule.md` — the shared rule file; this leaf adds its retirement section.
- `skills/learn-issues/SKILL.md` — `Applied` line format (line 28) and the Guarded definition that "runs on every reachable path" mirrors.
- `src/batch.ts` — `buildStack` disposable-worktree build; D3 insertion point after the holder rebase.
- `src/phase.ts` — `batchCheck` (`merged --check`), `requireTestChangeCitations`/`requireNonEmpty` as pattern templates; `record.solo` branch.
- `skills/merge-issue/SKILL.md` — `### attempt solo` conflict-resolution paragraph (D5 text home); top-mode `rerun rebase` clause points there.
- `skills/chart-issues/SKILL.md` `## Handoff` audit paragraph + `skills/chart-issues/assets/shapes.md` `## Preflight and validation` audit paragraph (D6).
- `skills/check-issue/SKILL.md` `## check.review` fix-bar area (D7).
- `skills/implement-issue/SKILL.md` — line ~31 "applying a lesson removes its active line" (D1's applying half).
- `tests/batch.test.ts`, `tests/phase.test.ts`, `tests/helpers.ts` — fixture conventions: `batchFixture()`, `branch()`, `leaf()`, `cli()`.
- `learnings/LESSONS.md` + `.gitattributes` (`learnings/LESSONS.md merge=union`) — the resurrection mechanism.
- `docs/guide/learn.md`, `docs/guide/merge.md`, `src/AREA.md` — doc surfaces.

## Interfaces

- `src/lessons.ts` (new):
  - `retiredHistoryStems(cwd, base, head): Promise<string[]>` — history stems (`learnings/history/<file>` minus `.md`) whose diff in `base..head` adds a `^\+Applied` line.
  - `retiredLessonsPresent(cwd, base, head): Promise<string[]>` — stems with a still-present `LESSONS.md` line at `head` (read via `git show`, missing file ⇒ empty).
  - `removeRetiredLessons(cwd, base, head): Promise<string[]>` — drop those lines from the working `learnings/LESSONS.md`, return stems removed.
- `src/batch.ts` `buildStack`: unchanged signature; internally applies `removeRetiredLessons` + conditional fixup commit before computing `top`.
- `src/phase.ts` `batchCheck`: calls `retiredLessonsPresent(worktree, record.built_on, head)` for both solo and stack records; throws naming the stems.
- `merge-issue` skill one-liner (verbatim in skill text): `bun -e "import {removeRetiredLessons} from './src/lessons.ts'; const r=await removeRetiredLessons(process.cwd(),'<built_on>','HEAD'); console.log(r.length?r.join('\n'):'none')"` then `git add learnings/LESSONS.md && git commit -m "lessons: retire applied lines"` when non-empty.

## Units and waves

### Wave 1

- U1 — merge-path re-removal (command code + tests). Owns: `src/lessons.ts` (new), `src/batch.ts`, `src/phase.ts`, `tests/batch.test.ts` (extend), `tests/phase.test.ts` (extend). Proves criterion 2 (top mode mechanically; solo enforcement mechanically). Commits on changed old test files need `Test-Change:` trailers.
- U2 — skill text. Owns: `skills/lesson-rule.md` (retirement section), `skills/implement-issue/SKILL.md` (applying half, line ~31), `skills/chart-issues/SKILL.md` (handoff audit line), `skills/chart-issues/assets/shapes.md` (preflight/audit refusal), `skills/check-issue/SKILL.md` (removal bar), `skills/merge-issue/SKILL.md` (solo/rerun-rebase re-removal step + `--check` refusal note). Proves criteria 1, 3, 4 at text level.
- U3 — operator docs. Owns: `docs/guide/learn.md` (retirement by guard leaf; lesson exits wording), `docs/guide/merge.md` (re-removal in stack build and `--check`), `src/AREA.md` (batch/phase pattern line), `skills/AREA.md` (learn-issues line stays accurate), `learnings/LESSONS.md` (header exit sentence).

Wave rationale: disjoint paths, no shared resources, independent contents once Interfaces are pinned.

### Wave 2

- U4 — fresh-agent live run (D8). Owns: `implementation/report.md` evidence section only (no repo paths). Requires U2 landed (it consumes the shipped skill text). A runs it at implement end per the implement-issue proof rules, not as a worker unit.

## Checklist: file → criterion

- `src/lessons.ts` new — c2
- `src/batch.ts` — c2 (top)
- `src/phase.ts` (`batchCheck`) — c2 (both modes backstop)
- `tests/batch.test.ts` — c2 proof
- `tests/phase.test.ts` — c2 proof
- `skills/lesson-rule.md` — c4, feeds c1/c3/c5
- `skills/implement-issue/SKILL.md` — c1 (applying half)
- `skills/chart-issues/SKILL.md` — c1, c5
- `skills/chart-issues/assets/shapes.md` — c1, c5
- `skills/check-issue/SKILL.md` — c3
- `skills/merge-issue/SKILL.md` — c2 (solo/rerun-rebase), c4
- `docs/guide/learn.md` — c6
- `docs/guide/merge.md` — c2 documented, c6
- `src/AREA.md`, `skills/AREA.md` — doc accuracy
- `learnings/LESSONS.md` — c6

Docs one-liners: `docs/guide/learn.md`, `docs/guide/merge.md`, `src/AREA.md`, `skills/AREA.md`, `learnings/LESSONS.md` (D9). No `tests/AREA.md` change (file list is exemplar, not exhaustive). `docs/reference-index.md` untouched (no new area).

## Criterion → proof map

1. Chart-door audit refusal → U4 exercise 1+2 output recorded in `implementation/report.md` (brief for the lesson-sourced guard leaf carries the retirement criterion naming its history path; lesson-touching leaf does not). Failure caught: audit rule missing/mis-stated. Size: minutes. Rerun: any edit to `skills/chart-issues/*` after the run.
2. Removal survives merge → `bun test tests/batch.test.ts tests/phase.test.ts` (real git, union attribute on the real merge path): (a) `buildStack` on a builtOn whose `LESSONS.md` gained a neighbouring line — retired line absent, new line present, fixup commit is `top`, fail-first shown before D3 lands; (b) `merged --check` stack-mode refusal and solo-mode refusal naming the resurrected stem; (c) solo re-removal run then `--check` green. Plus `bun test --timeout=30000` whole suite for regressions (`batch-merge`, `merge-attempts`, `hold`, `culprit` exercise `buildStack`). Failure caught: missing re-removal, wrong range, missing backstop. Size: minutes. Rerun: any change under `src/`, `tests/`.
3. Uncalled/partial guard + removal = Fix → U4 exercise 3: fresh agent judges a synthetic diff (lesson line removed, guard defined but uncalled) under shipped `check-issue` text and returns `fix`. Failure caught: bar absent or unenforced wording. Size: minutes (with U4). Rerun: `skills/check-issue/SKILL.md` edits.
4. No removal on closure/duplicate/rejection → `git grep -n "LESSONS" skills/learn-issues/SKILL.md skills/lesson-rule.md src/` plus rule-file and check-bar text review recorded in report: the only removal paths are retirement and `/learn-issues` guarded deletion; `seed-issue` match posts nothing (draft-review-repairs 2a already shipped). Failure caught: a removal path outside the two allowed. Size: seconds. Rerun: edits to named files.
5. Fresh agent drafts both briefs correctly → U4 exercises 1+2 (same run as c1). Failure caught: retirement criterion leaking to non-guard leaves or absent on guard leaves. Size: minutes. Rerun: skill text edits.
6. Guide describes retirement; `/learn-issues` not the only exit; links resolve → `bun test tests/docs-links.test.ts` (covers README, guide, `*/SKILL.md`) plus a one-off link check command for the edited non-SKILL pages (`skills/lesson-rule.md`, `skills/chart-issues/assets/shapes.md`, `learnings/LESSONS.md` is content-checked not link-checked) and `git grep -n "learn-issues" docs/ skills/ learnings/` showing no "only way" phrasing. Failure caught: stale wording, dead links. Size: seconds. Rerun: any edited page.

Plus the blocking `checks` commands at implement end: `bun run format`, `bun test --timeout=30000`, `bun run typecheck`, and `bun test --changed=$AKROGON_BASE` as work lands.

## Implementation notes

2026-10-10, check.fix round 2 (review finding A-F1): line identity for removal is the exact `-` line text each leaf deleted in its original range (`member.base..member.head`, `holder.base..holder.head` — original heads preserved in the batch record; `ORIG_HEAD` for the solo one-liner), intersected with the retired-stem set. Stem-substring matching stays only inside `retiredLessonsPresent`'s refusal, which also spares lines main added on top of each leaf's fork (merge-base both ways, covering restack's `holder.base` overwrite). Refines D2's re-removal key and D4's refusal semantics; the design's interface sentence stays intact (stems key the *retirement*, deleted lines key the *line*).

## Notes

- Slow/live run: U4 is the leaf's only live run (fresh agent through the harness). Idempotent; restart boundary is per-exercise rerun.
- No credentials needed: `readiness.yaml` has empty `inputs`/`grants`; `akrogon status` shows no `Missing:` gate for this leaf.
- Exclusions honored: no change to `/learn-issues` or the `merge=union` attribute; no retirement on closure; direct route limitation parked (D10).
