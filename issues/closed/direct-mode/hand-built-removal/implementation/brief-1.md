# Brief 1: remove hand_built from code and tests

## 1. Goal

Delete the `hand_built` leaf field from the state schema, eligibility and dispatch, and update every test that used it. Plan decisions D1, D2, D3, D4.

## 2. Numbered acceptance criteria

1. A leaf whose `state.yaml` has `hand_built: true` is reported as unreadable by `akrogon status` with the schema error, like any unknown state key. Proved by one new CLI test in `tests/status.test.ts`.
2. `akrogon next` and the merge queue treat every readable leaf the same way. `grep -rn "hand_built\|hand-built" src tests` returns nothing.
3. Every test that used `hand_built` only to hold a leaf back still passes with the replacement fixture described in step 4.

## 3. Read-first list

- `/home/ivan/.claude/skills/implement-issue/ponytail.md`
- `src/state.ts:60-87` (`stateSchema` is a `z.strictObject`, field at :69)
- `src/turn.ts:1-30` (`Block` union at :6, branch at :9)
- `src/next.ts:600-650` (branch at :611-614; `failed` returns `waiting` at :626; a missing `blocked-by` slug throws at :636 under `--all`)
- `src/status.ts:359` (prints `{"unreadable": <repo>, "path": <state.yaml>, "error": <msg>}` per unreadable leaf)
- Pattern to copy for the new test: `tests/status.test.ts:279-300` ("repo mismatch identifies both keys...").
- Pattern for a held-back leaf: `tests/next.test.ts:4094-4096` (`blocked-by` an existing leaf in phase `failed`).

## 4. Change list and needed interfaces

Owns: `src/state.ts`, `src/turn.ts`, `src/next.ts`, `tests/state.test.ts`, `tests/status.test.ts`, `tests/next.test.ts`, `tests/batch-dispatch.test.ts`. No prerequisite units. No shared test resource (temp fixtures only).

- `src/state.ts:69`: delete `hand_built: z.boolean().optional(),`. Do not add `hand_built` to any legacy or lazy-migration key list.
- `src/turn.ts`: `Block` becomes `{ kind: 'deps' } | { kind: 'inputs'; missing: Gap[] }`. Delete line 9.
- `src/next.ts:611-614`: delete the `if (state.hand_built) {...}` block.
- Tests, see step 4.

## 5. Do-not, reasons and exceptions

- Do not edit skills or docs. Unit 2 owns them in parallel. Exception: none.
- Do not change any assertion beyond those listed. Each listed change cites brief criterion 1 or 2 (field removed). Exception: a revised brief from A.
- Do not touch `issues/`. Leaf records are written only in the registered checkout. Exception: none.
- If a listed change breaks an unrelated assertion, return a mismatch with evidence instead of widening scope. Exception: a revised brief from A.

Reasons restated: docs are another worker's paths; old expectations change only with a cited source; `issues/` on the branch blocks the phase move; scope changes go through A.

## 6. Ordered steps

1. `bun install` in the worktree.
2. Write the new test first (criterion 1) in `tests/status.test.ts`, placed right after the "repo mismatch" test: create leaf `legacy` (phase `implement`) with `{ hand_built: true }` and leaf `visible` (phase `implement`). Run `cli(f, ['status'], f.home)`. Expect non-zero exit, parse the first stdout line as `{unreadable, path, error}` with zod, expect `path` to equal `resolve(legacyPath, 'state.yaml')`, `error` to contain `hand_built`, and stdout to contain `visible`. Confirm it fails before the schema edit (red), then passes after.
3. Edit `src/state.ts`, `src/turn.ts`, `src/next.ts` as in section 4.
4. Tests:
   - `tests/status.test.ts:99`: remove `hand_built: true,` from the `broken` fixture. `:145`: delete `expect(result.stdout).not.toContain('hand_built');`.
   - `tests/status.test.ts:791`: replace `{ hand_built: true }` with `{ 'blocked-by': ['hold'] }` and add `leaf(f, 'hold', 'failed');` so `manual` is still an ineligible merge leaf. Check `hold` does not break the TURN assertions.
   - `tests/state.test.ts:59`: remove `hand_built: true,` from `supported`.
   - `tests/next.test.ts:530`: remove the `manual` leaf and `expect((await next(f, ['manual'])).code).not.toBe(0);`. Rename the test to "next refuses unmerged dependencies, respects capacity, and waits on unknown panes".
   - `tests/next.test.ts:2013, 2035, 2179, 3629, 3680`: replace `leaf(f, 'waiting', 'plan.synthesis', { hand_built: true }, 'epic/second');` with `leaf(f, 'waiting', 'plan.synthesis', { 'blocked-by': ['hold'] }, 'epic/second');` plus `leaf(f, 'hold', 'failed', {}, 'other');`. If a test then asserts something `hold` changes (tab counts, sweeps), return a mismatch with the output.
   - `tests/next.test.ts:4088-4113`: drop the loop and the `hand_built` arm. Keep one test "an ineligible merge leaf never holds the turn (blocked-by)" with the `blocked-by` arm's setup and the same assertions (held = `aa`, waiting = `bb`).
   - `tests/batch-dispatch.test.ts:421`: replace with `leaf(f, 'zz', 'failed', {}, 'other');`.
5. Run the changed-tests command (section 7). Fix only failures within this scope.
6. `grep -rn "hand_built\|hand-built" src tests` must print nothing.
7. Commit (see section 8 for trailers).

Advisory size: 7 files, under 30 turns.

## 7. Commands

```sh
AKROGON_BASE=f57bb356c149ed6b9d87a5e122a79d1b54de15ad bun test --changed="$AKROGON_BASE" --timeout=30000
```

## 8. Done-when, evidence and report

Done when criteria 1-3 hold, the changed-tests command passes, and one commit is made in the worktree. The commit message ends with one trailer per changed old test file in the final trailer block, for example:

```
Test-Change: tests/status.test.ts brief criterion 1 (hand_built removed from schema); drop the field from the broken fixture and its absence assertion, hold the manual merge leaf with blocked-by, add an unreadable-leaf case
Test-Change: tests/state.test.ts brief criterion 1 (hand_built is no longer a supported key); drop it from the supported state
Test-Change: tests/next.test.ts brief criterion 2 (no hand_built branch); drop hand-built refusal and arm, hold siblings with blocked-by on a failed leaf
Test-Change: tests/batch-dispatch.test.ts brief criterion 2 (no hand_built branch); hold zz as a failed leaf
```

No co-author line.

Return the commit ID and fill:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
