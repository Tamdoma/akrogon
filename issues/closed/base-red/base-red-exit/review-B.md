# Review B: base-red-exit

Verdict: **fix**.

Base: `88f252f02eb36aacee6dadf6668c303374b692d5`.
Reviewed head: `6c296391e8a25237e08111577eeee8594782fbb2`.

The reviewed head is ahead of base, base is its ancestor, and `git status --porcelain` is empty. The diff contains exactly the five planned documentation files. No source, tests, chart shapes, or merge skill changed. This initial review was independent of the peer's review.

## Blocking finding

F4. The diff-inspection command in both base-run rules does not expand the configured base variable.

- Locations: `skills/implement-issue/SKILL.md:36` and `skills/check-issue/SKILL.md:53`.
- Real source: an implementation, repair, or review seat follows the new instruction to inspect the leaf diff before deciding whether an unrelated red warrants the base comparison. Both skills prescribe `git diff AKROGON_BASE...HEAD` as that inspection.
- Consequence: Git looks for a revision literally named `AKROGON_BASE`; setting the environment variable does not resolve it. On this actual leaf the prescribed command exits 128, so it produces no diff for the trigger decision. This breaks the executable inspection step supporting criteria 1 and 2 and plan D3.
- Repair: use `git diff "$AKROGON_BASE"...HEAD` in both skills and correct the same command in plan notes/evidence. This is a command correction within the owned surfaces, with no locked-decision change or new test required.

Before proof, executed in the reviewed worktree:

```sh
AKROGON_BASE=88f252f02eb36aacee6dadf6668c303374b692d5 git diff AKROGON_BASE...HEAD -- skills/implement-issue/SKILL.md
```

Result: exit 128, `fatal: bad revision 'AKROGON_BASE...HEAD'`.

The corrected expression was verified without editing the worktree:

```sh
AKROGON_BASE=88f252f02eb36aacee6dadf6668c303374b692d5 bash -c 'git --no-pager diff "$AKROGON_BASE"...HEAD --stat'
```

Result: exit 0, the five actual changed files, 14 insertions and 3 deletions. This uses the real configured SHA and actual branch history, not a handcrafted Git fixture.

## Remaining review evidence

- Criteria 1 and 2 otherwise contain the locked trigger, once-only same command/scope, corresponding base working directory, dependency installation, mktemp allocation with or without TMPDIR, detached checkout, logs outside that checkout, capture before forced removal, seat-specific failed reason, durable SHA/paths/names/tails, and green-base repair. The original red-criterion lock and failed-check/rerun paragraphs are unchanged. Both implementation pass references precede repair.
- Criterion 3 is present in plan.synthesis and the guide. It forbids additional brief-unnamed merge/suite requirements and keeps brief-named whole runs.
- Re-executed both exact criterion 4 grep sweeps and inspected every hit by meaning. Rule copies and the guide agree on the behavioral outcomes. Existing rebase, whole-issue/epic, and merge-only mentions are unrelated or consistent. The report records the hit locations and their judgments as summaries rather than raw grep lines. Independent sweep inspection found no omitted hit or material verification gap.
- Criterion 5 evidence is reused from the report at this head: format and typecheck passed, full `bun test` passed with 342 tests and zero failures, and the targeted docs-links/command-reference run passed with 7 tests and zero failures. No code changed and no concern requires repeating these checks. Both named test files have no diff.
- `git diff --check base...HEAD` passed. The final head and clean-worktree check still match the reviewed commit.

Documented behavior changes in `docs/guide/phases.md` match the new planning limit and conditional base-red stop. The existing merge-red route remains check.fix. No unrelated documentation edits are needed.

## AREA path check

One shell command checked every file named by the changed `skills/AREA.md` from the repository root, resolving the watch skill's `scripts/observe.ts` within its stated directory. All exist:

`tests/install.test.ts`, `tests/phase.test.ts`, `skills/init-akrogon/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/implement-issue/worker-protocol.md`, `skills/check-issue/SKILL.md`, `skills/watch-issues/SKILL.md`, `skills/watch-issues/scripts/observe.ts`, `skills/implement-issue/brief-template.md`, `src/routing.ts`, `docs/reference-index.md`.

The AREA file has 31 lines and exactly Commands, Key files, Non-obvious patterns, and See also as its four second-level sections.

No Nits or additional blockers. The plan's known limitation remains: the single base comparison can be slow and is not a hermetic causality proof.

## Repair review: round 1

Verdict: **ready**. F4 is resolved.

Base remains `88f252f02eb36aacee6dadf6668c303374b692d5`. Prior reviewed head: `6c296391e8a25237e08111577eeee8594782fbb2`. Repaired and reviewed head: `2e340cb573a2784ad7d94401c86d928787a24999`.

Reviewed only the repair diff from the prior head. It changes the command to `git diff "$AKROGON_BASE"...HEAD` in both skills, with no other branch changes. Plan D3 and the verification commands are also corrected in the authoritative artifact. No criteria or locked rules changed, and no defect was introduced by this repair.

Executed the shipped expression in the actual leaf:

```sh
AKROGON_BASE=88f252f02eb36aacee6dadf6668c303374b692d5 bash -c 'git diff "$AKROGON_BASE"...HEAD --stat'
```

Exit 0. Output identifies the five planned files, 14 insertions, and 3 deletions. The prior reviewed head is an ancestor of the repaired head. `git diff --check` on the repair passes and `git status --porcelain` is empty.

Reused the repair report's evidence at `2e340cb`: format and typecheck pass, full tests pass with 342 tests and zero failures, and unchanged docs-links/command-reference tests pass with 7 tests and zero failures. No missing evidence or specific concern requires repeating these checks. No Nits or blocking findings remain in B's review.

## Merge verification

Fetched `origin` and rebased onto `origin/main` at `88f252f02eb36aacee6dadf6668c303374b692d5`. Rebase reported the branch already up to date, with no conflicts. Reviewed and integrated head remains `2e340cb573a2784ad7d94401c86d928787a24999`. Refreshed `akrogon config` after rebase: `AKROGON_BASE` remains the target SHA, remote is origin, default branch is main, and merge_checks/advisory are empty.

Ran every configured check on the integrated head:

- `bun run format`: exit 0, every file unchanged, 0.75 seconds.
- `bun test`: exit 0, 342 pass, 0 fail, 3971 assertions across 15 files, 79.43 seconds. Includes passing docs-links and command-reference tests.
- `bun run typecheck`: exit 0, 1.27 seconds.
- Configured `test_changed` with refreshed `AKROGON_BASE`: exit 0, five changed prose files, no affected test files, zero tests run.

`git diff --check origin/main...HEAD` passes and the worktree is clean. The completion owner's only leaf brief was gathered before completion. No unresolved B Nit or additional change is carried into the push.

Push confirmed: `git push origin HEAD:main` succeeded fast-forward from `88f252f` to `2e340cb`. `origin/main` resolves to `2e340cb573a2784ad7d94401c86d928787a24999` and the intended head is its ancestor. Worktree remains clean.
