# Sub-brief 4: check.fix repair of finding F4

Commit A created the worker worktree at: `11d0fc85` (confirmed). The reproduction tests are committed there and RED by design — your job is the product fix turning them green. You write and edit no test.

## 1. Goal

Repair review-B finding F4: the `maintenanceFirst` ordering introduced at `18840a88` violates the capacity contract. The correct ordering: the due-and-busy outcome returns before any worktree allocation work, and the ordinary capacity gate stands before setup in every other case. There is no "maintenance before capacity" case — criterion 4 requires setup before an *eligible delivery*, not before capacity exists.

## 2. Numbered acceptance criteria

Red→green proofs, all in `tests/setup-busy.test.ts`:

- `criterion 4: a live run-check holds the due setup with capacity full and no live seat` — its epilogue now requires: with the run gone and the sibling still filling the only slot, no setup runs and a capacity wait row is recorded; after the sibling's slot frees, setup runs and delivery follows. Currently red at line ~267 (`setupCallsFor` is 2 where 1 is required) because `maintenanceFirst` runs setup before the capacity gate.
- `criterion 4: a busy unallocated leaf with a dirty leftover reports nothing while its run-check is live` — while the leaf's run-check is live, the pass exits 0 with no error and no setup even though the store holds a dirty leftover the first-allocation validation would report; after the run ends the validation error surfaces. Currently red at the first assertion (exit 1 with the validation error) because the busy outcome is reached only inside `ensureWorktree`, after first-allocation validation throws.
- Every other case in both setup test files stays green, unchanged.

## 3. Read-first list

In your worktree:

1. `src/next.ts` — `allocate` (the `maintenanceFirst` block to remove), `setupDue`, `ensureWorktree` (its internal busy gate), `busyDetail`/`busySeat`, `capRefusal`.
2. The two failing test cases — your ground truth, read them fully first.
3. `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

Reference for depth (read-only): `/home/ivan/Work/infra/akrogon/issues/open/fresh-worktree-setup/setup-before-seat/review-B.md` (the F4 entry) and `docs/use/run-work.md` line 54 (the capacity contract).

## 4. Change list and needed interfaces

Owns: `src/next.ts` only.

The repair shape (check with the failing tests as you go — they are the contract, this is the sketch):

- In `allocate`, after computing `busy` and `due` (both already available before the capacity check), return the busy outcome directly when `busy !== null && due` — before `ensureWorktree` and before the capacity refusal. Remove the `maintenanceFirst` variable and both of its branches entirely: the capacity refusal returns to its original unconditional position (`!live` and capacity full → null), and there is no post-`ensureWorktree` capacity check.
- `due` in `allocate` is currently computed only `!live`; the short-circuit must also hold for a live busy seat (a working/blocked/null seat of a leaf whose setup is due must return busy before any allocation work, not fall into `ensureWorktree`'s first-allocation validation or `.env` writes). Compute `due` unconditionally. `ensureWorktree`'s own busy gate stays as the authority inside it (the recreation flip edge still exists).
- Net effect: `ensureWorktree` is never entered for a due-and-busy leaf; for every other leaf the ordering is exactly what it was before `18840a88` (capacity refusal first when `!live`, then `ensureWorktree`).

## 5. Do-not, reasons and exceptions

- Do not edit any test file or fixture. The reproductions are locked proofs; a red or wrong one after your correct fix is a mismatch returned to A. Exception: none.
- Do not change `src/run-check.ts`, `src/config.ts`, or any file outside `src/next.ts`. The F2/F3 repairs in the current tree are correct and stay. Exception: none.
- Do not weaken the busy gate, capacity counting or any criterion. Exception: none.
- Do not change scope or interfaces; return a mismatch with evidence instead. Exception: a revised brief from A.
- Never run any `git stash` subcommand: every worktree of the repo shares one stash. To set work aside: commit it as a WIP commit and, before returning, `git reset --soft 11d0fc85` and make the unit's returned commit once.
- Do not stop processes by command-line pattern; use `akrogon stop-run <run-id>`.
- Restated: tests locked, single file owned, no stash, WIP squashes into one commit.

## 6. Ordered steps

1. Install dependencies: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
2. Read the two failing test cases and `allocate` end to end.
3. Make the change, run the targeted tests, iterate to green.
4. Squash into one commit. Commit message: `fix: due-and-busy returns before allocation, capacity gate restored before setup` or similar honest summary.

Advisory size: 1 file, under 30 turns.

## 7. Commands

- `akrogon run-check --name u4-dispatch -- bun test tests/setup-dispatch.test.ts --timeout 180000`
- `akrogon run-check --name u4-busy -- bun test tests/setup-busy.test.ts --timeout 180000`
- `akrogon run-check --name u4-typecheck -- bun run typecheck`

Both files fully green, cited with `check <label>: <exit> <path>` lines. Never `akrogon verify` or the full suite.

## 8. Done-when, evidence and report

All three commands green on your one commit. Read back cited logs with `akrogon log`; paste at most short excerpts.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
