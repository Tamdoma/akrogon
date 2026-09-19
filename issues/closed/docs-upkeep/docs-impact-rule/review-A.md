# Review A: docs-impact-rule

Base: f537143aeb0b126fb5d71a89120cb7c52eade382
Reviewed head: f11f6ae
Debate: no — no positions/rebuttal artifacts, as expected.

## Verification evidence

- `bun test`: 279 pass, 0 fail, 3317 expect() calls, 13 files (rerun in worktree).
- `bun run typecheck`: clean.
- `bun run format`: no changes; worktree clean after.
- AREA check (one command): all paths named in `src/AREA.md` exist — src/akrogon.ts, src/config.ts, src/init.ts, src/phase.ts, src/shell.ts, docs/reference-index.md, tests/helpers.ts.
- Lesson claim checked: `learnings/history/2026-09-19-min1-not-nonblank.md` exists and supports the whitespace-only-is-empty rule; `checkGrounding` uses `trim()` and a whitespace-only refusal test exists.
- Docs opened under the changed-behavior rule: `docs/reference-index.md`, `skills/AREA.md`, `tests/AREA.md` (unchanged by diff) — all rows still accurate against the new code and skill prose.

## Criteria check

- Refusal before any write: `checkGrounding` runs between `repoSchema.parse` and `writeRepoConfig`; missing, directory, empty and whitespace-only index cases each assert a byte-identical snapshot of config, global registration, `issues/open`, `learnings` and `.gitignore`. Error names the resolved path and points to init-issues; `cause` carried on filesystem errors only. Matches D4.
- Success paths: non-empty index init and repeat, explicit `none` init and repeat, bare init — all tested and green. Matches D3.
- Schema: `.default('none')` removed; omission fails parse (new test), explicit `none` parses, unregistered `akrogon config` prints `grounding: none` via `effectiveConfig` fallback. Matches D1, D2.
- Skills: plan-issue grounding + synthesis checklist lines, implement-issue doc-update line, check-issue seat-neutral doc-review paragraph with "Open no area file outside that diff" deleted and the one-command AREA check kept, init-issues proposal and completion-gate lines. Matches D5.
- Human docs: README, setup.md, cheat.md each state the refusal and index-or-explicit-none; stale "default grounding setting can be none" claim replaced. Matches D7.
- `src/AREA.md`: `src/init.ts` key file and one refusal pattern line; index, skills and tests AREA files verified unchanged-and-accurate. Matches D8.
- Fixture coverage: every repo-config/proposal write that must parse carries `grounding: 'none'` (helpers, config, next, phase, pull, sync, state, init positives); deliberate negatives (`scripts_dir` proposal, status.test.ts malformed writes, new omission test) stay grounding-less. Matches D6.

## Findings

None.

## Verdict

ready

## Merge evidence

- Rebase target: origin/main (f537143); branch already on top, rebase no-op, head f11f6ae unchanged.
- AKROGON_BASE after refresh: f537143aeb0b126fb5d71a89120cb7c52eade382.
- `bun run format`: clean, no changes.
- `bun run typecheck`: clean.
- `bun test`: 279 pass, 0 fail.
- `bun test --changed=$AKROGON_BASE`: 272 pass, 0 fail.
