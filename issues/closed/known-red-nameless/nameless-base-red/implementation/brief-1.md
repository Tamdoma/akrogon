# Worker brief 1 — `knownRedReceipt` nameless cover

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/nameless-base-red-u1` (detached at d534acd5). Install deps there first: `bun install --frozen-lockfile --backend=copyfile`.

## 1. Goal

Plan decisions D1 and D2: `knownRedReceipt` in `src/verify.ts` stops refusing a red head entry whose log names no test and still refuses a gone log, so a nameless red is covered by a nameless base run of the same command while every named-mismatch refusal stays.

## 2. Numbered acceptance criteria

1. `verify --known-red` prints `verify known-red <sha>: pass` (exit 0) for a head whose red command's log names no test when the completed base run at the merge-base fails the same command with a nameless log; the `check.review` phase move accepts it.
2. Same result in merge scope (`merge_checks` member nameless on both sides) through `requireGreenReceipt`.
3. Still refused: nameless head vs named base, named head vs nameless base, `(log gone)` on either side, different named failures, green base entry, incomplete runs.

The tests proving 1–3 are committed at d534acd5 (tests/verify.test.ts). They are currently red for 1–2 and green for 3; after this change all pass. You write and edit no test.

## 3. Read-first list

- `src/verify.ts` lines 155–230: `noTestNames` (line 160), `knownRedReceipt` comment and body (lines 188–230).
- `src/flaky.ts` `failedTests`: returns `['(no test name)']` for a log without `(fail)` lines and `['(log gone)']` for an unreadable log.
- `tests/verify.test.ts` `a linked pair fails to satisfy requireGreenReceipt with unnamed or unlinked failing work` — the refusal harness.
- `skills/implement-issue/ponytail.md` in the implement-issue skill folder (read: `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`).

## 4. Change list and needed interfaces

- `src/verify.ts` only.
- Delete `const noTestNames: readonly string[] = ['(no test name)', '(log gone)'];` (lines 159–160) and its comment; it is referenced only at line 206.
- Change the head guard `if (names.some((name) => noTestNames.includes(name))) return false;` to refuse only `'(log gone)'` — `if (names.includes('(log gone)')) return false;`. The `'(no test name)'` head marker now flows into `names.every((name) => baseNames.includes(name))`, which covers a nameless head only when the base entry is also nameless; `(log gone)` on the base covers nothing, unchanged.
- Update the `knownRedReceipt` comment (lines 188–190) to state the rule: a `(log gone)` head entry is never covered; a head whose log names no test is covered by a nameless base entry of the same command, and a named-vs-nameless or nameless-vs-named pair is not covered.
- No other function changes: `failedTests`, `flips`, `newRedUnits`, `verifyRunSchema`, `runOnce`, `requireGreenReceipt` stay byte-identical.

Shared test resource: none. Must land first: nothing (wave 1 of 1). Owned paths: `src/verify.ts`.

## 5. Do-not, reasons and exceptions

- Do not touch any test file, `src/flaky.ts`, or any other source file — the planned tests are A's and the markers' consumers stay byte-identical.
- Do not add output comparison, exit-code comparison, new configuration or a receipt field — foreclosed by the locked design (issues/chart/known-red-nameless/forks/coverage-rule.md Q1).
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A authorizing the change.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in the worktree.
2. Read the read-first files.
3. Apply the change list edits.
4. Run the targeted test command below; all named tests must pass.
5. Commit with message `fix: cover a nameless known-red by a nameless base run`.

Size: 1 file, well under 10 turns.

## 7. Commands

`akrogon run-check --leaf /home/ivan/Work/infra/akrogon/issues/open/known-red-nameless/nameless-base-red --name worker1-verify -- bun test --timeout=30000 tests/verify.test.ts -t "naming no test|linked pair|absent on the base|reruns the failing command|records the linked pair|accepts a later qualifying base|later qualifying"`

Run it in the worktree. Cite the `check <label>: <exit> <path>` line it prints to stderr.

## 8. Done-when, evidence and report

All tests in the command pass; `git status` clean; commit ID returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
