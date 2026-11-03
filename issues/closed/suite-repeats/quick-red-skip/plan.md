# Plan: quick-red-skip

## Decisions

- **D1 — Command order.** `verifyCommands` returns non-`full` `checks` in config order, then `full` checks in config order, then `merge_checks` at merge scope. The `merge_covers` filter applies first, unchanged. `full` names in `merge_checks` stay members (they keep the member stage rule); `full` membership decides blocking only inside the sequential stage. No `issues/config.yaml` edit on main.
- **D2 — Sequential-stage blocking.** When setup is red, every command entry records the setup exit and log; `full` entries also carry `blocked: 'setup'` (non-`full` entries keep their current unblocked shape). When setup is green, non-`full` checks always run; the first non-`full` red becomes the stage blocker and every `full` item is recorded `{exit: blocker.exit, log: blocker.log, blocked: blocker.name}` without executing. A red `full` check never feeds the stage blocker, so `full` checks run even after a sibling `full` goes red.
- **D3 — Member stage unchanged.** Merge members are recorded `blocked` when setup is red or any sequential entry is red (`full` entries included), exactly as today. The existing `ran.find((item) => item.exit !== 0)` blocker lookup still returns the real blocker because a `blocked` entry always sits after the red that produced it.
- **D4 — Per-command reuse deleted.** `reuseSource` and its two `runOnce` call sites go; the whole-receipt `greenRun` fast path (`reuse receipt <run> tree=<tree>`) stays. The `reused` schema field and every consumer guard (`slowEligible`, `newRedUnits`, `matching`, `knownRedReceipt`, `src/flaky.ts`) stay so old rows still parse and stay excluded. No new row writes `reused`.
- **D5 — `--known-red` base shortcut.** After computing `baseSha`, when `greenRun(repo, baseTree, scope)` (the existing predicate, unchanged: same tree, scope, completed, sameCommands, all exits 0) finds a row, the base pass is skipped and the call goes straight to `knownRedReceipt` — the same judge the gate uses. A whole-green base yields `fail`, today's outcome minus the wasted pass, because green base entries never cover a red head command.
- **D6 — Open question resolved: `akrogon config`.** It prints `withSetup` output — each `checks`/`merge_checks` entry in config order wrapped with setup — not `verifyCommands`. No consumer reads verify order from it, so no change.
- **D7 — `full` membership source.** `runOnce` reads `repo.config.full` live, the same source `run-check`'s admission flag uses. `PassRecord` schema is unchanged (`member_count` still marks the member boundary; `full` checks sit at the sequential tail by D1 order).
- **D8 — Consumers of blocked sequential entries.** `knownRedReceipt`, `newRedUnits`, `slowEligible`, `matching`, `src/flaky.ts` already skip `blocked` entries on both head and base rows; no consumer change needed. Recorded limitation (doc line): a `blocked` entry is never known-red cover, same as a blocked member today.

## Read-first

- `src/verify.ts` — `verifyCommands`, `runOnce` (sequential loop, member blocker, reuse sites), `verify` (`--known-red` branch), `greenRun`, `sameCommands`, `requireGreenReceipt`.
- `src/verify-pass.ts` — `PassRecord`, `member_count`, pass lifecycle.
- `src/config.ts` — `full` schema and refinement (lines ~49, ~99), `withSetup`/`effectiveConfig` (`akrogon config` output).
- `src/run-check.ts` (~309) — `full` admission flag source.
- `src/flaky.ts` — `reused`/`blocked` guards.
- `tests/helpers.ts` — `seedRun`, `greenReceipt`, `fixture`, `leaf`, `cli`.
- `tests/verify.test.ts`, `tests/slow-merge.test.ts`, `tests/flaky.test.ts`.
- `docs/reference/checks.md`, `docs/reference/commands.md`, `docs/reference/config.md`, `docs/use/merge-and-announce.md`, `src/AREA.md`, `tests/AREA.md`.
- `skills/implement-issue/SKILL.md` (`## Shared context`), `skills/check-issue/SKILL.md` (`## check.review`), `skills/merge-issue/SKILL.md` (`### Shared endings`), `skills/chart-issues/SKILL.md` (`## Direct route` step 3).

## Interfaces

