# Plan: suite-refusal

Direct synthesis (debate: no). Amended 2026-10-24: the `--scope merge` route is dropped; merge checks run only at the merge turn, check.fix reproduces a red narrowly. Brief and locked design agree; no conflicts.

## Decisions

- D1 — Refusal lives in `runCheck` (src/run-check.ts), after `requireRepo` and before `checkedRun`: `argv` matches a `merge_checks` entry in any of three forms → write to stderr a line naming `akrogon verify --attempt <id>` as the only merge-check route and that a red is reproduced with a narrower command, return 1. No run root, no spawn, no log. `checks` entries are never matched (design: implement and check.fix run them through their printed form).
- D2 — Form 1 tokenizes the entry text with `parse` from `shell-quote` (existing dependency, used by src/next.ts:304), mapping each token to its string or `op`; the argv match is token-equality against that list. `$(...)` stays literal and `$VAR` parses empty — good enough for the exact-equality rule, since a hand-typed equivalent never reproduces those forms byte-for-byte anyway. Forms 2 and 3 are exact: `argv = ['sh','-c',text]` and `argv = ['sh','-c', setupCommand(config,text)]`. Any other argv runs.
- D3 — `withSetup` (src/config.ts:352) maps `merge_checks` to the literal `akrogon verify --attempt <id>`; `checks` and `advisory` keep `runCheck` lines. Update the three merge_checks assertions in tests/config.test.ts (:351, :404, :421) and retitle :387.
- D4 — Skill edits (criterion 4): implement-issue :67/:82/:84/:88 and check-issue :69/:93 name the run-check refusal of configured `merge_checks` and that a red merge is reproduced in check.fix with the narrowest failing command (e.g. failing test files) on run-check, never the whole merge suite; merge-issue names the same pair in its red-verify handoff (:79). plan-issue is out of criterion 4's list.
- D5 — Docs: `docs/reference/checks.md` run-check section names the refusal and the merge-turn route; `docs/reference/config.md` `merge_checks` row names the printed `akrogon verify --attempt <id>`; `docs/reference/commands.md` run-check row effect mentions the refusal (argument contract unchanged).

## Read-first

- src/run-check.ts (runCheck, checkedRun, refuse)
- src/config.ts:346-363 (setupCommand, withSetup)
- tests/helpers.ts (fixture, cli, leaf, printedChecks), tests/run-check.test.ts, tests/config.test.ts
- tests/docs-links.test.ts:160 skill-content tests
- skills/implement-issue/SKILL.md (:40, :67, :82-88), skills/merge-issue/SKILL.md (:45, :79), skills/check-issue/SKILL.md (:69, :93); docs/reference/{checks,config,commands}.md

## Interfaces

- Form-1 words come from `parse` (shell-quote) in src/run-check.ts; no new helper or dependency.
- `withSetup` output: `merge_checks` values are `akrogon verify --attempt <id>`.
- No `verify` signature or dispatch change (operator amendment).

## Checklist

Wave 1 (disjoint paths):
- U1 — src product change: src/run-check.ts (D1, D2), src/config.ts withSetup (D3), src/AREA.md run-check/config lines. Planned red tests prove it.
- U2 — docs and skills: skills/implement-issue/SKILL.md, skills/merge-issue/SKILL.md, skills/check-issue/SKILL.md (D4); docs/reference/checks.md, docs/reference/config.md, docs/reference/commands.md (D5).

Wave 2 (verification, after U1):
- U3 — verify test expectations green: `bun test tests/run-check.test.ts tests/config.test.ts tests/docs-links.test.ts`. No new code; rerun and record.

Tests were written and committed on the leaf branch during plan.synthesis (before product code): additions to tests/run-check.test.ts and tests/docs-links.test.ts; expectation updates to tests/config.test.ts.

## Verification

| Criterion | Proof | Command | Size | Rerun trigger |
| --- | --- | --- | --- | --- |
| 1. run-check refuses the three forms, exits non-zero, starts no process, prints `akrogon verify --attempt` and a narrower reproduction | New test in tests/run-check.test.ts: config merge_checks entry `touch <marker> && echo suite`, with and without `setup`; for each form (words argv, `sh -c 'text'`, `sh -c setupCommand(text)`) `cli` run-check → code≠0, stderr contains `akrogon verify --attempt` and `narrow`, `existsSync(marker)` false, no `check-*.log` in the leaf. Product failure caught: refusal absent or a spawn before refusal. | `akrogon run-check --name crit1 -- bun test --timeout=30000 tests/run-check.test.ts -t refuses` | seconds | src/run-check.ts, src/config.ts setupCommand |
| 2. run-check still runs printed checks form, entry text + extra args, other commands | Same file: printed form of a `checks` entry via `akrogon config` + printedChecks, `['echo','suite','extra']`, `sh -c 'echo suite' extra`, `['echo','other']` all exit 0 with output kept. | same run as C1 | seconds | same |
| 3. `akrogon config` prints `akrogon verify --attempt <id>` per merge_checks entry | Updated expectations in tests/config.test.ts :337, :387 asserting `merge_checks: { full/m: 'akrogon verify --attempt <id>' }`. | `akrogon run-check --name crit3 -- bun test --timeout=30000 tests/config.test.ts -t merge` | seconds | src/config.ts withSetup |
| 4. Three SKILL.md files name the refusal and narrowest-failing-command reproduction on run-check | Semantic proof: the three skill sites' edited lines, quoted in implementation/report.md. (Corrected at check.fix — the planned docs-links regex test enforced prose wording, which the review rule rejects; old command `bun test tests/docs-links.test.ts -t 'run-check refusal'`, correction recorded in report.md.) | none — see report.md | seconds | the three SKILL.md files |

No env vars required. No new proof machinery: all proofs use `bun test` on the leaf's own tests.

## Planned reds (run at plan.synthesis)

- C1 (`crit1-crit2` log `implementation/check-crit1-crit2-1792875851992-3880893.log`): red — expected `akrogon verify --attempt`, got a run instead; the refusal does not exist. The C2 allowlist case passed on the pre-leaf code as required.
- C3 (`crit3` log `implementation/check-crit3-1792875880130-3885952.log`): red — config still prints the run-check line for merge_checks.
- C4 (`crit4` log `implementation/check-crit4-1792876047151-4065794.log`): red — the SKILL.md files do not name the refusal.

## Notes

- The `member-receipts` leaf owns receipt-reuse and fresh-base skill lines; this leaf owns only the refusal, the config print and the named doc/skill sites (per the locked design's Leaf architecture).
- `verify`'s own `checkedRun` calls bypass `runCheck`, so verify is never refused by its own merge_checks — locked shape.
