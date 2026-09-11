# Seat guards implementation

## 1. Goal

Implement plan decisions D1–D6 in one bounded unit: reliable sessionless dispatch, blocked merge waiting, authoritative pane seats and a 30-second start timeout.

## 2. Numbered acceptance criteria

1. AC1: idle agents with null or omitted sessions and no prompted value receive the prompt. Existing defined-session deduplication passes.
2. AC2: blocked mergers on normal A and retry B seats prevent fetch and clean probes, preserving phase, attempts and prompts, including a dirty worktree.
3. AC3: recorded live A/B remain authoritative with an extra pane listed first. The extra is never started or prompted, and no split occurs.
4. AC4: either missing seat is replaced by a split from its surviving recorded peer, never by adopting an extra member.
5. AC5: fresh creation, interrupted creation, both recorded seats vanished with an extra member, empty tabs and recreated tabs behave as plan D4 specifies.
6. AC6: start timeout is 30000 ms, prompt wait remains 5000 ms. Existing blocked-agent wait test remains unchanged.
7. AC7: resolved changed tests pass with red/green evidence and a retained CLI integration output artifact. B runs full checks separately.

## 3. Read-first list

Read this leaf's ../plan.md, ../brief.md and ../design.md. Read docs/next.html, docs/merge.html and docs/limits.html, then src/next.ts functions allocate, busy, seatFor, dispatchSlot and dispatchLeaf. Read src/phase.ts recoverMerge/requireClean, src/state.ts State and src/shell.ts Pane/process contracts. Copy the CLI fixture patterns in tests/next.test.ts with tests/helpers.ts and tests/fake-herdr.ts. Read /home/ivan/.codex/skills/implement-issue/ponytail.md and worker-protocol.md. No lesson history reading is needed.

## 4. Change list and needed interfaces

Only src/next.ts and tests/next.test.ts are code edits. Reuse Pane, State, busy, seatFor, herdr, placement arguments and the test calls/database helpers. State.pane has optional A/B IDs. Pane.agent_session is optional or null. No public interface or dependency changes. Follow D4 exactly for bootstrap versus replacement, including when both recorded seats have vanished.

## 5. Do-not, reasons and exceptions

Do not change notification/stall/error-boundary behavior or the slot field write because sibling leaves own them. Do not edit docs, schemas, fixtures or add dependencies because this unit is confined to the plan's two owned files. Preserve the blocked-agent wait test unchanged because its current accounting is binding. Never run real Herdr operations in verification. Return a mismatch with evidence if scope or interfaces cannot satisfy the plan, rather than expanding work. Only a revised brief from B permits such expansion. These boundaries prevent conflicting sibling changes and keep the planned behavior reviewable.

## 6. Ordered steps

1. Add tests in tests/next.test.ts for AC1–AC6 before source edits and capture fail-first output.
2. Apply D1–D5 in src/next.ts with minimal logic and no unrelated edits.
3. Run the resolved changed-tests command to green and retain output at /tmp/seat-guards-changed-verification.log. Inspect the diff and fill this report.

Advisory size: two code files, one implementation unit, about 15 turns. Return evidence of a mismatch if substantially larger work is needed. Do not commit or advance phase, which belong to B.

## 7. Commands

`AKROGON_BASE=9dc1055a0a1ba3682335622d81f41873de966f11 bash -o pipefail -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" 2>&1 | tee /tmp/seat-guards-changed-verification.log'`

Use this command for red and green. B owns format, typecheck and the full suite.

## 8. Done-when, evidence and report

All AC1–AC6 outcomes hold, with the existing real CLI/temp Git/Herdr process boundary tests. Report actual red and green results and artifact paths. R1 sessionless deduplication, R2 starts over 30 seconds and R3 real harness timing remain limitations. B completes AC7 full verification and commit after reviewing the worker diff.

Changed files and reasons: src/next.ts now prompts sessionless idle agents, waits on blocked merge seats, resolves recorded seats independently, splits missing seats according to D4 and uses a 30000 ms start timeout. tests/next.test.ts adds 12 CLI regression cases for AC1–AC6 using existing fixtures and a fixture-local Git wrapper. The existing blocked-agent wait test is unchanged. No other code files changed.
Tests run: section 7 resolved changed-test command ran red before source edits (exit 1, 38 passed, 10 failed, 48 total) and green after implementation (exit 0, 48 passed, 0 failed, 338 assertions). Red output is retained at /tmp/seat-guards-changed-red.log. Green CLI integration output is retained at /tmp/seat-guards-changed-verification.log. Inspected git diff and status for scope. No live Herdr operations, commits or phase transitions were performed.
Known limitations: R1 sessionless deduplication still cannot identify later idle events without a session value. R2 starts exceeding 30 seconds retain existing retry and attempt behavior. R3 fixture verification checks real CLI dispatch and Herdr arguments, not actual live harness cold-start timing.
Unverified criteria: none within AC1–AC7. Real harness timing remains R3 rather than a verified claim.

### B validation

Reviewed both file diffs against D1–D6 and confirmed the blocked-agent wait test and slot field write are unchanged. No documentation or interface change is needed for these local guards. Typecheck initially reported TS2769 on the surviving-seat assertion because State.pane permits undefined. Added the fixture-guaranteed non-null assertion on that one line and reran all checks.

- `bun run format`: exit 0, only the two planned files changed.
- `bun run typecheck`: exit 0 after the test typing repair.
- Section 7 changed-test command after repair: exit 0, 48 pass, 0 fail, 338 assertions. Artifact: `/tmp/seat-guards-changed-verification.log`.
- `bash -o pipefail -c 'bun test tests/next.test.ts 2>&1 | tee /tmp/seat-guards-next-verification.log'`: exit 0, 48 pass, 0 fail, 338 assertions. This is the required end-to-end CLI integration artifact.
- `bash -o pipefail -c 'bun test 2>&1 | tee /tmp/seat-guards-full-verification.log'`: final run exit 0, 104 pass, 0 fail, 1051 assertions.
- `git diff --check`: exit 0. Scope is src/next.ts and tests/next.test.ts only.

The full suite also generated its existing install evidence under `.evidence/install-prune-links/home-listing.json`. No iteration-created helper scripts remain in the checkout. The fixtures remove their temporary repositories and Git wrappers.

Implementation commit: `572a624b9b1a141072f6a1f32454a9282482fd57`, ahead of base `9dc1055a0a1ba3682335622d81f41873de966f11`. Post-commit `git status --short` is empty.
