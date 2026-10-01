# Brief: failed-stop-guard

## What
`akrogon phase` refuses a call that carries an explicit `--slot` when the leaf is in `failed`, before any state, log, git or herdr effect. A failed leaf then leaves `failed` only through the slot-less recovery form (operator or watch). Entering `failed` with `--slot` from an active phase is unchanged.

## Why
On 2026-10-01 an operator stop (`check.fix -> failed` at 04:52:31.027Z, framework issues/log.jsonl) was undone 0.9s later by seat A's in-flight `akrogon phase emdash-conversion check.review --slot A`. The command accepted it because `src/phase.ts:199` skips the slot check for a failed leaf and `routing.failed.next` lists every active phase. The leaf went back to review with its criterion still red and `fix_rounds` reset to 0.

## Done-criteria
1. For a leaf in `failed`, any `akrogon phase` call with an explicit `--slot` exits non-zero, proven by `check.review --slot A`, `implement --slot B`, `merge --slot B --verdict ready`, one leaf with `failure.cause: attempts`, and one failed leaf with no `failure` record (C D8, B F3). stderr contains the recorded `failure.reason` when one exists and always the sentence "Leaf is failed. A seat cannot resume it. Operator recovery omits --slot after the blocker is resolved." `state.yaml` and `issues/log.jsonl` bytes are unchanged, and the fake herdr records no call.
2. The observed sequence through the real CLI on a fixture leaf at `check.fix`: `phase <slug> failed --slot A --reason "x"` prints `moved failed`. Then `phase <slug> check.review --slot A` exits non-zero, and the leaf stays `failed` with `fix_rounds` unchanged.
3. Slot-less recovery from `failed` keeps its current behavior. The existing recovery tests in `tests/phase.test.ts` (blocked dirty tree kept, attempts dirty tree refused, issue-file refusal, tab rename back) pass unchanged.
4. A seat entering `failed` with `--slot` from an active phase keeps its current behavior. The existing tests for it pass unchanged.
5. `docs/guide/problems.md` ("The leaf is failed.") and `docs/guide/phases.md` (failed recovery paragraph) each add one sentence: a call carrying `--slot` cannot move a failed leaf, and recovery omits `--slot`.
6. Every configured blocking `checks` command passes, including the resolved changed-tests command. (B,C)
