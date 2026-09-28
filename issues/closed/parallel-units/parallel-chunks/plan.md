# Plan: parallel-chunks

Direct synthesis (debate: no). Source: brief.md + design.md + live checkout at 755babc. No brief/design conflict; nothing recorded for review.

## Decisions

- D1 Wave rule: B runs up to 3 chunks at once whose prerequisites have landed and whose edits and verification are independent; dependent or uncertain chunks run one at a time. Cap 3 is literal prose, not configurable.
- D2 Section-4 record: before delegating, B records in each brief's section 4 the chunks that must land first, the paths it owns, and any shared test resource or consumed output. No `after:` field in plan.md, no plan-issue change.
- D3 Worker worktree: each worker gets its own detached worktree at `<lane>/<worktree_root>/<slug>-u<N>` (default root `issues/worktrees`), created at the lane head. Path stays inside the repo so `.gitignore` covers it (`src/init.ts:53-55`) and inside pi's parent root so no confirm dialog (`tamdoma-subagents/tools.ts` parent-root rule). Removed after its result lands.
- D4 Checkpoint-then-cherry-pick return: B commits pending lane edits before each wave when there are any, otherwise reuses HEAD; no empty commits. Each worker commits only its chunk and returns the commit ID with the four report contents. B cherry-picks one at a time, runs lane changed tests after each, then removes that landed worktree. All worker worktrees are gone before the full suite, checks, and `akrogon phase`. Foreclosed: patch apply without worker commits.
- D5 Conflict and crash: on conflict B runs `cherry-pick --abort`, keeps that worker worktree so the commit stays reachable, and resolves or delegates only the remainder. After a crash B inspects and resumes a retained worktree.
- D6 Scope: wave rule applies to delegated leaf passes (implement, and check.fix before the last round). Inline, standalone, and last-round self-repair stay as they are. `SKILL.md:21-23` allows code read/edit in the leaf worktree and its worker worktrees. A fresh worker worktree lacks installed dependencies, so the worker installs them before its changed tests. `SKILL.md:45` final commit covers remaining edits on top of wave commits, no empty commit.
- D7 Evidence shape: prose-only leaf, no `bun test` wording asserts. Done-criterion 3 is proven by a temporary real-git scenario script in a temp repo (deleted after the run, never under `tests/`), with its transcript pasted into `implementation/report.md`.

## Read-first

- `skills/implement-issue/SKILL.md` (lines 3, 21-23, 37, 45, check.fix worker sentence)
- `skills/implement-issue/worker-protocol.md` (launch and return, failure ownership)
- `skills/implement-issue/brief-template.md` (section 4)
- `skills/implement-issue/ponytail.md` (worker context per shared context)
- `skills/AREA.md` (line 21)
- `docs/guide/phases.md` (line 87)
- `docs/reference-index.md` (area links)
- `src/init.ts:53-55`, `src/config.ts:29` (`worktree_root` default `issues/worktrees`), `src/phase.ts:251-254` (`requireClean`), `.gitignore` (`issues/worktrees/`)
- `issues/chart/parallel-units/slots/cap-C.md` (cap-3 simulation background, not edited)

## Needed interfaces

No code interfaces; git is the mechanism. Literal steps the prose and scenario use:

- `git worktree add --detach <worktree_root>/<slug>-u<N> <lane-head>`
- worker: exactly one commit for its chunk, return commit ID
- lane: `git cherry-pick <commit>` serially, `git cherry-pick --abort` on conflict
- `git worktree remove <path>` after each landed pick; `git status --porcelain` empty at end
- `akrogon config` supplies `worktree_root`; resolved `test_changed` with `AKROGON_BASE` is the per-pick and worker changed-test command

Concrete scenario: chunks U1, U2 touch disjoint paths with disjoint tests and no prerequisites, so wave 1 runs both; U3 consumes U1 output, so it stays out until U1's pick lands, then runs alone or in wave 2.

## Acceptance criteria

