# Implementation report: worktree-store

Base: `309d742605a0516067840863ffdf3be29b03fc0c` → Head: `cf91499` (5 commits, no empty commits).

## Changed files and reasons

### Wave 1 (U1 — worker u1, commits `9d7142e`, `035b212`)
- `src/config.ts` — `worktree_root` → `text.optional()`; `worktreeStore` returns `expandPath(root, repo.root)` when set else `~/.akrogon/worktrees/<repo>`; `withSetup` composes `guard ancestors` → flock setup → `guard own-modules` → `sh -c <cmd>` (D1, D4).
- `src/guard.ts` (new) — `offendingAncestor` canonical ancestor walk, `checkLocation`, `guard ancestors|own-modules` (D3).
- `src/akrogon.ts` — `guard` verb + Usage (D5).
- `src/sync.ts`, `src/init.ts` — `worktreeStore` substitutions (D7, D8 code; authorized inside U1 to keep typecheck green after the optional schema).
- `README.md` — guard command row.
- `tests/helpers.ts` — `HOME: f.home` in `cli()` (D9); `tests/guard.test.ts` (new); `tests/config.test.ts`, `tests/command-reference.test.ts`, `tests/check-names.test.ts`, `tests/run-check.test.ts` updated.

### Wave 2 (U2 — worker u2, commits `ed665da`, `35f9c10`)
- `tests/init.test.ts`, `tests/sync.test.ts` — optional-`worktree_root` coverage (D8).
- `docs/guide/setup.md`, `cheat.md`, `limits.md`, `README.md` (sync line), `skills/init-akrogon/SKILL.md`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `src/AREA.md`, `tests/AREA.md` — store-named docs (criteria 3-8).

### Wave 2 (U3 — worker u3, commit `cf91499`)
- `src/next.ts` — exported `createSparseWorktree` (`checkLocation` → `worktree add --no-checkout` → `sparse-checkout set --no-cone '/*' '!/issues/'` → `checkout`, with cleanup on partial failure); `ensureWorktree` uses it for both create paths (D2).
- `src/batch.ts` — `buildStack` creates its detached checkout via `createSparseWorktree` under `worktreeStore(repo)/batch-<id>` (D6).
- `tests/worktree-store.test.ts` (new, 6 tests) covering done-criteria 1-7; sweep of `next`/`batch`/`batch-merge`/`culprit`/`hold`/`merge-attempts`/`pause-next` tests for store paths and in-process `HOME` pins (D9).

## Commands run

| Command | Result | Wall time |
|---|---|---|
| `bun test tests/guard.test.ts tests/config.test.ts tests/command-reference.test.ts --timeout=30000` | 34 pass, 0 fail | seconds |
| `bun test tests/init.test.ts tests/sync.test.ts tests/docs-links.test.ts --timeout=30000` | 55 pass, 0 fail | seconds |
| `bun test` per U3-owned file set (next 224, batch 14, batch-merge+merge-attempts 56, phase/status/pull/direct-guards/batch-dispatch 132, pause-next 20, worktree-store 6) | all pass | minutes |
| `bun test --timeout=30000` (full suite, lane) | 729 pass, 0 fail | 74 s |
| `AKROGON_BASE=309d742… bun test --changed="$AKROGON_BASE" --timeout=30000` (lane) | 701 pass, 0 fail | 57 s |
| `bun run typecheck` | clean | seconds |
| `bun run format` | clean; prettier drift in `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts` (untouched files, known lesson 2026-10-08) reverted | seconds |
| Live `bun src/akrogon.ts guard ancestors` in this worktree | exit 1, names `/home/ivan/Work/infra/akrogon` | seconds |
| Live `bun src/akrogon.ts guard own-modules` in this worktree | exit 1 before `bun install`, 0 after, naming the path | seconds |

Deliberate breaks: U1 dropped `guard ancestors` from `withSetup` → refusal test red (setup marker created), reverted green; U3 dropped `sparse-checkout set` → sparse tests red (3), reverted green.

`merge_checks`: none configured — not run. `advisory`: none.

## Known limitations

- Until operator step S2 removes `worktree_root` from `issues/config.yaml` on main, leaf worktrees (including this one) sit under the registered checkout, whose ancestors hold `package.json`/`node_modules`; printed check commands correctly refuse via `guard ancestors` there. This leaf's own review must run the underlying `checks` commands directly (already recorded in plan.md). The installed `akrogon` CLI predates the `guard` verb, so live `guard` evidence was run via `bun src/akrogon.ts`.
- The composed command's `<cmd>` is wrapped as `sh -c <quoted cmd>` (not a raw `&&` tail) so `X || Y` checks cannot half-run after a failed guard — A-resolved during U1, consistent with the design's "then the command" intent.
- `checkLocation` is called inside `createSparseWorktree` (one guard point for `ensureWorktree`, `buildStack`, base-run) instead of at each call site — plan D11, noted for review.

## Unverified criteria

None. All seven done-criteria have passing tests or live evidence; criteria 5's nested-store refusal was additionally proven live in this worktree.
