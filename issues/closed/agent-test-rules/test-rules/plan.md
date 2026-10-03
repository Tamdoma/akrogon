# Plan: test-rules

Scope: prose-only rewrite of akrogon's test and done-criteria rules across skill, asset and guide text. No code or test changes (design exclusion). `debate: no`, so this synthesis derives directly from the brief and locked design.

## Decisions

- D1 (4h outcome criteria): Done-criteria state observable results only, never a test file, an assertion or a test count. The plan picks the proof for each criterion and that proof is replaceable work, not contract. `shapes.md` Done-criteria template and implementer audit both state this and the audit refuses a criterion naming a test file, assertion or count, while still refusing `merge_checks` commands and out-of-ownership repo-health claims. In check.review a scenario a criterion names blocks as an outcome, not as a named test; B judges the diff against the brief's done-criteria and the plan. `plan-issue/SKILL.md:61-63` already maps criteria to chosen proofs and names no test as contract: read, no edit.
- D2 (rule 2, cited source): Canonical sentence, used verbatim in `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md` check.repair and `skills/merge-issue/SKILL.md`: "an existing assertion, fixture or recorded output changes or is deleted only with a cited brief outcome or real source that the old expectation contradicts. A new test needs no cited source." "Real source" means the same as the check.review Fix bar (`check-issue/SKILL.md:49`): a real build, user action or content, integration or attacker-reachable input. Adding a case to an existing test file changes no expectation, so it cites no source; the `Test-Change:` trailer mechanics belong to `test-change-check`, never stated here. In check.review, B judges each changed existing expectation against the source it cites.
- D3 (5a, test boundary): Default to the smallest test at the real boundary (CLI, HTTP, browser, DB); unit or property tests only for logic that matters where they catch bugs more cheaply; E2E only where smaller tests miss browser, runtime or wiring bugs. Lands next to standing-design.md's "No vanity tests" and "cheapest sufficient test" lines (7, 10) and in the implement-issue test-set paragraph, brief-template.md section 2, check-issue test blocking and phases.md.
- D4 (6a, deletion): Delete a false or outdated expectation with its reason. Delete a duplicate only after naming the test that still catches the same bug. Judge a batch of deletions as a batch. Keep every test that guards a real past regression. Same surfaces as D3.
- D5 (7a, break proof): A bug fix shows its test failing before and passing after; new behavior shows one deliberate break turning its test red; no mutation score. Same surfaces as D3.
- D6 (8a, wrong test red on base): One added case inside the existing base-run paragraphs of `implement-issue/SKILL.md:38` and `check-issue/SKILL.md:59` and the merge fix-forward line `merge-issue/SKILL.md:45`: a test proven red on base whose expectation is wrong under rule 2 is fixed in its own commit with the reason, then the seat continues; the fix may touch a test outside the plan's owned paths and A commits it in the lane, never a worker, in delegated and inline mode alike; a test red on base because code is really broken keeps `failed --reason "<command> red on base <sha>"`; other leaves get the fix by rebase. In check.review no seat commits (blind review, `check-issue/SKILL.md:37`), so a wrong base test proven there is recorded as a Fix whose realistic source is the brief outcome or real source the test contradicts, and B fixes it first in check.repair. Held disagreement: B reads 8a as fix-in-the-proving-pass including check.review; the check.repair route stays because a commit during check.review changes the head the peer reviews blind and B still makes the one fix in its next pass.
- D7 (guide parity): `docs/guide/phases.md` states rules 1 to 4 in operator-facing prose at its existing anchor lines (:92 test rules, :94 and :102 base-red stop and Fix bar) matching the skill text. No new sections.

## Read-first list

