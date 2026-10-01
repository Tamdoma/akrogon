# Review B: check-scheduling

Verdict: nits
Base: `9ea5dd0ae720970b37e0175d7b109c913d29a242`
Reviewed head: `af8d3639047a5ee0ddf0bba9019248744639cc9a`
Initial blind review. Debate is disabled, so no B positions or rebuttal apply. No peer review read.

## Findings

No blocking Fixes.

N1: `skills/AREA.md:22` compresses the schedule to proof and `checks` before review, with `merge_checks` only at merge. Unlike the implementing skill and phases guide, this overview omits unchanged-evidence reuse and the criterion requiring a whole run exception. Concern: a reader using only this overview could treat the merge timing as absolute. Deferred because the overview points to the implementation skill, whose implement and repair rules explicitly contain the exception and reuse obligation, and no actual skipped criterion proof is demonstrated. Promote to Fix with a real leaf/seat trace showing the overview causes required whole-run proof to be skipped. The implement and repair contracts themselves satisfy Q2; this is an overview completeness concern against D7, not a new acceptance rule.

## Verification

- Read plan, locked design, implementation report, reference index, full committed diff, implementation skill and worker resources, phases and merge guide, unchanged merge/review skills, chart audit and standing design. Seven prose files changed. No code, tests, issue artifacts, new dependencies or abstractions introduced.
- Traced an implement and repair pass: workers receive changed tests only; A supplies criterion proof, affected-consumer changed tests and every `checks` command; unchanged evidence is reused; `merge_checks` stays at merge with the criterion exception. A red proof/check becomes a scoped repair sub-brief. Merge still runs both maps in order. Chart audit refuses merge-check and outside-ownership repo-health criteria and gates repo-wide checks on a property no smaller test proves.
- C1 search with `rg -n 'full suite|full-suite|gets it added' skills docs/guide docs` returned only `brief-template.md:39` (forbids replacing targeted checks with a full suite) and `init-akrogon/SKILL.md:20` (places slow suites at merge). Both are the allowed matches. No old prerequisite-route sentence remains.
- C2/C3 checked by reading the committed diff and live rules. Both implement end and repair contain the six Q2 obligations. No deleted full-suite repair requirement remains. Chart placeholder and audit agree on exclusions.
- C4 checked against the unchanged merge/review skill contracts. `git diff --exit-code <base>..HEAD` over merge skill, review skill, init skill, standing design, src and tests was empty. The guide mirrors the detailed skill schedule. AREA overview concern is N1.
- C5 reuses the report's evidence at this exact head: format exit 0, 342 tests passing with 0 failures (77.12 seconds), typecheck exit 0, named link/reference tests 7 passing, changed tests exit 0 with no affected test files. No code change, missing check evidence or specific test concern warrants another suite run. Existing link tests check real links and command-reference tests check literal command contracts. No prose-wording tests added.
- `git diff --check <base>..HEAD` passed. Worktree clean. AREA remains 30 lines with four required sections.

## Live AREA path listing

One repository-root shell command listed the named paths, including file arguments inside commands:

```text
src/akrogon.ts: exists
tests/install.test.ts: exists
tests/phase.test.ts: exists
skills/init-akrogon/SKILL.md: exists
skills/implement-issue/SKILL.md: exists
skills/implement-issue/worker-protocol.md: exists
skills/check-issue/SKILL.md: exists
skills/watch-issues/SKILL.md: exists
scripts/observe.ts: absent
skills/watch-issues/scripts/observe.ts: exists
skills/implement-issue/brief-template.md: exists
src/routing.ts: exists
docs/reference-index.md: exists
```

The observe reference is adjacent to the watch skill and resolves within that skill folder; its live contract explicitly invokes `<skill-folder>/scripts/observe.ts`. No dead-pointer consequence demonstrated. Reference-index pointers to the reviewed skill and guide areas resolve. Documented scheduling behavior changed as requested, with N1's compressed overview concern.

## Merge verification, 2026-10-01

Fetched `origin` and rebased onto `origin/main` at `9ea5dd0ae720970b37e0175d7b109c913d29a242`; branch was already current, with no conflicts. Prior reviewed and final head both `af8d3639047a5ee0ddf0bba9019248744639cc9a`. Refreshed config base remains `9ea5dd0ae720970b37e0175d7b109c913d29a242`.

Required checks run after rebase:
- `bun run format`: exit 0; files unchanged.
- `bun test`: exit 0; full result appended below.
- `bun run typecheck`: exit 0 (`tsc --noEmit`).
- Configured guard plus `bun test --changed="$AKROGON_BASE"`: exit 0; 7 changed files, no affected tests, 0 failures.

`merge_checks` is empty; no advisory commands configured. Worktree stayed clean. N1 remains nonblocking and yields no new reusable mechanism requiring a lesson entry. Completion-owner ISSUE.md and its sole leaf brief gathered before completion.
(pass) sync permits harmless ignored paths while preserving tracked autostash edits [115.92ms]

 342 pass
 0 fail
 3971 expect() calls
Ran 342 tests across 15 files. [79.65s]

Full-suite wall time: 79.65 seconds. Fast-forward push `git push origin HEAD:main` succeeded: `9ea5dd0..af8d363 HEAD -> main`.