- C1 Prose states the wave rule, cap 3, section-4 record, checkpoint-then-cherry-pick return, worker worktree path, conflict handling, crash resume, and cleanup order (each landed worktree removed after its lane changed tests; all gone before full suite, checks, `akrogon phase`). Nothing still says leaf workers run sequentially in one worktree.
- C2 `docs/guide/phases.md:87` and `skills/AREA.md:21` describe the same rule.
- C3 Temp-repo scenario runs the literal git steps (lane uncommitted edits, checkpoint commit, two detached worktrees, one commit each, serial picks, removals; plus conflicting pair with `--abort` leaving lane clean and conflicting worktree kept reachable) and ends with `git status --porcelain` empty on the lane. Script deleted after run, never under `tests/`; transcript in `implementation/report.md`.
- C4 `bun run format`, `bun run typecheck`, `bun test` pass.

## Ordered checklist

- [ ] 1. `skills/implement-issue/brief-template.md` section 4: require prerequisites-must-land-first, owned paths, shared test resource / consumed output record. Covers C1 record half.
- [ ] 2. `skills/implement-issue/worker-protocol.md` launch-and-return: wave shape (D1), per-worker detached worktree path and lifecycle (D3), checkpoint + commit-ID return + serial cherry-pick + per-pick changed tests + per-pick removal (D4), fresh-worktree dependency install, sequential-in-one-worktree sentence replaced. Covers C1 core.
- [ ] 3. `skills/implement-issue/worker-protocol.md` failure ownership: conflict abort + keep worktree reachable + resolve-or-remainder (D5), crash inspect-and-resume, remainder sub-brief reads from retained worktree state. Covers C1 conflict/crash half.
- [ ] 4. `skills/implement-issue/SKILL.md` description (line 3), leaf-worktree scope (lines 21-23), implement delegation (line 37), final commit + full-suite + cleanup order (line 45), check.fix worker sentence: point at wave rule, state delegated-leaf scope and inline/standalone/last-round exclusions (D6). Covers C1 scope half.
- [ ] 5. `skills/AREA.md` line 21 and `docs/guide/phases.md` line 87: same wave rule in one line each, no sequential wording left. Covers C2.
- [ ] 6. Grep sweep for `sequential`, `one worktree`, `in this worktree` across `skills/` and `docs/`; fix stragglers or record out-of-scope hits as known limitations. Covers C1/C2.
- [ ] 7. Temp-repo real-git scenario script (in `/tmp`, not in repo): clean pair + conflicting pair per C3; paste transcript into `implementation/report.md`; delete script; confirm `git status --porcelain` empty on lane and no file added under `tests/`. Covers C3.
- [ ] 8. Run `bun run format`, `bun run typecheck`, `bun test`; record outputs in report; commit on leaf branch. Covers C4.

## Affected docs

- Agent doc `skills/implement-issue/SKILL.md`: wave delegation, scope, cleanup order.
- Agent doc `skills/implement-issue/worker-protocol.md`: worktree path, return, conflict, crash.
- Agent doc `skills/implement-issue/brief-template.md`: section-4 record fields.
- Agent doc `skills/AREA.md`: one-line wave rule.
- Human doc `docs/guide/phases.md`: one-line wave rule.

## Verification

- `grep -rn "sequential" skills/ docs/` returns no leaf-worker hit; `grep -rn "in one worktree" skills/` returns nothing.
- Scenario transcript shows: checkpoint commit hash, two `worktree add --detach` paths, two worker commit hashes, two serial `cherry-pick` successes, two `worktree remove` runs, then the conflict case with `cherry-pick --abort`, clean `git status --porcelain`, and the kept worktree still listing its commit via `git log --oneline -1`.
- Prerequisite rule (U3-stays-out case) verified by prose inspection: brief section-4 record plus wave-selection sentence; no git mechanics to script.
- `bun run format`, `bun run typecheck`, `bun test` all pass from the leaf worktree; outputs pasted in report.

## Open limitations

- Independence is B's judgment from section-4 records; two chunks sharing an undeclared test fixture can still collide, and the protocol falls back to serial remainder delegation.
- Until Tamdoma/pi-extensions#4 lands, pi runs one child at a time and extra spawns queue, so waves execute serially with the same results.

## Dependencies

None requiring ordering. Pi-extensions#4 improves throughput but the prose merges first.

## Credentials

Design names no variable-named credentials (standing design: no auth, secrets, browser flow); no `.env` presence check required and no human-only blocker.
