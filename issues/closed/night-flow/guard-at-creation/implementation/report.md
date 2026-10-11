# Report: guard-at-creation

Base: `c53f6196533289555518577f08907ec9c713721c` (c53f619)
Head: `500d215` on `guard-at-creation` (commits: `1f82d8d` planned tests, `ab1610a` U1, `500d215` U2)

## Changed files and reasons

- `src/config.ts` — `withSetup` `inner`: dropped `akrogon guard ancestors && ` from both forms (brief criterion 1, plan D1). Worker commit `67f4059` → landed `ab1610a`.
- `src/AREA.md` — `guard` bullet: composed check commands run `own-modules`; `ancestors` runs at worktree creation through `checkLocation` (plan D3, doc made stale by the diff).
- `skills/implement-issue/SKILL.md:25`, `skills/check-issue/SKILL.md:18`, `skills/merge-issue/SKILL.md:18` — temp-file sentence: base copy only through `akrogon base-run` (criterion 4, plan D4). Worker commit `2cd3820` → landed `500d215`.
- `tests/config.test.ts`, `tests/guard.test.ts`, `tests/batch.test.ts` — planned tests committed at synthesis `1f82d8d` with `Test-Change` trailers.

Not changed, by design: `src/base-run.ts` keeps its `guard ancestors` prefix (D2); `src/guard.ts`, `src/next.ts`, `src/batch.ts` untouched — creation-time `checkLocation` is the kept guard.

## Criterion proofs

| # | Proof | Command | Result |
|---|-------|---------|--------|
| 1 | `config composes setup…identically from worktree`, `config reports merge_checks separately…`, `config runs all of setup inside the install lock`, `config printed check installs into a fresh worktree` | `bun test tests/config.test.ts --timeout=30000` | 24 pass 0 fail |
| 2 | `printed check runs to completion under a dirty ancestor with and without setup`; `printed check refuses naming missing own node_modules` | `bun test tests/guard.test.ts --timeout=30000` | 7 pass 0 fail |
| 3 | `dispatch refuses a store path under an ancestor holding node_modules`; `buildStack refuses a store path under an ancestor holding node_modules` (new); `checkLocation…refuses it under a dirty one` | `bun test tests/worktree-store.test.ts tests/batch.test.ts tests/guard.test.ts` | all pass (51 total across files 1–3) |
| 4 | three sentences verbatim per plan D4; sweep by meaning | `grep -n 'Temp files'` + `grep -rn 'base cop\|base checkout\|mktemp\|\$TMPDIR' skills/` | sentences identical; out-of-scope hits below |

Deliberate break: re-added `akrogon guard ancestors && ` to the no-setup `inner` form → `config composes setup…`, `config reports merge_checks…` and `printed check runs to completion under a dirty ancestor…` all red (3 fail / 27 pass); reverted.

## Commands run

- `bun test tests/config.test.ts tests/guard.test.ts tests/worktree-store.test.ts tests/batch.test.ts` — 51 pass, 0 fail, ~2s.
- `bun run format` — clean, no rewrites (~35s wall).
- `bun run typecheck` (`tsc --noEmit`) — clean (~10s).
- `bun test --timeout=30000` full suite — **793 pass, 0 fail**, wall 2m13s.
- Changed-test command via `akrogon run-check` with this leaf's composed `test_changed` (no `guard ancestors`): **628 pass, 0 fail**, wall 63s.
- Sweep greps — results below.

## Skills sweep (criterion 4)

`grep -rn 'base cop\|base checkout\|mktemp\|\$TMPDIR' skills/` plus meaning-level reads of `checkout`/`worktree`/`base run` paragraphs. Out-of-scope hits, unedited:

- `skills/init-akrogon/SKILL.md:72` — `mktemp` for a proposal file, not a base copy.
- `skills/watch-issues/scripts/log-tail.test.ts:2,4,6`, `observe-log-tail.test.ts:4` — comments recording mktemp cwd provenance of fixtures.
- `skills/chart-issues/assets/questions.md:48` — `/tmp/<session>/` for chart peer briefs, not a base checkout.
- `skills/implement-issue/worker-protocol.md:11` — `git worktree add --detach` for worker worktrees, not base checkouts.
- `skills/check-issue/SKILL.md:65`, `implement-issue:38`, `merge-issue:73`, `implement-issue:78` — base-run rule sentences already using `akrogon base-run`; unchanged.

No skill instructs a hand-made or in-repo base checkout.

## Worker notes

- U1 worker worktree was not the registered `state.worktree`, so `akrogon run-check` needed `--leaf`; run was otherwise verbatim, 628 pass / 0 fail.
- U2 docs-only; sweep folded above. Both worker worktrees removed.

## Known limitations / unverified criteria

- None. No env vars required; no operator actions outstanding.
