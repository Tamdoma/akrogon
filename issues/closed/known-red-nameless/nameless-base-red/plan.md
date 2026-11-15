# Plan: nameless-base-red

`knownRedReceipt` (src/verify.ts) stops refusing `(no test name)` head entries and still refuses `(log gone)`; every receipt gate (`requireGreenReceipt` → `transition`, `recordTested`, `batchCheck`, `landGates`, `batchPush`, `direct-guards`) follows that one function. Seat text in four skills and the docs state the new judgment rule and the blocked-check exception.

## Read first

- `src/verify.ts` — `knownRedReceipt`, `noTestNames`, `requireGreenReceipt`; comment block above `knownRedReceipt`.
- `src/flaky.ts` — `failedTests` markers `(no test name)` / `(log gone)`; `flips`/`newRedUnits` carry `(no test name)` as one unit unchanged.
- `tests/verify.test.ts` — `failureScript`, `memberFailureScript`, the `callerWorktree`/`seedRun`/`records` harness, the linked-pair test, the member known-red test.
- `tests/receipt-gates.test.ts` — gate wiring; no new case needed.
- `tests/helpers.ts` — `seedRun`, `greenReceipt`, `leaf`.
- `skills/implement-issue/SKILL.md` (line 40 known-red paragraph), `skills/check-issue/SKILL.md` (line 69), `skills/merge-issue/SKILL.md` (line 79), `skills/chart-issues/SKILL.md` (`## Direct route`, step 3, line 117).
- `docs/reference/checks.md` — `## Known red` (line 89) and the `verify known-red <sha>: fail` table row (line 148).
- `src/AREA.md` — verify paragraph (line 17, `requireGreenReceipt` tail).
- `tests/docs-links.test.ts` — phrase assertions checked: only the known-red command names, unchanged text; no test change needed there.
- `learnings/LESSONS.md` — no active lesson governs this leaf; relevant history is the 2026-10-10 lock this leaf reopens (design signposts cite it).

## Decisions

- D1 (answers "Open for the plan" Q1): `noTestNames` is deleted. The guard names `(log gone)` directly — `if (names.some((name) => name === '(log gone)')) return false;` — matching the literal `failedTests` returns. A one-entry list adds a constant only to hold one literal; the renamed comment states the rule: a gone log never covers, a nameless log is covered by a nameless base.
- D2: Name comparison is unchanged. `(no test name)` flows through `names.every(name => baseNames.includes(name))`, so a nameless head is covered by a nameless base, refused by a named base, and a named head is refused by a nameless base; `(log gone)` on the base covers nothing and the head guard refuses it on the head. `failedTests`, `flips`, `newRedUnits`, `verifyRunSchema`, `runOnce` and scheduling are untouched.
- D3 (answers "Open for the plan" Q2): Fixture helpers suffice. A nameless log is any log without a `(fail)` line; seeded `log(...)` writes produce one directly (`'boom\n'` in the linked-pair test). Two script helpers are added, mirroring `failureScript`/`memberFailureScript` but emitting no `(fail)` line: `namelessFailureScript` (checks `test: sh check.sh`, `echo runner-exploded; exit 7`) and `namelessMemberFailureScript` (checks `unit` green, merge member `sh check.sh` nameless red). A real `verify --known-red` produces the nameless base run at the merge-base; no seeded pair is needed for criterion 1.
- D4 (answers "Open for the plan" Q3): `tests/docs-links.test.ts` asserts only `akrogon verify --known-red`, `akrogon verify --attempt <id> --known-red` and `verify --holder <chart>/direct --known-red` — none of the changed sentences — so it is not touched (standing design: doc-phrase tests only where they already guard the changed sentence).
- D5: The blocked-sentence exception and the judgment rule are restated per seat in each skill's own paragraph (its own record file: `implementation/report.md`, `review-B.md`, `<chart>/direct/report.md`), keeping the paragraphs' existing shape.
- D6: Brief and design agree; no conflict note needed.

## Implementation checklist (waves)

One wave, three units; disjoint owned paths, no shared test resource, no prerequisites.

