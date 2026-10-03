# Review B: test-change-check

Date: 2026-10-03
Base: a97d4a11eae4bbc4f1d460eb5fa6a343ef895552
Reviewed head: 1477faeb21fb269c919caa9c7c682b25b41ad93f
Verdict: fix

## Findings

### F1. Fix: README omits the new refusal

Source: the operator command reference in README.md:136, used to discover phase behavior. The phase row documents --check but says nothing about refusing changed old test files without citations. `rg -n 'Test-Change|citation|test files|refus' README.md` confirms there is no description elsewhere in README. Consequence today: this command reference omits the newly enforced condition for moving existing leaves. Brief done-criterion 4 explicitly requires README and docs/guide/merge.md to show --check and the refusal, and plan D8 requires README effect text to name the guard. Add the refusal to the phase effect text. The guide already documents it.

### F2. Nit: inaccurate command-reference trailer explanation

Commit 6a7ae148ceb5ff65a4bf0940a4db1e084f6443e5 says no existing expectation changed for tests/command-reference.test.ts, but its existing phase contract gains [--check]. Deferred because the cited leaf plan actually requires that literal change (D6), and brief criterion 3 supplies the real source, so the expectation change is authorized. Promote to Fix if an altered expectation lacks that brief outcome or real source. Any later correction should use another commit, not rewritten history.

### F3. Nit: refusal tests couple to explanatory prose

New tests/phase.test.ts assertions match 'final trailer block' and 'empty commit'. Those words do not run as commands, numbers or fixed references. Deferred because the current test passes and the functional refusal is already asserted by nonzero exit, named paths and unchanged state. Promote to Fix if a valid wording change actually fails the suite or those assertions become the only proof of a required outcome. The literal Test-Change line and ok output are command contracts.

## Verification

Read brief, plan, design and implementation report before the diff, plus the installed check-issue skill and ponytail reference. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read. No AREA.md changed. Opened affected merge guide, README, workflow skills and reference index. No missing changed-document pointers found.

Inspected the entire diff and transition flow: failed moves exit before guards; recovery runs citations; M/D/T use target...HEAD with --no-renames; trailers use target..HEAD; --check shares validations and returns before state writes, skipping completeOwner for merged leaves. The writer, repair and merge instructions contain trailers, and merge runs --check immediately before push.

Reused unchanged report evidence for format, full suite (413 pass), typecheck and changed tests. Reran affected tests because the report lacked deliberate-break proof:
`bun test tests/phase.test.ts tests/command-reference.test.ts tests/docs-links.test.ts --timeout=30000` -> exit 0, 60 pass, 0 fail, 1576 assertions.

In a detached reviewed-head checkout, removed only the citation guard call: `bun test tests/phase.test.ts -t 'modified old test files need' --timeout=30000` -> exit 1 at the nonzero-exit assertion. Separately removed only the check-only early return: `bun test tests/phase.test.ts -t 'phase --check runs' --timeout=30000` -> exit 1, expected ok but got moved check.review. Logs:
- /tmp/akrogon-1000/test-change-check-6d5154c57d53/test-change-review-5effqvm1/citation-guard.log
- /tmp/akrogon-1000/test-change-check-6d5154c57d53/test-change-review-5effqvm1/check-only.log

The first detached proof attempt could not resolve zod because this worktree inherits dependencies from the registered checkout. It established no behavior result. Corrected the detached checkout dependency link to the existing registered node_modules, then obtained the failures above. Both detached worktrees were removed. No reviewed code was changed.

## Test-Change trailers

`git log --format='%(trailers:key=Test-Change,valueonly,unfold)' origin/main..HEAD` has the following trailers, both on 6a7ae148ceb5ff65a4bf0940a4db1e084f6443e5:

- Test-Change: tests/phase.test.ts new coverage added by this leaf's plan; no existing expectation changed
- Test-Change: tests/command-reference.test.ts new coverage added by this leaf's plan; no existing expectation changed

The phase file adds coverage without altering existing assertions. The command-reference change is required by D6 and brief criterion 3, with the explanation concern recorded as F2. Both changed old test paths have trailers. No operator actions or live credentials are required.

## 2026-10-03 check.repair

Input: both initial reviews of 1477faeb21fb269c919caa9c7c682b25b41ad93f. References below prefix the seat to disambiguate its finding numbers.
Repaired head: 3f975cd (full SHA obtainable from git).

- A/F1 repaired in 13e6959: added tests/test-files.test.ts enumerating all 13 directory segments, all five basename patterns, uppercase rejection and unrelated names. This is missing-test coverage, with no production behavior changed and no old assertions changed. Before: phase scenarios did not exercise the fixture segment. After: 2 unit tests pass with 71 assertions. Removing only fixture from the segment list in a detached checkout makes the new test fail (expected true, received false), exit 1, 1 pass / 1 fail. Log: /tmp/akrogon-1000/test-change-check-6d5154c57d53/path-rule-repair-f5jo4dx4/missing-fixture.log. Detached worktree removed after proof. The new file needs no Test-Change trailer.
- A/F2 repaired in 53dc340: guide before said “Every phase move also checks”; after says “Every phase move except a move to `failed` also checks”. This matches transition's early failed branch. Before/after confirmed with git diff.
- B/F1 repaired in 3f975cd: README phase effect previously described recording, failure and --check only. It now says “Moves except failed refuse changed old test files without Test-Change trailers; src/test-files.ts defines the path rule.” Before/after confirmed with git diff. Existing command contract is unchanged.

