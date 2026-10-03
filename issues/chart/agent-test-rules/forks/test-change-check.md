# Test change check

## Question
Q10. Which files count as tests for the `akrogon phase` check (2a), across all registered repos?
Q11. Where does the seat write the cited source for each changed existing test file, so the check can find it?
Q12. How does the merge step run the check, given it pushes before `akrogon phase merged`?

### Carries
- test-authority Q2 -> 2a: `akrogon phase` diffs pre-existing test and fixture files against the leaf base and refuses the move unless each changed file is named with its cited source. The check verifies a citation exists, never its quality (B judges).
- Registered repos (akrogon config): akrogon, framework, pi-extensions, mdcny-ghl-data-pulls, boulevard-automation, clinique-la-roya, lens, Himne, lingua-relay, blepsis. Toolkit `typescript: bun:test`.
- Framework layouts seen: `.claude/hooks/tests/**`, `.claude/skills/*/test/**`, `test/fixtures/renderer-expectations/*.json`, `test/fixture-network/**`, `integrations/tests/**`, `.claude/workflow/scripts/fixtures/**`.
- Seats moving phases with code changes: A (implement, check.fix), B (check.repair, merge). Pass files: implementation/report.md (A), review-B.md (B, including merge evidence per merge-issue:37,41). Leaf folder files live in the main checkout, not on the branch (src/phase.ts:254-260).

## Findings
- Exchange: [slots/round5-merged.md](../slots/round5-merged.md), [A](../slots/round5-A.md), [B](../slots/round5-B.md), [C](../slots/round5-C.md), rebuttals [B](../slots/round5-rebuttal-B.md), [C](../slots/round5-rebuttal-C.md).
- C ran a built-in path rule over `git ls-files` in all ten repos; it matched every known test layout and missed only boulevard `prototype/test-results/**` (generated output). B's inventory found no layout the rule misses (C R2). (A,C; B preferred a required per-repo `test_paths` key)
- A config key would live in `issues/config.yaml` (src/config.ts:91) where seats write, so a seat could shorten the list that checks it (C R1).
- Commit trailer agreed for the reason (A,B,C). Folder-prefix matching rejected because the operator chose "each changed file is named" (B F2).
- Old = status M, D or T in `git diff --no-renames <target>...HEAD` (B F1). Renames count as delete plus add. New files need nothing.
- merge-issue pushes at :47 before `akrogon phase merged` at :51; after push the diff is empty, so the merged move cannot check (B,C).
- Proof (2026-10-03, A, local git, no outside identity): throwaway repo in the session scratchpad, git 2.56.0. A leaf commit modified `tests/x.test.ts`, deleted `tests/y.test.ts` and added `tests/new.test.ts`, with a wrapped `Test-Change:` trailer for x. A later empty commit carried the trailer for y. `git diff --no-renames --name-status main...HEAD` returned `A tests/new.test.ts`, `M tests/x.test.ts`, `D tests/y.test.ts`. `git log --format='%(trailers:key=Test-Change,valueonly,unfold)' main..HEAD` returned both values, the wrapped one joined on one line. Cleanup: repo deleted, confirmed. Limits: C found that a `Test-Change:` line outside the final trailer block is not returned, and that without `unfold` a wrapped value splits (draft-review-C.md C3). The key matches case-insensitively.

## Taken
Operator 2026-10-03: "10a | 11a | 12a"
- Q10 -> 10a. One built-in path rule in akrogon source, no config: a path segment `test`, `tests`, `__tests__`, `fixture`, `fixtures`, `__fixtures__`, `__snapshots__`, `e2e`, `spec`, `specs`, `testdata`, `golden`, `goldens`, or a file name `*.test.*`, `*.spec.*`, `*.e2e.*`, `*_test.*`, `*.snap`. Foreclosed: 10b per-repo `test_paths` key.
- Q11 -> 11a. One commit trailer line per changed old test file in `<target>..HEAD`: `Test-Change: <exact path> <source and reason>`. The check requires an exact path match and non-empty text. Foreclosed: 11b folder lines, pass-file sections, a new citation file.
- Q12 -> 12a. A check-only form of the phase command runs the move's guards without moving; merge-issue runs it right before the push. Foreclosed: 12b no merge-time check.