No new interfaces. Existing pieces reused: `verifyRunSchema` (`reused`, `blocked` optional fields), `greenRun`, `knownRedReceipt`, `checkedRun`, `seedRun`/`greenReceipt` test helpers, `requireGreenReceipt` as the gate.

## Units and waves

Criterion tests are written and committed by A during plan.synthesis (before product code); the waves below cover product and docs.

### Wave 1

- **U-a — `src/verify.ts`:** D1 `verifyCommands` reorder; D2/D3 `runOnce` sequential blocking + member reuse removal; D4 `reuseSource` and `ledger` deletion; D5 `verify` base skip. Owns `src/verify.ts`.
- **U-b — docs and skills:** blocked-check and reuse copy per criterion 6 plus the same rule's other stale surfaces. Owns `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/chart-issues/SKILL.md`, `docs/reference/checks.md`, `docs/reference/commands.md`, `docs/reference/config.md`, `docs/use/merge-and-announce.md`, `src/AREA.md`, `tests/AREA.md`.

Wave 1 holds U-a and U-b together: disjoint paths, no shared test resource, no ordering dependency. Not serial-solo.

## Checklist — files and criteria

| File | Criterion |
| --- | --- |
| `src/verify.ts` | C1–C5 |
| `tests/verify.test.ts` | C1–C5 proofs (A-committed at plan.synthesis) |
| `tests/slow-merge.test.ts` | C4 slow-run exclusion proofs |
| `skills/implement-issue/SKILL.md` `## Shared context` | C6 |
| `skills/check-issue/SKILL.md` `## check.review` | C6 |
| `skills/merge-issue/SKILL.md` `### Shared endings` | C6 |
| `skills/chart-issues/SKILL.md` `## Direct route` step 3 | C6 |
| `docs/reference/checks.md` (`## What runs where`, `## Prove a commit with akrogon verify`, `## Known red`) | C6 |
| `docs/reference/commands.md` (`akrogon verify` row), `docs/reference/config.md` (`full` row), `docs/use/merge-and-announce.md` (step 1), `src/AREA.md`, `tests/AREA.md` | C6-adjacent stale reuse text |

Docs changed: implement-issue, check-issue, merge-issue, chart-issues skills; `docs/reference/checks.md`, `commands.md`, `config.md`, `docs/use/merge-and-announce.md`, `src/AREA.md`, `tests/AREA.md`. No other agent or human doc is affected.

## Criteria → proofs

Every test runs through `akrogon run-check --name <label> -- bun test <file> --test-name-pattern '<pattern>'` from the leaf worktree. Criterion tests are committed red-first on the leaf branch before any product code; recorded red outputs are below.

### C1 — red non-`full` check: others run, `full` blocked, row red, gate refuses

Test: `tests/verify.test.ts` `a red check outside full blocks every full check, and the fixed tree runs it green past the gate` (also proves C2). Config puts `suite` (a `full` check) first to prove reorder; `bad` is `test ! -f broken`. Asserts command order `[quick1, bad, quick2, suite]`, suite entry `{blocked:'bad'}` sharing bad's log, suite marker absent, quick markers present, exit 1, `requireGreenReceipt` rejects; then `git rm broken` on a new tree → suite executes, row green, `requireGreenReceipt` passes.

Setup branch: `a failed setup blocks full checks while other checks record the setup result unblocked` — `setup: 'exit 9'`; quick entry records `{exit:9}` unblocked (current shape), suite `{exit:9, blocked:'setup'}`, suite marker absent, gate refuses.

Observation: `issues/verify-runs.jsonl` row fields + marker files under `$fixture.home` + `requireGreenReceipt`. State before: no rows; after: red row with `blocked` entries / green row. Failure caught: full suite executing beside a red quick check (the 124.6 min waste). Command: `bun test tests/verify.test.ts --test-name-pattern 'red check outside full|failed setup blocks'`. Size: seconds. Rerun: any `src/verify.ts` or test change.

Condition check — "every other check outside `full` still runs": violation = a red sequential check suppresses a later check (stop-at-first-red). Case shown red at planning via temporary edit (`src/verify.ts` sequential loop pushes `blocked` for every item after the first red): T1's `quick2` assertions fail; red output recorded below, edit discarded before the test commit.

### C2 — after the fix on a new tree, `full` runs and the green row gates