No Nit received separate work. No operator actions are open. No Fix is handed to A.

### Verification after repairs

- `bun run format`: exit 0, all files unchanged, 0.84 seconds.
- `bun test --timeout=30000`: exit 0, 415 pass / 0 fail, 4554 assertions, 20 files, 17.58 seconds.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 59 pass / 0 fail, 1639 assertions, 3 files, 1.56 seconds. Base remains a97d4a11eae4bbc4f1d460eb5fa6a343ef895552.
- `bun run typecheck`: tsc --noEmit completed without errors, 2.58 seconds including the subsequent path listing.
- `rg -l 'Test-Change' skills/implement-issue/SKILL.md skills/implement-issue/brief-template.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md`: all four paths returned.

Criteria 1 and 2: full suite and changed run pass all M/D/T, matching trailer, bare/wrong trailer, rename, empty commit, additions/non-test and failed-recovery scenarios. New rule tests prove the complete path list.
Criterion 3: full suite and changed run pass the check-only acceptance/refusal/state/history/folder scenarios and failed destination rejection. Initial review's deliberate-break proof remains valid because code is unchanged.
Criterion 4: full suite includes passing command-reference and docs-link tests. Reviewed updated README and guide, plus unchanged writer/reviewer/repair/merge instruction placement. Both operator documents now show --check and the refusal, the guide excludes failed, all required skills have trailers, check.review lists them, and merge calls --check immediately before push.

Final worktree is clean. Only README.md, docs/guide/merge.md and the new tests/test-files.test.ts changed in this repair. No merge_checks run.

## 2026-10-03 merge

Prior reviewed/repaired head: 3f975cd637d5422c8b72d3a7601818b0001d53d1.
Fetched/rebased target and refreshed AKROGON_BASE: 089a36f75dffb22c04db433b6f93a474078e0d64.
Rebased head: b91483575ad84fca783a64bea6c99b1b0e60ebaa.
Rebase completed without conflicts. Existing cited-source merge instructions from the target and this leaf's trailer/check-only instructions are both retained.

Range comparison:
```
1:  1454e15 = 1:  a6d84d3 feat(phase): guard changed test files behind Test-Change trailers and add --check
2:  6a7ae14 = 2:  65f79b9 test(phase): cover Test-Change citation guard and --check
3:  6b77dee = 3:  7e0a7a8 fix(phase): trim trailer values before matching Test-Change citations
4:  64d9320 ! 4:  8b04c9c docs(skills): state the Test-Change trailer rule and merge --check step
    @@ skills/merge-issue/SKILL.md: The merge seat reuses `grants[]` for probes, implem
      
     @@ skills/merge-issue/SKILL.md: On red checks, append the failing output, the rebase target commit and the rebas
      
    - Same-line index conflicts retain both true entries and recheck pointers; a broken default branch discovered by this leaf is fixed forward with failing tests as criteria.
    + Same-line index conflicts retain both true entries and recheck pointers. An existing assertion, fixture or recorded output changes or is deleted only with a cited brief outcome or real source (a real build, user action or content, integration or attacker-reachable input) that the old expectation contradicts. A new test needs no cited source. A wrong test exposed by the rebase, its expectation contradicting a brief outcome or a real source, is fixed in its own commit with the reason and the merge continues; a broken default branch discovered by this leaf is fixed forward with failing tests as criteria.
      
     +After green checks and before the push, B runs `akrogon phase <slug> merged --slot B --check`, which verifies the `Test-Change:` trailers on the changed files matched by the path rule in `src/test-files.ts`; on a refusal B adds a commit carrying the missing trailer when the change has a real source, a trailer-only empty commit when the change sits inside a rebased commit, or reverts the change, then reruns the checks and `--check` before pushing.
     +
5:  1477fae = 5:  660f5e9 docs: show --check on akrogon phase and the Test-Change trailer guard
6:  13e6959 = 6:  4a83031 test: cover the locked test-file path rule
7:  53dc340 = 7:  f4ba4b5 docs: exempt failed moves from the citation guard
8:  3f975cd = 8:  b914835 docs: describe the phase test-change refusal

```

Checks on rebased head:
- bun run format: exit 0, all files unchanged, 0.71 seconds.
- bun test --timeout=30000: exit 0, 415 pass / 0 fail, 4554 assertions, 20 files, 17.09 seconds.
- bun run typecheck: exit 0, 3.00 seconds.
- Configured test_changed command with refreshed AKROGON_BASE: exit 0, 59 pass / 0 fail, 1639 assertions, 3 files, 1.27 seconds. An initial changed run inherited the old base, also passed, and was superseded by this refreshed-base run.
No merge_checks or advisory commands configured. Worktree clean. Both old test paths still have their trailers after rebase. Nits remain deferred, with no new reusable mechanism to record.

Gathered completion context: both test-change-check/brief.md and test-rules/brief.md under the agent-test-rules owner.
The next pre-push check uses bun src/akrogon.ts to exercise the exact rebased implementation of akrogon phase, including its newly added --check flag.

Pre-push `bun src/akrogon.ts phase test-change-check merged --slot B --check`: exit 0, output `ok`. Then `git push origin HEAD:main`: exit 0, confirmed fast-forward 089a36f..b914835 to https://github.com/Tamdoma/akrogon.git.
