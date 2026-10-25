# Worker brief 1: member-receipts core (verify.ts, flaky.ts)

## 1. Goal

Implement plan decisions D1–D8 of leaf `member-receipts`: `akrogon verify` gains per-command receipt reuse, `merge_checks` members run concurrently in merge scope, a red `checks` entry blocks the member stage with recorded not-run entries, `requireGreenReceipt`/known-red become per-command, and `akrogon flaky` ignores reused entries.

## 2. Numbered acceptance criteria

1. A merge-scope verify with two `merge_checks` runs them concurrently (both start before either ends).
2. A red `merge_checks` member does not stop siblings; each keeps its own exit and log.
3. A red `checks` entry in merge scope means no member starts; each is recorded not-run with a non-zero exit, never green.
4. A thrown member leaves the run incomplete (`end` unset); `run.path` is removed only after every sibling settles.
5. A same-tree rerun runs only commands with no green result; green entries are copied with `reused: <source run id>`.
6. Entries from incomplete runs (no `end`, or `setup !== 0`) never source reuse and never count green.
7. Changed command text in config rekeys that command only; siblings stay reusable.
8. Ledger lines without `reused` still parse everywhere `readVerifyRuns` is consumed.
9. `requireGreenReceipt` passes when each expected command is green in some completed run on the tree; refuses otherwise with no known-red cover.
10. `verify --known-red` exits 0 when each red expected command is covered per D6.
11. It exits 1 when a red command has no covering pair (no base result, unextractable names, incomplete runs).
12. A base entry at `exit === 0` (reused or fresh) never covers, even when its log contains `(fail)` lines.
13. `flips`/`flakyLines` ignore entries carrying `reused`.

## 3. Read-first list

- `src/verify.ts` (whole file — all edits live here except D7's two-line skip in `src/flaky.ts`)
- `src/flaky.ts` — `flips` filters `run.commands`
- `src/run-check.ts` — `checkedRun` signature and `PublishRefusedError`; note `runCheck`'s new merge_checks argv refusal does not apply to `checkedRun`
- `src/admission.ts` — `withAdmission`, `sweepStale` live-token skip, `writeRecord` hashed temp names
- `src/config.ts` — `merge_checks`/`merge_covers`, `setupCommand`
- `tests/verify.test.ts` tail — the committed member-receipts tests (red) you must turn green; `tests/flaky.test.ts` tail likewise
- `tests/helpers.ts` — `seedRun`, `verifyCommands` import
- `~/.pi/agent/skills/implement-issue/ponytail.md` — read before editing

## 4. Change list and needed interfaces

Owns: `src/verify.ts`, `src/flaky.ts`. Tests are already committed on this branch — edit none.

In `src/verify.ts`:

- Schema: add `reused: z.string().optional()` to the commands entry object in `verifyRunSchema`.
- Reuse lookup: one helper returning the source run for a `{name, command}` when a completed run (`end` set, `setup === 0`) on the same `tree` and `scope` holds that entry with `exit === 0`. Read the ledger once per `runOnce` after a successful setup (a fresh read is fine; keep it simple).
- `runOnce` restructure: split the expected list into the sequential `checks` portion and the concurrent `merge_checks` portion (both come from `verifyCommands(repo.config, scope)`; the tail entries are the members). Sequential loop unchanged except each item first checks reuse. Member stage: when the sequential stage has a first red entry (`exit !== 0`), every member gets `{ name, command, exit: blocker.exit, log: blocker.log }` appended without running. Otherwise run all members via `Promise.allSettled(members.map(item => checkedRun(repo, caller, akrogonBase, item.name, ['sh','-c',item.command], target)))`; append fulfilled results in config order to `ran[]`, then rethrow the first rejection so `finally` writes the record with `end` unset and removes the worktree after settlement.
- stdout: reused entry prints `verify <name>: reused <run-id> <log>`; blocked member prints `verify <name>: blocked by <name> (<exit>) <log>`; fresh entries keep `verify <name>: <exit> <log>`.
- `requireGreenReceipt`: pass when at least one completed run exists on the tree for the scope and every expected command appears `exit === 0` in some completed run on that tree/scope, else fall back to `knownRedReceipt`. Preserve the error message text.
- `knownRedReceipt` becomes per-command: for each expected command with no green entry in any completed head-tree run of this scope, require some completed head run holding it red whose `failedTests` are all extractable (no `noTestNames` member) AND some completed base run (`compares` === that head run's id, `sha` === merge-base, same scope) holding the same command `exit !== 0` whose `failedTests` include every head name. Base `exit === 0` never covers regardless of log. Different commands may be covered by different pairs. A command with zero entries on the head tree is uncovered.
- `verify`'s `--known-red` exit code comes from `knownRedReceipt` over the whole ledger after the base `runOnce`, replacing `baseCoversHead(repo, head, baseRun)`; remove `baseCoversHead` if it becomes unused. Keep `redRun` for picking the head run to compare.
- `newRedUnits`: skip entries carrying `reused` on both sides (red candidates inside `matching` results and green resolvers).
- `src/flaky.ts` `flips`: skip `item` when `item.reused !== undefined` — reused entries are always exit 0 so only the green side needs the guard, but write the guard on any entry regardless of exit.

## 5. Do-not

- Do not touch `tests/` — a planned test that is wrong or stays red is a mismatch returned to me, never fixed by you.
- Do not touch `src/config.ts`, `src/admission.ts`, `src/run-check.ts` (the merge_checks argv refusal there is a sibling leaf's feature), docs, or skills.
- Do not add config keys, flags, or fields beyond `reused`.
- No fallbacks: no `try/catch` around `Promise.allSettled` results beyond rethrowing the rejection reason.
- A canceled or setup-failed command is never reused: exit must be 0 and the run completed.
- Keep `sameCommands`, `greenRun`, `redRun` behavior for whole-run fast paths.
- Return a mismatch with evidence instead of widening scope; the exception is a revised brief from A.

## 6. Ordered steps

Advisory size: 2 files, under 25 turns.

1. Read `src/verify.ts` and the new tests in `tests/verify.test.ts` tail + `tests/flaky.test.ts` tail (last ~450 and ~45 lines). Acceptance: you can state each criterion's expected record shape.
2. Edit `src/verify.ts` per section 4. Acceptance: `bun run typecheck` clean.
3. Edit `src/flaky.ts` per section 4.
4. Run the targeted tests (section 7). Acceptance: all member-receipts tests green.
5. Run `bun test tests/verify.test.ts tests/flaky.test.ts` fully plus `bun test tests/receipt-gates.test.ts tests/run-check.test.ts tests/green-merge.test.ts` (adjacent suites). Acceptance: green. A red outside your diff's plausible cause is still reported.

## 7. Commands

Run inside `/home/ivan/.akrogon/worktrees/akrogon/member-receipts-u1` after `bun install --frozen-lockfile`:

- `bun run typecheck`
- `bun test tests/verify.test.ts tests/flaky.test.ts --timeout=30000`
- `bun test tests/receipt-gates.test.ts tests/run-check.test.ts tests/green-merge.test.ts --timeout=30000`

Keep output through `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line. In this worktree `akrogon` resolves the leaf `member-receipts`.

## 8. Done-when, evidence and report

All criteria shown green by the targeted tests on your committed head; commit message describes the change; no test files touched; worktree clean after commit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