- `issues/open/agent-test-rules/test-rules/brief.md` and `design.md` (verbatim locked wording; D2's canonical sentence and the 8a check.review route live there)
- `skills/implement-issue/SKILL.md` (:38 base-run paragraph, :57 test set, :75 check.fix)
- `skills/implement-issue/brief-template.md` (:13 section 2 test-set rule; :47 E2E line stays)
- `skills/check-issue/SKILL.md` (:37 blind review, :39 B judging input, :49 realistic source, :51 test blocking, :55 always-block, :59 base-run, :75 check.repair)
- `skills/merge-issue/SKILL.md` (:43-45 red checks after rebase and fix forward)
- `skills/chart-issues/assets/shapes.md` (:134 Done-criteria template, :252 implementer audit)
- `skills/chart-issues/assets/standing-design.md` (lines 7-10 vanity/cheapest-test lines; line 13 independent expectations is why rule 2 exists; lines 8, 9 unchanged)
- `docs/guide/phases.md` (:92, :94, :102)
- `skills/plan-issue/SKILL.md` (:59-63 proof mapping; verify no test-as-contract wording, no edit)
- `skills/implement-issue/ponytail.md` (read for context; its "smallest runnable check" rule is standalone scope, out of leaf)

## Needed interfaces

None new. The `Test-Change:` trailer, `akrogon phase --check` and B's trailer listing in check.review belong to `test-change-check`, which appends its own sentence after rule 2 in the same files; both leaves edit in parallel and a rebase conflict resolves by keeping both sentences.

## Checklist

### Wave 1

- U1 `skills/chart-issues/assets/shapes.md`, `skills/chart-issues/assets/standing-design.md` (criterion 1; 5a-7a on standing-design lines 7-10)
  - shapes.md:134: rewrite the Done-criteria template placeholder to require an observable result and forbid a test file, assertion or count; keep the `merge_checks`/repo-health exclusions.
  - shapes.md:252 audit paragraph: state the same outcome-only rule, refuse a criterion naming a test file, assertion or count, keep the `merge_checks` refusal and the repo-wide `checks` allowance.
  - standing-design.md lines 7-10: add 5a's boundary-first order (smallest test at the real boundary; unit/property only for logic that matters; E2E only where smaller tests miss browser, runtime or wiring bugs), 6a's deletion rule and 7a's break proof next to "No vanity tests"/"cheapest sufficient test"; do not restate line 9's artifact rule; lines 8 and 13 unchanged.
  - Shared test resource: none. Lands first: none.
- U2 `skills/implement-issue/SKILL.md`, `skills/implement-issue/brief-template.md`, `skills/merge-issue/SKILL.md` (criteria 3, 4)
  - implement-issue :57: add D2's canonical sentence plus 5a, 6a, 7a to the test-set paragraph.
  - brief-template.md :13: same additions to section 2 (worker copy of the test-set rule); :47 stays.
  - implement-issue :75 (check.fix): state that a repair changes or deletes an existing expectation only per rule 2's canonical sentence.
  - implement-issue :38 (base-run): insert the 8a case after "Red on base requires both runs completed" - wrong expectation fixed in its own commit with the reason, may touch a test outside the plan's owned paths, A commits it in the lane, never a worker; really-broken code keeps the `failed` stop; mechanics (worktree, logs, incomplete runs) unchanged.
  - merge-issue :43-45: add rule 2's canonical sentence for the merger and the 8a case for a wrong test exposed by the rebase.
  - Shared test resource: none. Lands first: none.
- U3 `skills/check-issue/SKILL.md` (criteria 2, 3, 4)
  - :39: B judges the diff against the brief's done-criteria as well as the plan.
  - :49-51: state that B judges each changed existing expectation against its cited source; add 5a, 6a, 7a to the test-blocking paragraph.
  - :55: a scenario a criterion names blocks as an outcome the criterion names, not as a named test.
  - :59 (base-run): insert the 8a case; a wrong base test proven in check.review is a Fix sourced by the brief outcome or real source it contradicts, and B fixes it first in check.repair.
  - check.repair (:75): state rule 2's canonical sentence for repair changes to existing expectations.
  - Shared test resource: none. Lands first: none.

### Wave 2

- U4 `docs/guide/phases.md` (criterion 4; guide parity for rules 1-4)
  - :92, :94, :102: describe outcome-only criteria and proof-not-contract, rules 2/5a-7a, and the 8a case (wrong expectation fixed in its own commit with reason; really-broken base keeps `failed`) in the same meaning as the skill text.
  - Shared test resource: none. Lands first: U1, U2, U3 (the guide mirrors landed wording so it cannot drift from a worker's paraphrase).

Doc checklist: `docs/guide/phases.md` is the only human doc affected. Agent-facing docs edited: the four skill/asset files above. `skills/plan-issue/SKILL.md` read and left unchanged; `skills/implement-issue/ponytail.md` is standalone-scope context, not edited. No `AREA.md`, index or README line references the changed rules (verified by grep), so none is affected.

## Verification

Each done-criterion maps to a proof command, the failure it catches, a size and a rerun trigger. All are grep/read proofs over the diff: seconds each, rerun on any commit touching the same file.

- Criterion 1: `grep -n "test file\|assertion\|test count\|observable" skills/chart-issues/assets/shapes.md` shows the template (:134) and audit (:252) require observable results and the audit refuses test file/assertion/count criteria, and `git diff` shows the old "a test this leaf adds" recipe wording gone while the `merge_checks` and repo-health refusals remain; `grep -n "proof" skills/plan-issue/SKILL.md` confirms the plan-picks-proof mapping intact and `git diff` shows the file unchanged. Catches: template still making tests contract, or a weakened audit. Size: seconds. Rerun: any diff in either file.
- Criterion 2: `git diff` plus `grep -n "cited\|outcome\|source\|blocks" skills/check-issue/SKILL.md` shows outcome-blocking at :39/:55, per-changed-expectation judging, 5a/6a/7a in test blocking, and the wrong-base-test Fix route. Catches: a named test still blocking, or review missing the citation judgment. Size: seconds. Rerun: any diff in the file.
- Criterion 3: `grep -Fn "an existing assertion, fixture or recorded output" skills/implement-issue/SKILL.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md` prints one identical canonical sentence in each (implement, check.repair, merge), and `grep -n` on `brief-template.md` and `standing-design.md` shows 5a/6a/7a present. Catches: a paraphrased or missing rule-2 copy. Size: seconds. Rerun: any diff in the files.
- Criterion 4: `grep -n "red on base\|own commit\|outside the plan's owned paths" skills/implement-issue/SKILL.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md docs/guide/phases.md` shows the 8a case in the base-run paragraphs and merge fix-forward line, the lane-commit restriction, the kept `failed` stop for really-broken base, and guide parity for rules 1-4. Catches: an 8a surface missed, or the `failed` stop lost. Size: seconds. Rerun: any diff in the files.
- All `checks` commands run before handoff: `bun run format`, `bun test --timeout=30000`, `bun run typecheck` and `test_changed` against `AKROGON_BASE`. No `merge_checks` configured and none added; the brief names no whole-run criterion. A `Test-Change:` trailer belongs to `test-change-check` and is not required by this leaf.

## Exclusions held

No test selection or speed changes (framework-test-scope, akrogon-slow-phases); no one-time prune; no brief lock; no code or test edits; no trailer format, `--check` or guard description (`test-change-check` owns those plus `README.md` and `docs/guide/merge.md`); no edit under `issues/` or to `plan-issue/SKILL.md`.
