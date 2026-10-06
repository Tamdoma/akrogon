# Brief: merge-turn-order unit U4 — dispatch holder gate, merge wake, end-of-pass sweep

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-turn-order-u4

## 1. Goal

Implement plan decisions D4, D6 (call site) and D7: `dispatchLeaf` prompts only the merge-turn holder, `src/akrogon.ts` wakes the queue after every committed `phase` move, and every `nextCommand` pass ends by sweeping that repo's `merge` leaves.

Depends on U1 (`src/turn.ts`: `eligibility`/`mergeQueue`; `src/log.ts`: `readLog`) and U2 (`src/phase.ts`: `phaseCommand` returns `{ repo, committed }`, throws `MoveCommittedError`).

## 2. Acceptance criteria

- AC1 In `dispatchLeaf`, after the existing missing-inputs check and before `seats(global, repo)`, a leaf whose `state.phase === 'merge'` and whose slug is not `mergeQueue(global, inventory.leaves, readLog(repo.root))[0]?.leaf.state.slug` returns `'waiting'` — explicit or not. Holder leaves continue unchanged through `allocate`/`dispatchSlot` (B only, per `routing`).
- AC2 `dispatchLeaf`'s explicit-mode eligibility errors are derived from the shared `eligibility()` (hand-built, deps, inputs) so the policy is not duplicated; behavior for `explicit === false` unchanged (still returns `'waiting'`). Keep the existing error message texts.
- AC3 `nextCommand` ends each pass with a `sweep` over the `merge`-phase leaves of every repo the pass touched, inside the existing lock, covering all branches (single leaf, selection sweep, `--all`, `--resume`, `tab_closed`, hook pane). Branches that `return` early today are restructured so the sweep still runs (e.g. `if/else if` chain plus a collected repo set; `tab_closed` and pane-hook `owners.length === 0` early-outs where no leaf was dispatched may skip the sweep). De-duplicate repos (`Map` by name).
- AC4 `export async function mergeWake(global: GlobalConfig, repo: Repo): Promise<void>` in `src/next.ts`: `withLock` over the global lock, `sweep` of discovered `merge` leaves; per-leaf errors go through `report`/`invocation.skipped` and it never throws and never sets `process.exitCode`.
- AC5 In `src/akrogon.ts` `phase` case:

```ts
const { phaseCommand, MoveCommittedError } = await import('./phase');
let committed: { repo: Repo } | undefined;
try {
  const result = await phaseCommand(slug, phase, values.slot, values.verdict, values.reason, values.check);
  if (result.committed) committed = result;
} catch (error) {
  if (error instanceof MoveCommittedError) committed = error;
  else throw error;
} finally {
  if (committed !== undefined) await mergeWake(readGlobal(), committed.repo);
}
```

(`mergeWake` imported with the other `./next` import.) A refused/`recorded`/`--check` call wakes nothing; a committed move followed by a post-commit error still wakes. `Repo` type import from `./config`.
- AC6 `bun run typecheck` and the changed-tests command pass.

## 3. Read-first

- `src/next.ts` whole file (`dispatchLeaf` 585–638, `dispatchSlot` 483–530, `sweep`/`sweepAll` 676–682, `nextCommand` 761–862), `src/akrogon.ts` (phase case 50–54, imports), `src/phase.ts` (`phaseCommand`, `MoveCommittedError`), `src/turn.ts`, `src/log.ts`, `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list

`src/next.ts`:

- Imports: `readLog` from `./log`, `mergeQueue`, `eligibility` from `./turn`, `MoveCommittedError` not needed here (dispatchSlot's commitMove throws it inside dispatchLeaf's catch → reported/skipped; verify that is already the behavior and note it in the report).
- In `dispatchLeaf`: replace the three eligibility blocks (`hand_built` → `waiting`/explicit throw; deps loop → `lookup` + `waiting`/explicit throw; readiness gaps → `waiting`/explicit throw) with calls to `eligibility(global, leaf, inventory.leaves)` preserving the same early-return/throw structure and message texts. Careful: the deps `lookup` currently throws `Missing or unreadable leaf` for a missing dependency inside the try — under the shared predicate a missing dependency is `{ kind: 'deps' }`; the explicit error becomes `Leaf dependencies are not merged: ${slug}`. That matches today's observable behavior for an existing unmerged dep; a *missing* dep slug changes from a reported skip to the same explicit error — acceptable and matches the design ("dependencies merged" means resolvable).
  Then add the holder gate (AC1) right after the inputs check, before `seats()`.
- Add `mergeWake` (AC4) next to `sweep`/`sweepAll`.
- `nextCommand` restructure (AC3): inside the `withLock` callback, collect `const touched = new Map<string, Repo>()`; each branch pushes its repo(s) after dispatching (selection: `selection.repo`; `--all` current-repo branch: `current`; `--all` non-current and `--resume` and sweepAll: all registered repos as each branch already iterates them — reuse `registeredRepos` result per branch as today; `tab_closed`/pane-hook: `owner.repo`). After the branch chain, run `for (const repo of touched.values()) await sweep(global, repo, discover(repo, invocation).leaves.filter((leaf) => leaf.state.phase === 'merge'), invocation)`. Restructure the early `return`s minimally (e.g. wrap branch bodies in `if/else` or use a labeled flow) — keep branch logic identical.

`src/akrogon.ts`: phase case per AC5; import `type Repo` from `./config` and `readGlobal` (already partially imported — check: akrogon.ts imports `effectiveConfig` only; add `readGlobal`, `type Repo`).

## 5. Do-not

- Do not change `dispatchSlot` (prompt retry/grace) or `allocate`; waiting leaves keep tab/panes because dispatch returns early.
- Do not prompt waiting leaves or add new state fields.
- Do not alter `sweep`'s ordering (merged-first sort is used by other paths; we pass only `merge`-phase leaves so it is a no-op there).
- Do not call `mergeWake` inside `phase.ts` (the command entry owns it per design) or under a nested lock inside the phase lock (deadlock — `withLock` is not reentrant); the `finally` in akrogon.ts runs after `phaseCommand`'s lock released.
- Do not set `process.exitCode` from `mergeWake`.
- If restructuring `nextCommand`'s early returns looks risky, the minimum alternative is a `finally`-style tail inside the lock callback — but only over branches that dispatched a leaf; report whichever you chose.

Reasons restated: holder gating inside `dispatchLeaf` (not `sweep`) keeps the eligibility checks and reporting identical for explicit and sweep paths; waking outside the lock matches the locked design.

## 6. Ordered steps

1. `bun install`; `git log --oneline -1` (base = lane head after U2).
2. `src/next.ts`: imports, `dispatchLeaf` eligibility refactor + holder gate, `mergeWake`, `nextCommand` end-of-pass sweep.
3. `src/akrogon.ts`: phase case wake (AC5) + imports.
4. `bun run typecheck`; changed-tests command.
5. Commit as one commit, e.g. `merge turn: holder-only dispatch and post-move wake`.

Advisory size: 2 files, under 25 turns.

## 7. Commands

- `bun run typecheck`
- `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602 bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Done when AC1–AC6 hold and the commit exists. Report the commit id and the `dispatchLeaf` explicit-error note from AC2.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
