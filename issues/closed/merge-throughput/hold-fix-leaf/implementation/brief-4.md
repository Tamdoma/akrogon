# Brief 4: bind the non-solo fix-leaf path (remainder of brief-3)

## 1. Goal

Brief-3's `heldMergePair` gives the `fix` leaf `solo: true`, which makes the `members: []` assertion vacuous: `mergeTurn`'s member filter excludes all candidates for a `solo: true` leaf whether or not the new `fixHeld` skip works. Remove `solo: true` from the fix leaf so the tests actually bind the `members: []` skip and the empty-members batch flow (buildStack → applyStack → prompt → push). Start from the retained worktree state; commit `e5d1a694` already exists there.

## 2. Acceptance criteria

1. `heldMergePair` fix leaf has NO `solo` state flag; `hold` keeps the earlier `merge_stamp` and `fix` the later one.
2. Scenario 1 asserts: `hold-fix fix` output and `held.yaml` `fix` field (unchanged); after `cli(f, ['next'])` the `fix` record has `members: []`, `applied: true` and `top` defined; the herdr prompt targets `fix` with `attempt=<id> top=<sha>` (NOT `solo` — a non-solo fix leaf goes through the stack path and gets the normal applied-stack context); `hold` has no record; `fix`'s `merge_stamp` unchanged.
3. Scenarios 2-6 still pass unchanged except where they hardcode the solo assumption (e.g. any `solo` prompt text or `record.solo` assertion — update to the `top` context).
4. Sanity proof: with the fix leaf non-solo, temporarily removing the `fixHeld` member-collection skip in `src/next.ts` (revert that one hunk to `members` populated from the queue) MUST turn scenario 1's `members: []` assertion red. Run this deliberately once, paste the failing output, then restore the hunk. Do not leave the break in the commit.

## 3. Read-first

- `tests/hold.test.ts` — the new `heldMergePair` and five scenarios at the end.
- `src/next.ts:1040-1075` — `fixHeld` flag and batch record construction (`applied: fresh.state.solo === true`, `solo: fresh.state.solo`).
- `src/next.ts:1085-1235` — `batch.solo` dispatch vs the `build`/`apply` loop producing `applied: true, top, solo` on the prompt record.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list

Owns: `tests/hold.test.ts` only. Prerequisite: commit `e5d1a694` present in this worktree. Shared resource: none.

## 5. Do-not

- Do not edit `src/` except for the deliberate-break proof in step 4, which MUST be fully reverted before commit.
- Do not remove or weaken other scenarios.
- Return a mismatch if a scenario relied on `solo` in a way this brief misses.

Reasons and exceptions as stated: this is a coverage repair, not new behavior; the deliberate break is temporary evidence only.

## 6. Ordered steps

1. `git log --oneline -3` to confirm `e5d1a694` head; remove `solo: true` from the `fix` leaf in `heldMergePair`.
2. Update scenario 1 assertions to the `top` context (criterion 2 above); scan scenarios 2-6 for solo assumptions and update.
3. `bun test tests/hold.test.ts` — all green.
4. Deliberate-break proof (criterion 4): revert the `fixHeld` skip only, run `bun test tests/hold.test.ts`, capture the red scenario-1 output, then `git checkout`/`git stash` the src change back to clean. Do NOT commit it.
5. Amend or new commit on top of `e5d1a694` with the same `Test-Change:` trailer form naming what changed.

Size: 1 file, ~12 turns.

## 7. Commands

```sh
export AKROGON_BASE=3fde73f7197f35ea17ba2ff06c0705c535f9f75e
bun test tests/hold.test.ts
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

## 8. Done-when, evidence, report

Green `hold.test.ts` with a non-solo fix leaf, pasted red output from the deliberate break, one commit (amend or new) with Test-Change trailer.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
