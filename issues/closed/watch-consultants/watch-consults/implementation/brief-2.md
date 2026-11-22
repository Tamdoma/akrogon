# Brief U2: consults.ts — case folder, signature store, closed-match

## 1. Goal

Implement plan decision D1 for leaf `watch-consults`: `skills/watch-issues/scripts/consults.ts`, the mechanical case-signature gate the watcher's Judge uses before opening a consult case. Plan: `/home/ivan/Work/infra/akrogon/issues/open/watch-consultants/watch-consults/plan.md`; design: consult-loop items 3, 8, 11. The planned test `skills/watch-issues/scripts/consults.test.ts` is committed at the worktree HEAD and is the contract.

## 2. Acceptance criteria

1. `bun skills/watch-issues/scripts/consults.ts dir <root>` prints `<stateHome>/watch/<repo>/consults` and exits 0. `stateHome` is `globalHome()` from `src/config.ts`. When that path resolves inside the watched repo root (use `within()` from `src/config.ts` with `repoRoot` realpath'ed), print `consults root inside the watched repo` and exit 1. Repo resolution goes through `resolveRepoKey(root, 'akrogon')` from `scripts/repo.ts`.
2. `new <root> --anchor <slug|unknown> --cause <cause|unknown> --phase <phase|unknown> --command <text|-> --leaf <slug>...` creates `<consults>/<anchor>-<seq>/` where `<seq>` is the next free numeric sequence for that anchor (scan existing `<anchor>-<n>` directories), writes `signature.json` `{anchor, cause, phase, command, base, heads}` and prints the created folder path (single line).
3. `match <root> <same flags>` recomputes the signature exactly as `new` would (same `akrogon config` call for base — see test), then scans `<consults>/*/signature.json`: prints `open <dir>` when an identical signature sits in a case whose `status` file does not read `closed`, `closed <dir>` when an identical signature sits in a case whose `status` file reads `closed`, `clear` when no case holds an identical signature. One output line, exit 0.
4. `new`/`match` signature semantics: `anchor`/`cause`/`phase`/`command` come verbatim from the flags (`'-'` is a valid `command` literal). `base` = `git rev-parse origin/<default_branch>` in the repo root, remote and default branch from `akrogon config` keys `remote`/`default_branch` with `'origin'`/`'main'` defaults when absent (the test shim prints only `repo:`). `heads` = map of each `--leaf` slug to `git rev-parse HEAD` in that leaf's worktree; the worktree path is `worktree:` from `<repoRoot>/issues/open/**/<slug>/state.yaml` — search `issues/open/` recursively and match on the leaf folder name, since leaf folders sit nested; `null` when no `state.yaml` with a `worktree:` exists for that slug. The test's `stageLeaf` produces `worktree: <path>` as the only `worktree:` key — a shallow parse is enough.
5. `akrogon config` is invoked exactly once per `new`/`match` run in the given `root` CWD (`['akrogon', 'config']`), so the caller's `akrogon` shim supplies repo, remote and default branch.
6. Planned tests go green, no existing case changes: `consults.test.ts` four tests (`new and match gate a closed signature while state moves`; `an unknown anchor matches unknown and rejects a named one`; `new and match on a never-touched root open fresh` — see the file; `consults root refuses one inside the watched repo`). Write and edit no test; a wrong or still-red planned test is a mismatch return.

## 3. Read-first list

- `skills/watch-issues/scripts/consults.test.ts` — the contract: exact argv, output lines, env (`AKROGON_HOME`, `WATCH_AKROGON`), git fixtures.
- `skills/watch-issues/scripts/repo.ts` (`run`, `resolveRepoKey`), `scripts/hc.ts` (script header/typecheck style), `src/config.ts` (`globalHome`, `within`, `toolRoot`).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

Owns: `skills/watch-issues/scripts/consults.ts` (new file). Reads only: `skills/watch-issues/scripts/consults.test.ts` (frozen). No prerequisites; worktree created at leaf HEAD `7ca2387c75ed54dddb3df952c8fc1871ae483860`.

Note `resolveRepoKey` reads `process.env.WATCH_AKROGON ?? 'akrogon'` — the test sets `WATCH_AKROGON` to its shim, so use `resolveRepoKey` for the repo name, and for the config parse reuse its pattern: `run(['akrogon', 'config'], root)` then `Bun.YAML.parse`. To keep one `akrogon` call per run (AC5), call `run([akrogonBin, 'config'], root)` yourself once with `akrogonBin = process.env.WATCH_AKROGON ?? 'akrogon'`, parse `repo`/`remote`/`default_branch` from the YAML — do not call `resolveRepoKey` for `new`/`match`; `dir` may use it. Parse errors exit 1 with a `consults <verb>: <message>` line.

## 5. Do-not

- No `git stash` — every worktree shares one stash. To set work aside: WIP commit, then `git reset --soft <creation commit>` and make the returned commit once.
- Edit no test file — `consults.test.ts` is frozen; a red or wrong planned test is a mismatch return with evidence.
- Write nothing under the repo's `issues/` tree; the case root lives under `stateHome` only (design consult-loop item 3).
- No schema library beyond zod already in `package.json`; keep to the project's plain-spawn `run()` pattern, no new dependencies.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in the worker worktree.
2. Implement `consults.ts`: verb dispatch (`dir`/`new`/`match`), usage exit 1, the shared signature computation, sequence allocation, `status`/`signature.json` reads (`status` may be absent → treat as open).
3. Run the section-7 commands; iterate until green.

Advisory size: 1 file (~150 lines), ~10 turns.

## 7. Commands

```
akrogon run-check --name u2-consults -- bun test ./skills/watch-issues/scripts/consults.test.ts
cd skills/watch-issues && bun run typecheck
```

## 8. Done-when, evidence and report

All four `consults.test.ts` tests pass and the skill typecheck passes. Commit on the leaf branch in the worker worktree; return the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