Same test's second half (`git rm broken` → new tree → exit 0, suite ran, `requireGreenReceipt(fixed)` passes). Traced, not a separate case: `blocked` is per-row state written only inside the same pass; a new-tree pass has no carried blocker, and `greenRun` cannot match across trees. Command: same pattern as C1. Size: seconds.

### C3 — a red `full` check never blocks another `full` check

Test: `a red full check never blocks a later full check, while the merge members stay blocked` — merge scope; asserts `[quick 0, suite1 4, suite2 0, member 4]`, suite2 executed (marker present, no `blocked`), member `{blocked:'suite1'}` marker absent, gate refuses. Catches: an implementation that lets any sequential red block all later checks, or that frees members after a full red. Command: `--test-name-pattern 'red full check never'`. Size: seconds.

Condition check — "does not block": violation = red `full` blocks sibling `full`. Same temporary edit as C1's check makes `suite2` record `blocked`; the test fails on the suite2 marker and `blocked` assertions; red output recorded below, edit discarded.

### C4 — no `reused` on new rows; old `reused` rows parse and stay excluded

Tests:

- `a same-tree retry re-executes every unblocked command and writes no reused entry` (converted from the same-tree-reuse test): second pass on the same tree re-executes `first`/`after` (counts 2), `member` stays `{blocked:'bad'}` never ran, no entry carries `reused`.
- `a same-tree retry re-executes every merge member and writes no reused entry` (converted): `unit`, `m1`, `m2` counts all 2 across two passes; no `reused`.
- `changing one command text reruns every command in the next pass` (converted): both counts 2, no `reused`.
- `an incomplete or failed-setup run never satisfies the receipt, which a fresh pass records without reused entries` (renamed existing): receipt gate behavior unchanged.
- `the receipt schema accepts both old entries and entries carrying a reused source run` (unchanged): old `reused` rows still parse.
- Flaky exclusion: existing `tests/flaky.test.ts` `a reused green entry adds no flip, while a real later green still records one` stays green.
- Slow-run exclusion: `tests/slow-merge.test.ts` `only eligible rows enter the normal and checked bounds follow the design` (unchanged seeds) plus the converted `an open episode pins the normal, cites its first run, notifies once and recovers`, whose same-tree seed now carries `reused` itself and stays ineligible while the live run executes fresh.

Commands: `--test-name-pattern 'same-tree retry|command text|incomplete or failed-setup|receipt schema'` on verify.test.ts; `bun test tests/flaky.test.ts --test-name-pattern 'reused green entry'`; `bun test tests/slow-merge.test.ts --test-name-pattern 'open episode pins|eligible rows'`. Size: seconds (slow-merge under a minute). Rerun: verify.ts/flaky.ts/slow-merge.test.ts changes.

Condition check — "any new row holds no `reused` entry": violation = `reuseSource` kept, which is the current code, so the converted tests are red on the unmodified tree (recorded below). "Old rows stay excluded from flaky and slow-run counts": proved by the existing flaky case and the unchanged+converted slow-merge seeds; no new case needed — `flips` and `slowEligible` guards are unchanged code paths already under test.

### C5 — `--known-red` skips the base pass on a whole-green base and returns the gate's judgment

Tests:

- `verify --known-red runs no base pass when the base tree holds a whole-green row and fails like the gate` (new, leaf scope): `failureScript` red head, `greenReceipt` on the merge-base tree → exit 1, `verify known-red <sha>: fail`, zero `compares` rows in the ledger, head row red, `requireGreenReceipt` rejects — the same judgment the gate gives.
- `verify --known-red runs no base pass when the base tree holds a whole-green row and refuses the red head` (converted, merge scope): existing whole-green base seed now skips the base pass → no `compares` row, fail, gate refuses.
- `known-red passes when the red head member is covered by a fresh base run that fails the same names` (converted): the partial-green `seededBase` row is removed (it only existed to feed reuse); base pass runs, member fails `alpha` on base, known-red passes, gate accepts.

Observation: ledger rows (`compares` presence), stdout judgment line, `requireGreenReceipt`. Commands: `--test-name-pattern 'no base pass|fresh base run'`. Size: seconds. Rerun: verify.ts changes.

Condition check — "runs no base pass": violation = base pass always runs (current code) → converted/new tests are red on the unmodified tree (a `compares` row exists). "Same judgment the gate gives": `knownRedReceipt` is shared by CLI and gate — traced, not a separate case; both proofs assert CLI exit and gate outcome agree.

