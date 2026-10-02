# Review A: busy-rule-log

Base: bf88de02b3d4541accb6045e9bced3feb45355b4 · Reviewed head: 84137d0 (commits d9184aa, 84137d0). Worktree clean.

## Verification

- `git diff bf88de0...HEAD` — only `skills/watch-issues/SKILL.md` (lines 30, 40) and new `scripts/observe-log-tail.test.ts`; no stray edits.
- `bun test scripts/observe-log-tail.test.ts` in `skills/watch-issues` — 1 pass (54ms), independently rerun by this seat.
- Report's root suite (357 pass incl. `tests/watch-issues-scripts.test.ts`), typecheck, format: accepted as worker-A evidence, consistent with the diff.
- Doc check: diff touches no `AREA.md`; `skills/AREA.md` and `docs/guide/in-practice.md` describe both scripts and mechanism at a level the change does not contradict — no documented behavior changed beyond SKILL.md itself. No live doc references the removed `--lines 80`-on-working-seat rule (remaining hits are closed issue records).

## Criterion check

1. SKILL.md no longer reads a working seat with `--lines 80`: :30 splits on herdr `working` → `--source visible`, otherwise `--lines 80`. Busy rule :40 carries `log<seat>=<path>` → `bun <skill-folder>/scripts/log-tail.ts`, `log<seat>=-` → "no log", non-zero exit → "log unreadable: <stderr message>", identity semantics (`#`, `old#`/`new#` swap = undo, `#-` never same), read-failure-never-steers, other seats still judged. Bar, resteer and insufficient-evidence sentences verbatim; no elapsed limit. PASS.
2. Join test runs real observe.ts (stub herdr/akrogon, temp HOME, `path`-kind pi session) and real log-tail.ts on the extracted `logA=` path; expected six lines derive `sha8` in-test from fixture strings, not script output; header states wiring-only scope. PASS.
3. Blocking `bun test` green (357 pass), including `tests/watch-issues-scripts.test.ts` which runs `bun test scripts` + typecheck over the skill. PASS.

## Findings

- Nit — `bun test --changed=$AKROGON_BASE` at repo root reports "no test files are affected" for skill tests (nested package); the skill-local run catches it. Deferred: report names it plainly, the blocking suite still covers the file, and the runner's scoping is a pre-existing property, not this leaf's defect. Promoted to Fix only if a future leaf lands a skill test that neither `--changed` nor the nested suite runs.
- Nit — Busy rule says `running` means no result record yet; a truncated read could print `running` for a call that later completed. Deferred: matches log-tail's contract semantics and the watch judges each fire afresh; no consequence today.

Verdict: ready.
