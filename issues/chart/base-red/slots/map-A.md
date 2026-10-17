# Map A: seeds #96, #97, #98

## Split and order
- Chart `base-red` (#98): its own destination, high urgency. 3 incidents in 10 days (log.jsonl:581,590,591; :675,:685; :1032,:1033). Take first.
- Chart `loop-counts` (#97): watch-issues script only. Small, one outcome, B named, no inputs or live run, so direct route is eligible.
- Chart `failed-cause` (#96): depends on #98. If #98 adds a `base` failure class, that is the only class with a proven payoff (auto resume). Other classes have no observed wrong recovery (seed #96 Urgency). Take last; it may close as folded into #98 or not built.

## #98 base-red

Evidence:
- The sensor is a cache. `verify` reuses any green receipt for the same tree with no age or environment key (src/verify.ts:118-122, greenRun :63-76). Verifying main again after the clock rots returns `reuse receipt`. So "every commit passed verify" (implement-issue/SKILL.md:40, check-issue/SKILL.md:69) is true and still useless for decay.
- Known-red flow was removed deliberately: dc2e2b0 (2026-10-14) "Replace base-run with akrogon verify and gate routes to main on its receipts", 3242 lines deleted (compare, red-record, --red-on-base). ac50164 then rewrote the seat skills. Bringing that back reverses an operator-era decision and its size.
- Decay sources seen: clock (2026-10-17, tests/timing-report.test.ts, fixed 0dfae20), environment (#76 root node_modules), harness-template test 2026-10-08 (cause not traced by A). Operator "add issues" commits touch only issues/ and did not cause this one. The seed's claim about direct commits is not shown.
- No base health check before dispatch: next.ts:827 `checkBase` checks the ref only (src/preflight.ts:62).

Forks:
- Q1 Where is a red main detected once? 
  - a) Leaf-side: on a red with no diff cause and a red retry, the seat runs `akrogon verify` on `$AKROGON_BASE` with receipt reuse off. Base red: leaf stops with failure cause `base`, not `blocked`. Base green: the red is the leaf's. Cost: one extra full suite only on the no-cause path. Later risk: every leaf still pays one base run unless the result is shared.
  - b) Shared base record: the first base-red verify writes a repo record (sha + tree + failing units). Later leaves on the same base read it instead of running. Cleared by a green fresh verify of main. Closer to the deleted red-record, so it must stay much smaller (binary, no per-unit compare).
  - c) Watch-side sentinel: watch-issues runs a fresh base verify each tick. Rejected-leaning: adds a timer-like cost (autopilot lock: no new timers or polling) and runs the suite 72 times a day.
  - d) Prevention only: clock seam plus a test rule. Removes the clock class, not env decay. Pairs with a or b.
- Q2 What happens to stopped leaves when main turns green? Today: operator runs `akrogon phase` per leaf (seed #98 Observation). Options: watch resumes `cause: base` failures once a fresh base verify is green (uses the existing failed-otherwise recovery path, watch-issues/SKILL.md:44), or `akrogon next` refuses dispatch while a base record is red and resumes on green.
- Q3 Receipt reuse key: should reuse expire (age, or tests touching the clock)? Expiring all reuse costs suite time on every merge. Option: reuse stays for leaf/merge gates, base checks always run fresh (`--fresh`).
- Q4 Who repairs main: one operator notice per base sha (no new state beyond the record), or a door-charted fix leaf. Repair stays human: tests outside every leaf's ownership (any-consultants report.md:31).
- Q5 Clock seam scope: only tests that compare fixed fixture dates to the real clock decay. 78 real-clock calls in 16 test files, most are elapsed-time measures that do not rot. A test rule in plan-issue test-proof rules ("expected values never depend on the run date") plus fixing timing-report's `Date.now()` read (src/timing-report.ts:464) covers the seen class.

Pitfalls:
- Base run under seat load times out and looks red (seed: 14 tests fail locally under the 5 s default). Remove by running base checks through the same `akrogon verify` command set and timeout, never ad hoc `bun test` (LESSONS 2026-10-16 command equivalence).
- Two leaves race to write the base record. Remove by keying the record on base sha and letting a duplicate write be a no-op.
- A real leaf defect hidden as `base` when the leaf rebased onto a newer main. Remove by verifying the exact `$AKROGON_BASE` sha the leaf sits on.
- Flaky unit reads as base red. `akrogon flaky` exists (system-speed F4); a base red needs a red retry like the leaf rule.

Practitioner questions (model knowledge, not yet searched): trunk-based teams (Google TAP, Chromium tree sheriffs) close the tree on red and give one owner the fix; Fowler "Eradicating Non-Determinism in Tests" (2011) says wrap the clock. Needs search before the round.

## #97 loop-counts

Evidence: log-tail.ts is 498 lines, prints one line per tool call with `#hash`, `old#/new#`, status and excerpt (log-tail.ts:412-420). Tests exist: skills/watch-issues/scripts/log-tail.test.ts. The bar is prose in watch-issues/SKILL.md:42.
Forks:
- Q1 Who owns the bar: script prints raw counts and the skill keeps thresholds (bar in two places), or script owns the whole mechanical bar and prints one `loop:` line with evidence, and the skill keeps only on-brief and hung-tool judgment. Lean: script owns it, skill text shrinks.
- Q2 Build at all: no observed missed or false loop call (seed Urgency). Value is a shorter skill paragraph and exact counts. Cost: about 50 lines plus tests.
Pitfalls: "same result" needs a result identity; today only status and a cut excerpt are printed. Hash the result text in the script, do not compare excerpts. `#-` (non-literal commands) must never count as a repeat (SKILL.md:42).

## #96 failed-cause

Evidence: `cause` enum is blocked|attempts (src/state.ts:13). `phase.ts:274` writes `blocked` for every requested `failed`. No src writer of `attempts` exists now, yet next.ts:780-784 still reads it (dead branch; old log records :601,:602,:735 have it).
Forks:
- Q1 Build a class field: a `--cause` value seats pass with `phase failed` (prerequisite | defect-elsewhere | base | own), watch acts on it. Or keep prose judgment and add only `base` through #98.
Pitfall: a wrongly classed human-prerequisite stop auto-recovers in a loop. The existing two-unproductive-cycle stop bounds it (SKILL.md:44).
Lean: fold `base` into #98, close #96's remaining part as not built unless the operator wants it.

## Steps on main
- None found yet. #98's skill text lives in skills/, which is leaf code.
