# Implementation report: hold-fix-leaf

Base `3fde73f`, head `da044f2`. Delegated: U1 code (sa-1), U2 docs (sa-2), U3 tests (sa-3, sa-4 remainder for non-solo coverage).

## Changed files and reasons

- `src/hold.ts` — `mergeHolder(repoName, global, leaves, log)` (queue head, or the hold's `fix` when it names a queued leaf) and `holdFixCommand(cwd, slug)` (lock-guarded: `No hold on <repo>`, missing leaf via `findLeaf`, `not in the merge queue`; writes `fix`, prints `held <repo> fix <slug>`). D1, D4.
- `src/next.ts` — `mergeTurn` holder and `dispatchLeaf` merge gate use `mergeHolder`; pre-lock guard returns only for non-fix holders; in-lock drops stale holds then requires queue head, builds `members: []` for the fix leaf (`fixHeld`). D2, D3.
- `src/phase.ts` — `merged`/`check.fix` authorization resolves via `mergeHolder`; error texts unchanged. D5.
- `src/akrogon.ts` — `hold-fix` verb, usage string, unpause hold line fix suffix. D4, D6.
- `src/status.ts` — `held:` leaf line and repo heading mark name the fix leaf. D6.
- `README.md`, `docs/guide/merge.md`, `docs/guide/next.md`, `skills/merge-issue/SKILL.md`, `src/AREA.md` — `hold-fix` command and fix-leaf override documented. D7.
- `tests/hold.test.ts` — `holdAt` optional `fix` param, `heldMergePair` helper, 5 new serial scenarios.
- `tests/command-reference.test.ts` — `'hold-fix': '<slug>'` contract.

## Commands run and results

- `bun test --changed=$AKROGON_BASE --timeout=30000` — 43 pass, 0 fail, 3 files (~8s).
- `bun test --timeout=30000` — 636 pass, 0 fail, 32 files (~48s).
- `bun run typecheck` — clean.
- `bun run format` — clean run; its rewrite of `src/status.ts`'s pre-existing `phaseColor` drift reverted (2026-10-08 lesson); our `tests/hold.test.ts` reflow committed in `da044f2`.
- Deliberate break (plan verification): reverting the `fixHeld` member-skip turned scenario 1 red — `fix` became its own batch member (3 fail / 14 pass) — restored after capture; transcript: sa-4.

## Done-criteria proof

1. Solo attempt for F behind the head — scenario 1: `members: []`, `applied: true`, `top` set, prompt `attempt=<id> top=<sha>`, head idle.
2. `phase fix merged` accepted, `phase hold merged` refused (`holder is fix`) — scenario 2; `check.fix --check` authorized.
3. Hold dropped after main moves; `next` builds the queue head's attempt — scenario 2 tail.
4. `hold-fix` refusals (no hold / bogus / non-queue leaf) exit nonzero and change nothing — scenario 3.
5. `merge_stamp` asserted unchanged after naming — scenario 1.
6. `unhold` mid-attempt then `phase fix merged` accepted via batch record — scenario 4.
7. `status` board `(held fix fix)` and leaf `held: <sha> bun test fix fix`; unfixed formats unchanged — scenario 5; README/gude rows in `91baf65`.
8. Blocking checks pass — above.

## Notes for review

- A fix leaf with no batch record that passes authorization takes `transition('merged')` without a push — pre-existing path the override widens (plan N1).
- `mergeHolder` is also reached by `dispatchLeaf`'s `next <slug>` gate and `mergePass`'s pre-turn holder read; behavior unchanged when no `fix` is set.
- Known limitation: none.
- Unverified criteria: none.