Recorded limitation: a `blocked` entry is never known-red cover. Guard is the existing `blocked !== undefined` skip in `knownRedReceipt`, already proved by `blocked merge members cannot provide known-red cover or flaky observations` (unchanged); documented in `docs/reference/checks.md` `## Known red`.

### C6 — skill and doc text

No test; check.review reads the changed sections. Per section:

- `skills/implement-issue/SKILL.md` `## Shared context`: replace "reusing each command already green on the base tree under the same name and command text and running only what lacks one" with the base-skip wording; add "a check recorded `blocked` did not run; fix the check named as its blocker first" to the red disposition.
- `skills/check-issue/SKILL.md` `## check.review` red-disposition paragraph: same two edits.
- `skills/merge-issue/SKILL.md` `### Shared endings` red-verify paragraph: same two edits.
- `skills/chart-issues/SKILL.md` `## Direct route` step 3: replace the same reuse clause with the base-skip wording (no blocked sentence — criterion names only the reuse promise here).
- `docs/reference/checks.md`: `## What runs where` — non-`full` checks first, then `full` checks; a red setup or non-`full` check records `full` entries `blocked` without running; a red `full` never blocks a `full`; a red `checks` entry still records members not run. `## Prove a commit` — drop per-command reuse from steps 2–3 and the reuse paragraph (whole-receipt `reuse receipt` stays); `## Known red` — drop per-command reuse, name the whole-green base skip and "a `blocked` entry never covers" beside the member rule.
- `docs/reference/commands.md` `akrogon verify` row, `docs/reference/config.md` `full` row, `docs/use/merge-and-announce.md` step 1, `src/AREA.md` verify bullets, `tests/AREA.md` verify.test.ts line: same rule updated — these carry the same stale claim even though the criterion lists only the first set.

## Restart boundaries

Not a slow-run leaf; each criterion test is seconds (slow-merge under a minute). No restart boundaries needed.

## Recorded notes and risks

- **R1:** Rows written before this leaf stop matching `sameCommands` once, at landing, only where a repo configures `full`; akrogon's config has no `full` entries, so live receipts are unaffected (design-accepted).
- **R2:** `blocked` `full` entries make `slowEligible` false by design; a merge run with a blocked `full` entry never enters the normal, same as a blocked member today.
- **R3:** The `--known-red` skip drops fresh base-side evidence on a whole-green base; framework's pending member split (verify-waste) repays green siblings on head retries — recorded limitation from the design.
- **N1:** Brief/design agreement check: no conflicts found; design's `full` naming refers to `checks` entries for the blocking rule, members keep their own stage rule.

## Red-first records

- C1/C3 condition violation (temporary `src/verify.ts` edit blocking every sequential item after the first red, discarded): `check plan-red-violation: 1 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-plan-red-violation-1793539446758-445214.log` — `suite2` recorded `4`/`blocked` instead of running (C3 violation shown red); the C1 test also failed on the reorder assertion.
- Criterion reds on the unmodified base: `check plan-red-verify: 1 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-plan-red-verify-1793539452393-447230.log` — fails: setup-blocks-full (`suite` recorded `{exit:9}` with no `blocked`), C1/C2 (order + `blocked` assertions), both `--known-red` no-base-pass tests (a `compares` row exists), both same-tree retry conversions and the command-text conversion (`reused` entries present). Passes on base as expected: the C3 test (no full-blocking exists yet) and the `fresh base run` conversion (behavior identical without the partial-green seed).
- Slow-merge conversion reds on the unmodified base: `check plan-red-slowmerge: 1 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-plan-red-slowmerge-1793539458635-451486.log` — the episode-pin test fails on the live `unit` entry carrying `reused`; the accepted-close test fails on order (`unit` ran before `extra`, never blocked).
- Kept-green unchanged proofs: `check plan-kept-verify: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-plan-kept-verify-1793539462221-452656.log` (receipt schema with a `reused` entry, renamed incomplete-run test, blocked-member cover/flaky test); `check plan-kept-flaky: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-plan-kept-flaky-1793539462434-453441.log` (`reused` green entry adds no flip); `check plan-kept-slowmerge: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-plan-kept-slowmerge-1793539464736-453846.log` (`reused`/`blocked` seeds excluded from the normal).
