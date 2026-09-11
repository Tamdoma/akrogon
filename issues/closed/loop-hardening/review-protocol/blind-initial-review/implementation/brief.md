# Implementation brief: blind-initial-review

## 1. Goal

Apply plan D2–D4: initial reviewers work blind and record unresolved questions independently, while A retains peer questions during review after repair.

## 2. Numbered acceptance criteria

1. AC1: Simultaneous initial reviewers never contact or wait for each other and do not read the peer's current review.
2. AC2: Unresolved questions appear in the reviewer's own findings and verdict under unchanged Fix/Nit standards.
3. AC3: A can use the existing peer-question procedure during re-check after `check.fix`, even though that re-check is dispatched as `check.review`.
4. AC4: Only owned skill prose changes. Footer, verdict, repair-diff and phase rules remain unchanged. No new tests.
5. AC5: Changed-test command succeeds. B separately runs all configured blocking checks.

## 3. Read-first list

- Authoritative leaf `brief.md`, `design.md`, and `plan.md` beside this implementation directory.
- Worktree `docs/phases.html` initial-review and repair entries.
- Worktree `skills/check-issue/SKILL.md`, existing re-check paragraph and peer-question procedure as the pattern to preserve.
- Worktree `skills/check-issue/ponytail.md` and `package.json`.
- `/home/ivan/.codex/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Only `skills/check-issue/SKILL.md`: move shared peer permission to A's repair re-check, add initial blind-review and unresolved-question instructions. Preserve review filenames, question-file protocol, verdict values and commands. No interfaces change.

## 5. Do-not, reasons and exceptions

No code, tests, other docs, dependencies, runtime isolation, timeout or ordered question turn. The locked scope is prose only, and prose word tests are explicitly forbidden. Do not change verdict/footer rules because existing aggregation and handoff remain the contract. Return any mismatch with evidence to B rather than widening scope. Only B's revised brief can authorize a scope correction. These exclusions keep the change within the locked design, with revised authorization as the only exception.

## 6. Ordered steps

1. Before editing, trace the existing simultaneous-question scenario and report why both reviewers can wait forever. This is semantic fail-first evidence, not a new executable test.
2. Edit the single skill file to satisfy AC1–AC3.
3. Read the complete skill and diff. Verify simultaneous questions, unresolved concern under existing verdict standards, and A's question after repair. Verify AC4.
4. Run the changed-test command and fill section 8. Advisory size: one file and a few turns. Return evidence of any material mismatch.

## 7. Commands

```sh
export AKROGON_BASE=7be71885565323b89f666098748dcb127fdd84bf
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```

## 8. Done-when, evidence and report

Complete when AC1–AC4 are verified semantically and changed tests pass. B records full-suite, format, typecheck and commit evidence here before handoff. No executable user-visible flow changes, so no new end-to-end artifact is required.

Changed files and reasons: Only worktree `skills/check-issue/SKILL.md` changed. Initial A/B reviews now forbid peer contact, peer waits and reading the peer's current review, and record unresolved questions in their own findings and verdict. The original peer-question procedure moved from shared context to A's re-check after repair, explicitly including its `check.review` dispatch. This authoritative report is outside the implementation worktree.

Semantic evidence: Before editing, the shared question procedure let simultaneous A/B reviewers each wait for the other to become idle, preventing either from finishing, and also required an unbounded answer wait. After editing, simultaneous initial questions stay in each reviewer's own findings and verdict without contact or waiting (AC1). An unresolved concern is assessed under unchanged Fix/Nit standards, with uncertainty alone explicitly not a Fix (AC2). A's repair re-check still permits the existing Question/Option, question-file and wait procedure despite dispatch as `check.review` (AC3). Complete-skill and diff inspection confirmed unchanged verdict definitions, footer, repair-diff scope and phase commands, with one owned skill file modified and no tests added (AC4).

Tests run: `AKROGON_BASE=7be71885565323b89f666098748dcb127fdd84bf` with `bun test --changed="$AKROGON_BASE"` exited 0. Bun reported one changed file and no affected test files, 0 pass, 0 fail, 0 tests across 0 files. This command verifies changed-test selection, not prose meaning. B ran `bun test`: exit 0, 176 pass, 0 fail, 1635 assertions across 11 files. `bun run format`: exit 0, all targeted files unchanged. `bun run typecheck`: exit 0. `git diff --check`: exit 0. B inspected the diff and confirmed only the owned skill changed, with verdict/footer rules preserved.

Known limitations: Instructions do not enforce runtime isolation or bound questions during A's repair re-check.
Unverified criteria: None. AC1–AC4 verified semantically and AC5 passed all configured checks.

Commit evidence: `2dfc01b92a27c5a434fb6fe633384e5a18ca16c5` on `blind-initial-review`, ahead of base `7be71885565323b89f666098748dcb127fdd84bf`. Final `git status --porcelain` was empty. The committed diff contains only `skills/check-issue/SKILL.md`, with no issue artifacts.
