## 1. Goal

Repair merge finding in review-A.md after clean rebase. Preserve original plan D1–D5 and AC1–AC6. Repair baseline: `8be77cd4fe63e229567c3a2909ae7d2fe5d8051e`. Current configured base: `eed65fb70e72215d300d40c5187b77ec01d01bdc`.

## 2. Numbered acceptance criteria

1. RC1: `tab_closed` passes the current invocation to sweepAll. Existing test `a closed tab hook from a merged leaf sweeps and starts the next leaf` passes.
2. RC2: Root typecheck no longer reports TS2554 at src/next.ts:511. Full suite and all configured checks pass.
3. RC3: Repair diff changes only stale helper calls in the tab_closed branch of src/next.ts. Preserve all original sender criteria and tests.

## 3. Read-first list

Read authoritative `review-A.md` merge-attempt section and `plan.md` in this leaf. Read `/home/ivan/.codex/skills/implement-issue/ponytail.md` and `worker-protocol.md`. Inspect src/next.ts sweepAll and tab_closed branch, tests/next.test.ts closed-tab scenario. Copy the existing `sweepAll(global, invocation)` call in the --all branch. No broader grounding gap exists.

## 4. Change list and needed interfaces

Only the tab_closed branch in src/next.ts: use registeredRepos(global, invocation).repos and discover(repo, invocation).leaves to locate owners, matching the adjacent hook branch. Pass the Leaf object and invocation to dispatchLeaf, store DispatchOutcome, and sweep only for outcome === completed, passing invocation. Existing regression covers the broken flow, so no new test is needed. B authorizes this correction to the initial one-line scope because the blocking checks show the same handler also calls removed allLeaves and the old dispatchLeaf signature.

## 5. Do-not, reasons and exceptions

Do not modify sender code, tests, docs, formatting nits, dependencies or other hook logic because this repair is limited to the merge finding. Do not commit or transition phase because B owns handoff. Return mismatch evidence instead of widening scope. Only a revised brief from B permits a scope change. These exclusions preserve reviewed behavior, with a revised brief as the sole exception.

## 6. Ordered steps

1. Correct the stale helper calls in the tab_closed branch in src/next.ts for RC1–RC3. Review A already supplies red evidence: TS2554 and the existing closed-tab test exits 1.
2. Run the resolved changed-tests command below, retaining output as the real invocation artifact. The existing tests use real subprocesses and temporary repos with external tools replaced at their boundary.
3. Inspect the diff and fill the report before returning. Advisory size: one branch, one file, under five turns.

## 7. Commands

```bash
export AKROGON_BASE=eed65fb70e72215d300d40c5187b77ec01d01bdc
set -o pipefail
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" 2>&1 | tee /tmp/discord-chunk-report-repair-changed.log
```

Run the configured check above, plus `bun test ./tests/next.test.ts --test-name-pattern "a closed tab hook from a merged leaf sweeps and starts the next leaf"` and retain its output at /tmp/discord-chunk-report-repair-hook.log because configured discovery returned zero tests. B runs full suite, format and typechecks after return.

## 8. Done-when, evidence and report

Return changed-file reason, changed-test result, limitations and unverified criteria. B records before/after commits and final checks. Prior sender evidence remains below and is not weakened.

Changed files and reasons: `src/next.ts` updates only the `tab_closed` branch to current registeredRepos/discover and dispatchLeaf contracts, passes the invocation throughout, and sweeps only on the completed outcome. Inspected repair diff contains only this branch correction.
Tests run: Review A and B supply pre-repair failures. `bun test --changed=eed65fb70e72215d300d40c5187b77ec01d01bdc` exited 0, with 3 changed files and zero affected tests, retained at `/tmp/discord-chunk-report-repair-changed.log`. Explicit closed-tab regression passed 1 test with 6 assertions and 47 filtered tests, retained at `/tmp/discord-chunk-report-repair-hook.log`.
Known limitations: Original plan R1/R2 remain.
Unverified criteria: None. RC1–RC3 verified.

## Prior implementation evidence

Changed files and reasons: `skills/broadcast-issue/scripts/discord-send.ts` separates chunk failures from target progress and enriches exhausted target errors while preserving retry and continuation behavior. `skills/broadcast-issue/scripts/discord-send.test.ts` parses aggregate members into typed structured failures and verifies first/middle/last exhaustion, recovered retry counting, independent targets, single-chunk HTTP/body/network failure context, redaction and request ordering.
Tests run: Before production changes, focused sender invocation reported 7 pass / 7 fail, each failure showing missing progress fields, saved at `/tmp/discord-chunk-report-sender-red.log`. After implementation, focused invocation reported 14 pass / 0 fail / 78 assertions, saved at `/tmp/discord-chunk-report-sender-verification.log`. `bun test --changed=131b02de1c3352f35371ca391c59beca5f8dcd95` passed with zero affected tests because root discovery excludes the skill. `git diff --check` passed and the two-file diff was inspected. AC1–AC5 pass.
Known limitations: Ambiguous network receipt and no live Discord verification.
Unverified criteria: None. AC1–AC6 verified.

Final B verification: `bun run format` passed with all files unchanged. `bun run typecheck` and `bun run --cwd skills/broadcast-issue typecheck` passed. `bun test` passed 137 tests with 1305 assertions, saved at `/tmp/discord-chunk-report-full-test.log`. The explicit sender invocation passed 14 tests with 78 assertions. The configured changed-test command passed with zero discovered tests, so the explicit sender invocation supplies the changed-code evidence. `git diff --check` passed. No documentation changes were needed because the locked plan excludes skill prose and existing broadcast documentation remains accurate. Only the two authorized sender files changed.

Implementation commit: `549f70f` (`Report chunk progress for failed Discord targets`). Post-commit worktree is clean. Branch changes contain only the two authorized sender files and no issue artifacts.

Repair scope correction: B observed TS2304 (allLeaves absent), TS7006 (untyped leaves), TS2322 (DispatchOutcome assigned to boolean), and TS2554 (dispatchLeaf expects five arguments). The closed-tab regression still exits 1 after only adding invocation to sweepAll. Correct the existing handler to the current adjacent helper contracts. No other hook changes authorized.

Final repair verification: `bun run format` passed unchanged. `bun run typecheck` passed. Full `bun test` passed 137 tests with 1306 assertions, including the closed-tab regression, retained at `/tmp/discord-chunk-report-repair-full.log`. Prior failing run (136 pass / 1 fail) is retained at `/tmp/discord-chunk-report-repair-red.log`. Configured changed check passed but found zero tests, so explicit regression and full-suite evidence supply runtime coverage. `git diff --check` passed. Sender files are byte-identical to the reviewed implementation and retain the merge slot’s passing 14-test / skill-local typecheck evidence. Documentation and indexes need no edits because this repair restores the existing hook contract.

Repair commits: before `8be77cd4fe63e229567c3a2909ae7d2fe5d8051e`, after `a6b53fd` (Update closed-tab hook to current dispatch contracts). Post-commit worktree is clean. Repair diff changes only src/next.ts tab_closed handler.
