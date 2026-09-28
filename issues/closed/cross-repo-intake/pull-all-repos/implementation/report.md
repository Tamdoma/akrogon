# Implementation report: pull-all-repos

## Changed files and reasons

- `src/pull.ts`: deleted the cwd narrowing in `pullCommand`. `--all` now skips current-repo resolution and always runs the existing `global.repos` loop; plain `pull` keeps `requireRepo` + `pullRepo`. Dropped `currentRepo` from the `./config` import. `pullRepo`, failure collection, and `AggregateError` untouched. (D1, D2, D3)
- `tests/pull.test.ts`: added `pull --all pulls every registered repo from a repo root, a linked worktree, and an unregistered directory` (two registered repos, three cwds, one stdout line per repo, both seed trees) and `pull --all from a registered repo pulls the healthy repos and exits non-zero naming the failed repo` (non-GitHub origin, healthy seeds still written). All existing tests kept. (D4, A1-A3)
- `README.md`: pull row effect and the `:153` sentence now state `--all` pulls every registered repo from any directory, unlike `next --all`. `[--all]` contract unchanged. (D5, A4)

Worker commit `07ba192707cb54fdecf4f16b2220f1359ea7d8fc` cherry-picked cleanly onto the lane as `fe3e1c1`; worker worktree removed before verification.

## Commands run with pasted results and artifact paths

Worker (worktree `issues/worktrees/pull-all-repos-u1`, since removed; evidence logs were inside it):

- `AKROGON_BASE=a2f3e7a378d025930e12ac05ce8710f57f0752a2 bun test --changed="a2f3e7a378d025930e12ac05ce8710f57f0752a2"` before fix (red): 6 pass, 2 fail. New root/worktree/unregistered test failed with `"repo: 1 open issues pulled\nsecond: 1 open issues pulled"` expected vs `"repo: 1 open issues pulled"` received; negative test failed with exit code 0 instead of non-zero. Fail-first defect confirmed.
- Same command after fix (green): 8 pass, 0 fail, 93 expects across `tests/pull.test.ts`. Exit 0.

B on the lane (`issues/worktrees/pull-all-repos`):

- `AKROGON_BASE=a2f3e7a378d025930e12ac05ce8710f57f0752a2 bun test --changed="a2f3e7a378d025930e12ac05ce8710f57f0752a2"` after cherry-pick: 8 pass, 0 fail, 93 expects. Exit 0.
- `bun test`: 326 pass, 0 fail, 3863 expects across 15 files.
- `bun run typecheck` (`tsc --noEmit`): clean, no output.
- `bun run format` (`prettier --write src tests`): all files unchanged; lane left clean.
- `gh auth status`: logged in to github.com as ivanjuras (keyring), active account.
- A5 real run, cwd `/home/ivan/Work/infra/akrogon/plugin`: `bun /home/ivan/Work/infra/akrogon/issues/worktrees/pull-all-repos/src/akrogon.ts pull --all`, exit 0, output saved to `/tmp/pull-all-repos-2026-09-28.log`:

```text
akrogon: 1 open issues pulled
framework: 52 open issues pulled
pi-extensions: 0 open issues pulled
mdcny-ghl-data-pulls: 0 open issues pulled
boulevard-automation: 0 open issues pulled
clinique-la-roya: 0 open issues pulled
lens: 0 open issues pulled
```

One line per registered repo from inside a registered repo, the exact scenario that previously pulled only akrogon.

## Base and committed head

- Base: `a2f3e7a378d025930e12ac05ce8710f57f0752a2`
- Head: `fe3e1c1` (`pull-all-repos: pull every registered repo from any directory`)
- Branch files: `README.md`, `src/pull.ts`, `tests/pull.test.ts`. No `issues/` paths on the branch; lane clean.

## Known limitations

- `--all` still exits non-zero when any registration is invalid or any origin is non-GitHub, even after healthy repos succeed. Herdr startup-hook handling of that exit is outside this leaf (plan's open limitation, preserved).

## Unverified criteria

- None. A1-A5 all verified: A1-A3 by the new tests (red then green), A4 by README text plus the passing `command-reference`/`docs-links` tests in the full suite, A5 by the real `plugin/` run above with its retained log.
