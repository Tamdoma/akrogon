# Design: test-change-check

## Binding decisions, verbatim

From `issues/chart/agent-test-rules/forks/test-authority.md`:

Operator 2026-10-03: "1 - we need to fix the criterion as well. ..." (read as Q1 -> 1a plus a criterion bar, which became forks outcome-criteria and test-worth). Later: "8a | 9a | 2a | 3a |".
- Q1 -> 1a. Any seat (implementer, reviewer, merger) may change an existing assertion, fixture or recorded output only by citing the brief outcome or real source the old expectation contradicts, otherwise it does not change it. Adding new tests stays allowed. Foreclosed: 1b freeze all existing tests behind operator approval.
- Q2 -> 2a. `akrogon phase` diffs pre-existing test and fixture files against the leaf base and refuses the move unless each changed file is named with its cited source. Works for every harness and every write path. Foreclosed: 2b skill text only, 2c per-harness edit hooks.

From `issues/chart/agent-test-rules/forks/test-change-check.md`:

Operator 2026-10-03: "10a | 11a | 12a"
- Q10 -> 10a. One built-in path rule in akrogon source, no config: a path segment `test`, `tests`, `__tests__`, `fixture`, `fixtures`, `__fixtures__`, `__snapshots__`, `e2e`, `spec`, `specs`, `testdata`, `golden`, `goldens`, or a file name `*.test.*`, `*.spec.*`, `*.e2e.*`, `*_test.*`, `*.snap`. Foreclosed: 10b per-repo `test_paths` key.
- Q11 -> 11a. One commit trailer line per changed old test file in `<target>..HEAD`: `Test-Change: <exact path> <source and reason>`. The check requires an exact path match and non-empty text. Foreclosed: 11b folder lines, pass-file sections, a new citation file.
- Q12 -> 12a. A check-only form of the phase command runs the move's guards without moving; merge-issue runs it right before the push. Foreclosed: 12b no merge-time check.

Findings carried from that fork: old = status M, D or T in `git diff --no-renames <target>...HEAD` (renames count as delete plus add, new files need nothing). merge-issue pushes before `akrogon phase merged`, and after the push the diff is empty, so the merged move cannot check.

Q1 is copied as the rule this check enforces. Its wording in the skills, and what counts as a valid source, belong to `test-rules`. Excluded, owned by `test-rules`: outcome-criteria (4h, 9a), test-worth (5a, 6a, 7a), bad-base-test (8a) and test-authority Q3 (3a).

Standing design: `/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md`.
- "Writer and checker share one rule definition" (line 13). The path rule lives once in akrogon source. The skill text points to that source file instead of copying the list. The trailer format is stated once per skill, next to the instruction that makes the seat write it. If a skill keeps a copy of the list, it says why, and a test checks that the copy agrees.
- "Each done-criterion is proven by the cheapest sufficient test" (line 10). The boundary here is the `akrogon phase` command on a real temporary git repo, as `tests/phase.test.ts` already does. Pure unit tests of the path rule are worth adding only where they catch rule bugs more cheaply than that.
- "No vanity tests" and criterion-driven edge cases (lines 7-8). Edge cases are the ones the done-criteria name. Prose wording in skills is not tested, per `skills/check-issue/SKILL.md:51`.
- Auth, secrets, browser, chain and slow-run lines do not apply.

## Leaf architecture
- Owned code: `src/phase.ts` (new guard next to `requireNoIssueFiles` at :266, the call at :224, and the check-only path in `transition`/`phaseCommand`, which skips `completeOwner` at :293 (A,B)), `src/akrogon.ts:14` (`--check` boolean option for `phase`) and :51, a new path-rule module if the plan wants one, `tests/phase.test.ts`, `tests/command-reference.test.ts:15` (phase contract string).
- Owned prose: `README.md:136` command row, `docs/guide/merge.md:65-71` (the guard, `--check` before the push, and the refusal), `skills/merge-issue/SKILL.md:47` (run `--check` before the push, and the refusal handling), and one trailer sentence each in `skills/implement-issue/SKILL.md` (implement and check.fix, plus the trailer-only empty commit exception at :63), `skills/implement-issue/brief-template.md` (C), `skills/check-issue/SKILL.md` (check.review listing and check.repair) and `skills/merge-issue/SKILL.md`. `docs/guide/phases.md` belongs to `test-rules`. (A,B,C)
- Literal interfaces:
  - Trailer key `Test-Change`, value `<exact path> <source and reason>`, read with `git log --format='%(trailers:key=Test-Change,valueonly,unfold)' <target>..HEAD` (proved 2026-10-03, `readiness.yaml` proofs). Only the final trailer block counts, and the key matches case-insensitively. (A,C)
  - Old files from `git diff --no-renames --name-status <target>...HEAD` (status `M`, `D`, `T`).
  - Flag `--check` on `akrogon phase`. Success prints `ok`.
  - Merge call `akrogon phase <slug> merged --slot B --check`.
  - Path matching is case-sensitive. (A,C)
- Check order: the check-only run uses the same `transition` checks in the same order as a real move. It stops before `saveState` and `commitMove`. It is not a second copy of the guards.
- `test-rules` adds the rule-2 sentence (when a change is allowed and what it cites) in the same skill paragraphs. This leaf adds only the trailer sentence after it. Both leaves run in parallel. A rebase conflict keeps both sentences.
- Accepted: the check is path-level. It cannot tell an added case from a changed assertion inside one file, so any edit to an old test file needs a line, and B judges the claim. It does not see test data outside the rule's paths, such as a fixture in an unmatched folder. Those changes are caught only by B's review. A leaf already in flight that changed an old test file is refused at its next move. The refusal text is its full instruction (exact line, final trailer block, later empty commit allowed), so no other rollout step exists. (A,C)
- This leaf's own commits that change existing test files (`tests/phase.test.ts`, `tests/command-reference.test.ts`) carry the trailer.
- Exclusions: no config key, no folder-prefix lines, no citation file, no check on the `failed` move, no judging of citation quality in code, no edit under `issues/`.
- Dependencies: none.
