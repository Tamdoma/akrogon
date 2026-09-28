# Plan: pull-all-repos

Direct synthesis. `debate: no`, so this plan comes from `brief.md`, `design.md`, and live surfaces. No positions or rebuttals exist.

## Decisions

- D1: `pull --all` never resolves the current repo. After `readGlobal()`, the `all` branch goes straight to the existing `Object.entries(global.repos)` loop in config order. Delete the `currentRepo` lookup and the `if (current !== null)` early return in `src/pull.ts` (`pullCommand`, lines 75-83). Drop `currentRepo` from the `src/config.ts` import if it becomes unused.
- D2: Plain `pull` keeps `requireRepo(global, process.cwd())` then `pullRepo`. It still pulls only the current checkout from its root and from a linked worktree, and still throws outside a registered checkout.
- D3: The all-repos failure boundary is unchanged: per-repo try/catch, `console.error(JSON.stringify({repo, error}))`, then `AggregateError` naming failed repos. An in-repo `--all` with one failing repo still pulls the healthy repos and exits non-zero naming the failed one.
- D4: Tests run the real CLI on real temporary git repos with the existing fake-gh boundary. No mocked repo resolver. At least two registered repos. One test shows `--all` from a registered root, from a linked worktree, and from an unregistered directory each pulls every registered repo. One negative test shows in-repo `--all` with a failing repo still pulls the healthy repo and exits non-zero naming the failed one. Existing plain-pull tests keep passing.
- D5: README keeps the `akrogon pull [--all]` argument contract and updates only the effect text plus the sentence at `:153`. New wording states `--all` pulls every registered repo from any directory, unlike `next --all`, which stays current-repo inside one. No change to the `next --all` sentence itself.

## Read-first

- `docs/reference-index.md`
- `src/AREA.md`
- `tests/AREA.md`
- `src/pull.ts`
- `src/config.ts` (`currentRepo`, `requireRepo`)
- `src/akrogon.ts` (pull dispatch)
- `tests/helpers.ts` (`fixture`, `cli`, `fakeGh`)
- `tests/fake-gh.ts`
- `tests/pull.test.ts`
- `tests/command-reference.test.ts`
- `README.md` (command table, `:153`)
- `learnings/LESSONS.md`

## Needed interfaces

- CLI unchanged: `akrogon pull [--all]`, no positionals (`src/akrogon.ts`).
- `pullRepo(repo: Repo): Promise<void>` unchanged.
- `readGlobal()`, `readRepo(name, path)` unchanged; `requireRepo` stays for the plain path only.
- Test helpers unchanged: `fixture()`, `cli(f, args, cwd, env)`, `fakeGh(f)`, `yaml`, `GhStep`.

## Acceptance criteria

- A1 (brief 1): `tests/pull.test.ts` drives the real CLI on real temp git repos with at least two registered repos and fake gh; `pull --all` from a registered root, from a linked worktree, and from an unregistered directory pulls every registered repo.
- A2 (brief 2): Plain `pull` pulls only the current repo from its root and from a linked worktree, and fails outside a registered repo; existing tests keep passing.
- A3 (brief 3): In-repo `pull --all` with one failing registered repo still pulls the healthy repos and exits non-zero naming the failed one.
- A4 (brief 4): README command-table row and the `:153` sentence say `--all` pulls every registered repo from any directory, unlike `next --all`.
- A5 (brief 5): Implementation report records one real `bun <leaf-worktree>/src/akrogon.ts pull --all` run with cwd `/home/ivan/Work/infra/akrogon/plugin`, one line per registered repo, output saved outside tracked `issues/` paths with its path in the report. Configured `checks` pass.

## Checklist (ordered)

1. `src/pull.ts` (A1, A2, A3): replace the `all ? currentRepo : requireRepo` lookup plus early return with `if (!all) { await pullRepo(await requireRepo(global, process.cwd())); return; }`, then the existing loop. Keep `pullRepo`, failure collection, and `AggregateError` untouched.
2. `tests/pull.test.ts` (A1, A2, A3): add `--all` coverage with two `fixture()` repos registered in one `config.yaml`, both origins set to GitHub, fake-gh scripted with one listing step per repo in config order (leave `args` undefined or match per-repo listing args). Assert from each cwd (root, linked worktree via `git worktree add`, unregistered dir such as `f.home`) that both `issues/seeds` trees update and stdout prints one `<repo>: N open issues pulled` line per repo. Add the negative case: one repo with a non-GitHub origin, run `--all` from inside the healthy repo, assert healthy seeds written, exit non-zero, stderr names the failed repo. Keep all existing plain-pull assertions.
3. `README.md` (A4): update the `akrogon pull [--all]` row effect and the `:153` sentence per D5. Keep `[--all]` so `tests/command-reference.test.ts` passes.
4. Real-run evidence (A5): run `bun <worktree>/src/akrogon.ts pull --all` from `/home/ivan/Work/infra/akrogon/plugin` with the operator's `gh` login, save stdout/stderr to a file outside tracked `issues/` paths (for example `/tmp/pull-all-repos-<date>.log`), record the path in the implementation report.
5. Run checks: `bun test tests/pull.test.ts`, then full `bun test`, `bun run typecheck`, `bun run format`.

## Docs affected

- `README.md` (human): pull row effect plus `:153` sentence updated per D5.
- No agent doc affected: `src/AREA.md`, `tests/AREA.md`, `skills/*`, and `docs/guide/*` unchanged (`docs/guide/create.md` and `docs/guide/cheat.md` mention only plain `pull`, verified 2026-09-28).

## Verification

- `bun test tests/pull.test.ts` passes, including the new root/worktree/unregistered `--all` case and the in-repo failing-repo negative case.
- `bun test`, `bun run typecheck`, and `bun run format` pass.
- `gh auth status` shows a login before the A5 real run; the retained log shows one line per registered repo from the `plugin/` cwd.
- No `.env` keys: brief and design name none, so no `bun --env-file` presence check applies.

## Open limitation

- `--all` still exits non-zero when any registration is invalid or any origin is non-GitHub, even after healthy repos succeed. How the herdr startup hook handles that non-zero exit is outside this leaf.

## Dependencies

- None. No ordering with another leaf is required.

## Notes

- Brief and design agree; no conflict to record.
- Locked exclusions (not touched): `plugin/` files, `currentRepo` in `src/config.ts`, `next --all` and its README sentence, `pullRepo`, `closeSource`, the chart-issues skill.
- Concrete scenario checked: herdr runs the startup `pull --all` with cwd `plugin/` inside the registered akrogon repo, so the deleted early return is the reported 1-repo vs 7-repo defect.
