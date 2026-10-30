# Sub-brief 4: abandoned-pair gate in src/phase.ts

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/abandoned-capture-stop-u4`

## 1. Goal

Implement plan decisions D4–D5 for leaf abandoned-capture-stop: `akrogon phase` refuses a leaf's
non-failed move while `abandonedCaptures` finds a pair in the leaf folder, and owner completion is
refused before its side effects when a completing owner holds one.

## 2. Numbered acceptance criteria

1. `moveGuards` in `src/phase.ts` gains, as its first check when
   `state.phase !== 'failed'`, a call to `abandonedCaptures(leaf.path)` (import from
   `./run-check`); a non-empty result throws an error naming every pair's `out` and `err` paths and
   the clear step ("read the pair, run the leaf grant's discovery, cleanup and absence read for
   that run, then write a non-blank `cleared-<run>.md` beside it" — one clear-step sentence,
   then one line per pair: `<out> <err> -> <cleared>`). Skip entirely when
   `state.phase === 'failed'` so operator recovery stays open.
2. In `refuseEnclosingCompletion`, after the existing `enclosingCapture` refusal, when
   `completing !== null` probe `abandonedCaptures(resolve(repo.root, 'issues/open', completing.name))`
   and throw the same refusal error (plain `Error`, before `saveState` — do NOT mark the leaf
   `failed` and do NOT reuse the enclosing refusal's failed-marking: an abandoned pair is
   recoverable).
3. In `completeOwner`, when `completed !== null`: probe `abandonedCaptures(owner)` before
   `closeSources` runs, and probe again inside the exclusive `.lock` hold before `.closing` is
   written. Extract the shared "throw naming pairs + clear step" into one small helper in
   `src/phase.ts` so all four sites build the identical message.
4. `bun run typecheck` green; `tests/abandoned-capture.test.ts` all three tests green;
   `tests/phase.test.ts` green; `tests/durable-capture.test.ts` green.

## 3. Read-first list

- `src/phase.ts` — `moveGuards`, `transition` (the `failed` early return precedes `moveGuards`),
  `refuseEnclosingCompletion`, `ownerCompletion`, `completeOwner`, `commitMove`.
- `src/run-check.ts` — `abandonedCaptures(folder)` signature (landed on this branch):
  `(folder: string) => { out: string; err: string; cleared: string }[]`.
- `tests/abandoned-capture.test.ts` — the planned tests (do not edit).
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/phase.ts` only. Interface consumed: `abandonedCaptures` from `./run-check` (already on the
  branch; re-check imports compile).
- Message contract the test asserts: stderr contains each pair's `out` path, `err` path and the
  `cleared-<run>.md` path. Keep the paths absolute and unmodified.

## 5. Do-not, reasons and exceptions

- Do not edit `src/run-check.ts`, tests, skills or docs — landed/owned elsewhere.
- Do not guard the `failed` move or moves out of `failed` — criterion-locked openings.
- Do not mark the leaf `failed` on an abandoned-pair refusal — the operator clears and retries; a
  `failed` mark would route a recoverable state into failure handling.
- Do not probe on every `commitMove` — only `to === 'merged'` reaches `refuseEnclosingCompletion`,
  which already computes the completing owner; `moveGuards` covers seat-driven moves.
- Reason: locked plan D4/D5; exception: a revised brief from A.

## 6. Ordered steps

1. Read `src/phase.ts` sites and `abandonedCaptures`.
2. Add the helper (message builder + throw) and the four probe sites.
3. `bun install --frozen-lockfile --backend=copyfile`, typecheck, section-7 tests.
4. One commit: `phase: refuse non-failed moves over an abandoned capture pair`.

Advisory size: 1 file, under 20 turns.

## 7. Commands

- `bun install --frozen-lockfile --backend=copyfile`
- `bun run typecheck`
- `bun test tests/abandoned-capture.test.ts --timeout=60000`
- `bun test tests/phase.test.ts --timeout=30000`
- `bun test tests/durable-capture.test.ts --timeout=30000`

## 8. Done-when, evidence and report

All four criteria hold: the planned test file is fully green and nothing else regressed.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
