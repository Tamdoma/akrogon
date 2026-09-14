# Brief 2: src changes

## 1. Goal

Apply plan D1–D7 to `src/`. The rewritten tests from brief-1 go green; deleted-machinery greps return nothing.

## 2. Acceptance criteria

1. `grep -rn "seatFor\|peerOf\|recoverMerge\|withRepoLock\|issues/.lock\|repo_max_active\|perRepo" src/` returns nothing.
2. `bun test --changed` passes (the brief-1 red cases now pass).
3. `bun run typecheck` passes.

## 3. Read-first list

`plan.md` D1–D7, `src/next.ts`, `src/phase.ts`, `src/routing.ts`, `src/state.ts`, `src/config.ts`, `src/pull.ts`, `src/sync.ts`, `ponytail.md`.

## 4. Change list

- `src/routing.ts`: `failed.next` = `['plan.positions','plan.rebuttal','plan.synthesis','implement','check.review','merge']`.
- `src/config.ts`: delete `max_active` from `repoSchema`; `effectiveConfig` spreads `repoConfig` directly (delete the destructure and `repo_max_active` line).
- `src/state.ts`: delete `withRepoLock`.
- `src/phase.ts`: `commitMove` fix_rounds → `to === 'check.fix' ? recorded.fix_rounds + 1 : recorded.phase === 'failed' ? 0 : recorded.fix_rounds`; `requireCodeOnly` keeps the `issues` diff, then `git diff --name-only <target>...HEAD` (no pathspec) throws `Empty leaf branch: no changes against <target>` when empty; delete `recoverMerge`; `phaseCommand` body runs directly inside the single global `withLock`; drop `withRepoLock`, `run`, `retryCommand`, `Result` from imports.
- `src/pull.ts`: `pullRepo` body runs directly; drop `withRepoLock` import.
- `src/sync.ts`: body runs directly inside the single global `withLock`; `lockPaths` = `[resolve(globalHome(), '.lock')].filter(inside repo).map(relative)`; wrap the three lock checks (`ls-files`, `ls-tree`, `log`) in `if (lockPaths.length > 0)` — an empty pathspec lists every tracked file.
- `src/next.ts`:
  - `busy` gains `|| pane.agent_status === 'unknown'`.
  - Delete `seatFor`, `peerOf`; `dispatchSlot` uses `recorded.pane[slot]` and `slot` throughout; delete the `pane.agent !== null && !idle(pane)` branch; the post-start recheck becomes `if (!idle(ready)) return;`.
  - `dispatchLeaf`: drop the `withRepoLock` wrapper (body at top level), delete the merge-seat early-return block and the `recoverMerge` call — `state.phase === 'merged'` reads `state` directly; add the debate gate after the `failed` block, before dependencies: `if (state.debate === 'yes' && state.phase === 'plan.synthesis' && !['positions-A.md','positions-B.md'].every((n) => existsSync(resolve(leaf.path, n)))) throw new Error(\`Debate leaf skipped its debate: ${slug}; set phase: plan.positions\`)`.
  - `activeCount` returns `Promise<number>` (the `total` computation, `perRepo` deleted); `allocate` checks `total >= global.max_active` only.
  - `nextCommand`: `const hooked: boolean = event !== undefined;`.
  - Imports: drop `withRepoLock`, `recoverMerge`; keep `existsSync` (already imported).

## 5. Do-not

No behavior beyond plan.md. `idle` unchanged; `withLock` unchanged; `observeBusy`, `PROMPT_GRACE_MS`, `STALL_MS`, `paneOwners`, `requiredSlots`, `transition`'s failed slot waiver unchanged. Do not touch tests or docs. Return a mismatch with evidence if a spec conflicts with the code.

## 6. Ordered steps

1. routing.ts, config.ts, state.ts.
2. phase.ts, pull.ts, sync.ts.
3. next.ts.
4. `bun run typecheck`.
5. `AKROGON_BASE=26a7bc2613af4a2c9d579351bc66e87cd1af1427 bun test --changed="26a7bc2613af4a2c9d579351bc66e87cd1af1427"` — paste output.
6. Grep check from §2.

Advisory size: 7 files, under 40 turns.

## 7. Commands

`bun run typecheck`; `AKROGON_BASE=26a7bc2613af4a2c9d579351bc66e87cd1af1427 bun test --changed="26a7bc2613af4a2c9d579351bc66e87cd1af1427"`.

## 8. Done-when

Typecheck clean, changed tests green, greps empty.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
