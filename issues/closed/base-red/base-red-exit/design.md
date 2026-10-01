# Design: base-red-exit

## Binding decisions, verbatim

From issues/chart/test-time-and-temp/forks/check-proof.md. Operator 2026-10-01, verbatim: "1a | 2a | 3a |"

### Q1 runner: 1a
No check-record runner; check-scheduling Q1 1a stands. Reason: every #50 run was red, so SHA reuse saves nothing, and SHA misses outside inputs. Foreclosed: 1b runner with records, reuse, base diff and merge refusal.

### Q2 base red: 2a
When a red test or check has no cause in the leaf's diff, the seat runs that same command once, in the same mode (whole folder or single file), at `AKROGON_BASE` in a detached worktree under the leaf temp folder. Red there too: end the pass `akrogon phase <slug> failed --reason "<command> red on base <sha>"` with both log paths in the report. Green there: the leaf's own failure, repaired as today. Never run automatically after every failure. Applies in implement-issue (implement and check.fix) and check-issue. Refines red-criterion Q2 2a; does not reopen it. Foreclosed: 2b base-red failures recorded and only new failures block; 2c no rule.

### Q3 plan rule: 3a
plan-issue gets the chart rule: a plan proves the brief's criteria with the leaf's own tests and `checks` commands and adds no `merge_checks` or whole-suite requirement the brief does not name. Foreclosed: 3b plans unchanged.

### Carried from leaf-temp (forks/leaf-temp.md, operator 2026-10-01)
Temp is scratch and expires after 7 days without changes; evidence (failing names, log tails) goes in the leaf folder. So "both log paths" in Q2 2a also means the failing test names and log tails are written into the report or review file, not only linked.

### Excluded binding decisions
leaf-temp location, deletion and export belong to leaf leaf-temp-dir. This leaf allocates its base worktree with `mktemp -d`, which uses the leaf TMPDIR when exported and the system temp directory otherwise, so it has no dependency on leaf-temp-dir. (B)

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

- Skill-prose leaf: no code, so no new tests; the cheapest sufficient proof is review of the stated rule against the binding decisions plus the grep sweep in criterion 4 (lesson 2026-09-11: grep `docs/` for a changed rule). No tests of prose wording.
- Writer and checker share one rule: implement-issue and check-issue state the same base-run rule; the plan-issue rule matches `skills/chart-issues/assets/shapes.md:132,170`.
- No secrets, no auth surface.

## Leaf architecture

Owned surfaces: `skills/implement-issue/SKILL.md` (Shared context near line 34, implement end near 48, check.fix near 62), `skills/check-issue/SKILL.md` (check.review near 49-51), `skills/plan-issue/SKILL.md` (verification near 55-59), `skills/AREA.md`, `docs/guide/*.md` lines describing red criteria, review reruns and plan verification.

Literal interfaces: `akrogon phase <slug> failed --reason "<command> red on base <sha>" --slot <A|B>` (review seats already use `failed --slot`, `check-issue/SKILL.md:25`; `src/phase.ts:193-207` requires `--reason`). Base worktree: `base_worktree=$(mktemp -d)`, `git worktree add --detach "$base_worktree" "$AKROGON_BASE"`, run the command, keep the result, both log paths, failing names and log tails, then `git worktree remove --force "$base_worktree"` (plain remove refuses a worktree with untracked files, which a test run leaves), then take the red or green path. (A,B)

Exclusions: no `src/` change, no runner, no record store, no automatic base run, no change to merge-issue (its red-check path stays `check.fix`), no change to chart shapes, no edits to framework leaves (legacy framework criteria are a framework chart).

Dependencies: none. leaf-temp-dir supplies `$TMPDIR` but this rule works without it. Operation proofs: recorded in issues/chart/test-time-and-temp/forks/check-proof.md under Operation proofs, 2026-10-01 (mktemp -d with and without TMPDIR, detached base worktree add and forced remove, `phase failed --slot A --reason` from check.review). (B)