- U1 `src/verify.ts`: delete `noTestNames`; guard refuses `(log gone)` only; update the `knownRedReceipt` comment to state the nameless-cover rule.
- U2 seat text: `skills/implement-issue/SKILL.md` (line 40), `skills/check-issue/SKILL.md` (line 69), `skills/merge-issue/SKILL.md` (line 79), `skills/chart-issues/SKILL.md` `## Direct route` step 3 — state the judgment rule (named or nameless name-pair cover, runner completeness, causal fit, diff holds no plausible cause, leaf's own proofs pass on their own, withhold agreement when logs show too little) and the blocked exception (a `blocked` check behind an agreed known-red stays recorded as not run, never reported as passing, does not by itself stop the leaf; in chart-issues: named as not run in `<chart>/direct/report.md`).
- U3 docs: `docs/reference/checks.md` `## Known red` cover sentence and `verify known-red <sha>: fail` row; `src/AREA.md` verify paragraph's `requireGreenReceipt` tail.

Docs affected (agent and human, one line each): the four SKILL.md files (agent seats), `src/AREA.md` (agent), `docs/reference/checks.md` (human). `tests/AREA.md` checked — its "per-head-row known-red cover" line stays accurate, no change. `skills/AREA.md` checked — names no rule detail, no change. `README.md`, `docs/` other pages checked by grep for "no test name"/"names no failed test" — no hits outside checks.md.

## Tests already written and committed by this plan pass

- `verify --known-red covers a red command naming no test when the base run of it also names none` (new, tests/verify.test.ts)
- `known-red covers a red merge member naming no test when its base run also names none` (new, tests/verify.test.ts)
- `a linked pair fails to satisfy requireGreenReceipt with unnamed or unlinked failing work` extended with two seeded refusals: named head vs nameless base, named head vs gone base log.

## Done-criteria proof

### C1a — nameless leaf pair covered; pass line; phase move accepted

- Observation: `akrogon verify --known-red` on the head of an isolated fixture repo whose `checks.test` is a nameless failing script prints `verify known-red <sha>: pass`, exits 0, records a head run and a `compares` base run at the merge-base (both exit 7), and `akrogon phase caller check.review --slot A` exits 0 with `state.phase === 'check.review'`.
- Boundary: real CLI on a real fixture repo (helpers `fixture()`, `callerWorktree`, `cli`), not a stubbed receipt.
- Before: `verify` exits 1 — head entry `(no test name)` refused before any base comparison.
- After: pass + receipt accepted.
- Product failure caught: the reported stop — Tamdoma/akrogon#133's `shell` check class blocking every leaf.
- Command: `akrogon run-check --name nameless-cover -- bun test --timeout=30000 tests/verify.test.ts -t "covers a red command naming no test"`
- Size: seconds. Rerun trigger: any change to `knownRedReceipt` or `failedTests` markers; no model/outside stage, no recording.

Planned red (base a93fec75), recorded: `check nameless-cover: 1 .../check-nameless-cover-1794254494427-1909148.log` — `Expected: 0 Received: 1` at both new tests.

### C1b — merge-scope nameless pair satisfies the merge receipt gate

- Observation: `verify --attempt <id> --known-red` on a merge leaf whose `merge_checks.member` fails nameless prints `verify known-red <sha>: pass`; `requireGreenReceipt(repo, head, 'merge')` resolves.
- Boundary: same real CLI plus the exported gate function every merge path calls.
- Before: exit 1. After: pass + gate resolves.
- Command: `akrogon run-check --name nameless-cover -- bun test --timeout=30000 tests/verify.test.ts -t "covers a red merge member naming no test"`
- Size: seconds. Rerun trigger: same as C1a. Same run-check line as C1a covers both tests.

### C2 — preserved refusals

- Observation: `requireGreenReceipt` throws `No green leaf verify receipt for <sha>` for each seeded pair; `verify --known-red` exits non-zero for the named-mismatch pair.
- Boundary: `requireGreenReceipt` over `issues/verify-runs.jsonl` seeded records with real on-disk logs.
- Cases: existing — nameless head vs named base, gone head log, wrong command, unended base, unended head, bad-setup base, green base entry, all-named covered (kept); new — named head vs nameless base, named head vs gone base log (kept); different-named refusal via `refuses a head failure absent on the base` (kept).
- Command: `akrogon run-check --name linked-pair-base -- bun test --timeout=30000 tests/verify.test.ts -t "linked pair"` (recorded `check linked-pair-base: 0 .../check-linked-pair-base-1794254517259-1927984.log`, green on base — preserved behavior) and `-t "refuses a head failure absent|linked pair"` for the CLI refusal.
- Size: seconds. Rerun trigger: changes to `knownRedReceipt`/`failedTests`.

Checked conditions traced through `knownRedReceipt` (each value followed from `failedTests` to the `every`/`includes` comparison):

- nameless head vs named base must refuse — case: linked-pair seeded case 1; red shown under temp edit `names.every(name => baseNames.includes(name) || name === '(no test name)')` → `check cond-nameless-head: 1 .../check-cond-nameless-head-1794254527870-1937414.log` (fail at test line 598, first case). Edit discarded.
- named head vs nameless base must refuse — case: linked-pair new seeded case; red shown under temp edit `baseNames.includes('(no test name)') || ...` → `check cond-nameless-base: 1 .../check-cond-nameless-base-1794254533536-1942341.log` (fail at test line 616). Edit discarded.
- gone base log must refuse — case: linked-pair new seeded case; red shown under temp edit `baseNames.includes('(log gone)') || ...` → `check cond-gone-base: 1 .../check-cond-gone-base-1794254537479-1946092.log` (fail at test line 623). Edit discarded.
- gone head log must refuse — case: linked-pair existing seeded case; red shown under temp edits removing the `noTestNames` guard and relaxing `every` for `(log gone)` → `check cond-gone-head: 1 .../check-cond-gone-head-1794254545768-1953572.log` (fail at test line 609). Edit discarded.
- different named failures must refuse — case: `refuses a head failure absent on the base`; red shown under temp edit `return true` in `onCoveredBase` → `check cond-named-mismatch: 1 .../check-cond-named-mismatch-1794254553297-1960011.log` (exit 0 where non-zero expected; linked-pair also fails under it). Edit discarded.
- named cover must still pass — case: `reruns the failing command on a fresh checkout`; red shown under temp edit `return false` for every red entry → `check cond-named-cover: 1 .../check-cond-named-cover-1794254556985-1963723.log`. Edit discarded.
- `same name and same command` on the base, `completed` runs only, `compares` at merge-base, base exit 0 never covers, blocked entries skipped, `red > 0` required — the decision edits only the names guard and the `every` comparison; these checks live in lines the decision does not touch (`completed(run)` filter, `onBase` lookup, `onBase.exit === 0`, `blocked` skips), so a correct edit cannot reach them; they stay guarded by the existing seeded cases in the same test (command `--old`, `end: undefined`, `setup: 3`, exit-0 base entry), all green on base.

### C3 — four skill texts state the judgment rule and blocked exception

- Observation: `git diff` of the four SKILL.md files shows each known-red paragraph stating the Q2 2a rule and Q3 3d exception; `grep` shows none still says "logged a real test name" as the only path or "fixed first" without exception.
- Boundary: the text read against the design decisions in review (standing design: text criteria prove by the changed text read against the decision; no existing doc-phrase test guards these sentences — D4).
- Before: each paragraph says judgment means "the red command logged a real test name and that name also fails on the base" and "the check named as its blocker is fixed first."
- After: judgment rule covers both named and nameless pairs with the three findings and the withholding clause; the blocked sentence carries the agreed-known-red exception.
- Product failure caught: a seat applying the old rule would still stop every leaf or report a blocked check as passing.
- Command: `git diff "$AKROGON_BASE"...HEAD -- skills/implement-issue/SKILL.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md skills/chart-issues/SKILL.md` plus `grep -n "real test name\|fixed first" <files>`.
- Size: seconds. Rerun trigger: edits to those paragraphs.

### C4 — docs state the changed command rule

- Observation: `git diff` of `docs/reference/checks.md` (`## Known red` cover paragraph and the `verify known-red <sha>: fail` row) and `src/AREA.md` verify paragraph shows the nameless-pair cover rule and the still-refused cases; `grep -n "names no failed test\|names no test\|no test name"` shows no surviving "always uncovered" claim (the `fail` row's "or a red log names no failed test" clause removed; `## Known red`'s "A red command whose log names no failed test is uncovered." replaced).
- Before: docs say a nameless red is uncovered. After: nameless head covered by nameless base; named/nameless mismatches and gone logs refuse.
- Command: `git diff "$AKROGON_BASE"...HEAD -- docs/reference/checks.md src/AREA.md` plus the grep above.
- Size: seconds. Rerun trigger: edits to those files.

## Blockers

None. `env: []`, no credential named by the design, no paid or live operation. All runs are local tests through `akrogon run-check`; no grant needed, no launch count lines apply.
