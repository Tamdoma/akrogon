# Worker brief 2 — next.ts + scope.ts session routing (plan U3)

## 1. Goal

Route every herdr call `src/next.ts` and `src/scope.ts` make through the resolved repo session (plan D3-D6, D8, D12). This includes dispatch, allocation, the second-seat guard, busy observation, agent start/prompt, hook paths, reconcile feeds and the merge-pass family.

## 2. Acceptance criteria

1. `dispatchLeaf` resolves `repoSession(repo)` lazily, just before its first pane read (the busy-observation `panes()` before `state.phase === 'merged'` handling). On `{ok:false}`: `report(invocation, repo.name, leaf.path, new Error(reason), slug)` once per repo (a `scope: 'invocation'` failure is reported once across repos), then `'skipped'` for every leaf of that repo. No herdr call happens before resolution on a leaf that reaches this point.
2. All `panes()`/`tabs()`/`herdr()` calls in next.ts scope to the resolved session name. Raw `['herdr', ...]` spawns (busy notice, agent start, agent prompt) build their argv through `herdrArgv(args, {session})`, execute via `run(argv)`, and the argv recorded into `delivery_error.command` or warnings is the built argv including `--session`.
3. `allocate`: the `--workspace` target is `resolution.workspace.workspace_id` (drop the `workspaces()` label scan). Tab matching keeps only tabs in that workspace (join pane->tab->workspace_id within the resolved session) with a member pane whose cwd is inside `resolve(worktreeStore(repo), slug)`; the same rule gates the recorded-pane close at the top and tab reuse. Liveness lookups find the stored id in the resolved session only.
4. Second-seat guard: when no tab matches, after `ensureWorktree` computes the expected worktree path and before `tab create`, list panes and tabs of every session marked `running` in the cached session list (use the discovery deadline `DISCOVERY_DEADLINE_MS`). A pane with non-null cwd inside the expected worktree whose tab's `workspace_id` is not the repo's workspace refuses, naming the session and pane id; any read error or deadline refuses as unreadable. Panes in the repo workspace pass.
5. `activeCount` reads panes in each repo's resolved session; a refused repo contributes `inventory.unreadable.length` plus every unfinished leaf as active (never `max_active`), so one refused repo does not starve another.
6. `scope.ts`: `inOwnScope(slice, paneId, session)` and `adoptShell(slice, paneId, session)` take the session name and pass it to `herdr` in `shellPid`. Callers in `allocate`/`box` pass `resolution.session.name`.
7. `reconcileRepos`/`reconcileHost` feed per-repo resolved pane lists: add a `panesForRepo(repo)` helper (resolves session, returns `null` on refusal/read failure); `reconcile` keeps its signature — `live` is the resolved session's panes or `null`. `reconcileHost`'s unowned-filesystem veto (`livePaneInside`) uses the union of pane lists across running sessions; any unreadable session makes the veto `null` (keep everything). `closeMergedTab` calls pass the resolved session panes; `closeMergedTab` itself resolves its session internally (its signature gains nothing — see interfaces).
8. `paneOwners` resolves each repo and reads panes in that repo's session only; a refused repo contributes no owners.
9. `mergeNotice` builds its argv through `herdrArgv` with the resolved session (the leaf's repo); a refused or stopped session records `notified: false` behavior as today (the catch path already handles `CommandError`).
10. `phase` moves unaffected by this unit; `logMove` needs nothing from next.ts.

## 3. Read-first list

- `src/next.ts` (whole file), `src/scope.ts` (`shellPid`, `adoptShell`, `inOwnScope`).
- `src/shell.ts` — the new `repoSession`, `herdrArgv`, `panes(session?)`, `DISCOVERY_DEADLINE_MS`, `SessionResolution` (check the landed wave-1 commit first).
- `src/reconcile.ts` `reconcile`, `closeMergedTab`, `reconcileHost`, `reconcileNeedsPanes` signatures only (U4 owns that file; pass `live` correctly).
- `tests/session-routing.test.ts` criteria 1-6; `tests/next.test.ts` `calls()`/`prompts` helpers (they already strip/ignore session argv — the calls log records stripped argv, the raw log is `.calls-raw`).
- `tests/fake-herdr.ts` session seams.
- Skill folder `ponytail.md`.

## 4. Change list and needed interfaces

Owns: `src/next.ts`, `src/scope.ts`.

Consumed interfaces (from wave-1 commit, verify by reading src/shell.ts):

```ts
repoSession(repo: Repo, opts?: {exe?: string}): Promise<SessionResolution>
// {ok:true, session: {name,...}, workspace: {workspace_id, label}} | {ok:false, reason, scope?}
herdrArgv(args: string[], opts?: {session?: string; exe?: string}): string[]
herdr<T>(args, schema, {session?, exe?, deadlineMs?}?): Promise<T>
panes(session?: string, exe?: string): Promise<Pane[]>
tabs(session?: string, exe?: string): Promise<Tab[]>
DISCOVERY_DEADLINE_MS
```

You also need the process-level session list for the guard: export from shell.ts is expected as `repoSession` + a way to list sessions still marked running. If wave 1 did not export a sessions-list reader, add a minimal one to shell.ts (`listSessions(exe?)` returning the cached parsed list) — this is the one permitted shared-file touch; keep it additive.

Changed signatures you own: `inOwnScope(slice, paneId, session: string)`, `adoptShell(slice, paneId, session: string)` — update the `next.ts` call sites; no other file calls them.

`closeMergedTab(repo, leaf, live)` in reconcile.ts resolves internally — your next.ts call sites keep passing `repo` and the resolved session's pane list. If the landed U4 signature differs, match it.

## 5. Do-not, reasons and exceptions

- Do not edit `tests/` or `src/reconcile.ts`, `src/phase.ts`, `src/verify.ts`, `src/log.ts`, `src/land.ts` — other units own them. (`listSessions` in shell.ts is the sole permitted additive exception, only if wave 1 omitted it.)
- Do not resolve eagerly at `dispatchLeaf` top: paused/stopped/merged/merged-fast-path leaves must not cost a session list. Resolution goes just before the first pane list; twin/paused/stopped checks still return before it.
- Do not change hook event handling (`hookEventSchema`, `tab_closed` id matching) — session-reads owns that work.
- Do not add a session field to state.yaml.
- Do not write or edit tests; red planned tests or wrong expectations are mismatches to A.
- Return a mismatch with evidence instead of changing interfaces or scope; the exception is a revised brief from A.

## 6. Ordered steps

1. Read the landed `src/shell.ts` (wave 1), `src/next.ts`, `src/scope.ts`.
2. `dispatchLeaf` lazy resolution + refused-repo containment (also `paneOwners`, and note `selectLeaves` needs nothing).
3. `allocate`: workspace target, acting checks (tab match by workspace + member pane cwd), recorded-pane close routing, second-seat guard, `box`/`inOwnScope`/`adoptShell` session args.
4. `dispatchSlot`: routed `currentPane`, `observeBusy` (needs repo or session param), start/prompt argv via `herdrArgv`, `recordFailure` records built argv.
5. `activeCount` per-repo sessions; `panesOnce`/reconcile feeds; `panesForRepo`; `reconcileHost` union veto; `mergeNotice`/`landedWake`/`closeMergedTab` call sites.
6. Run section 7 commands; commit.

Advisory size: 2 files, under 30 turns.

## 7. Commands

```sh
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'
akrogon run-check --name next-typecheck -- bun run typecheck
akrogon run-check --name session-routing-c1 -- bun test tests/session-routing.test.ts -t 'routes seats'
akrogon run-check --name session-routing-c2 -- bun test tests/session-routing.test.ts -t 'refuses missing'
akrogon run-check --name session-routing-c3a -- bun test tests/session-routing.test.ts -t 'skips a listed-stopped'
akrogon run-check --name session-routing-c4a -- bun test tests/session-routing.test.ts -t 'agent start, prompt'
akrogon run-check --name session-routing-c5 -- bun test tests/session-routing.test.ts -t 'second-seat'
akrogon run-check --name session-routing-c6 -- bun test tests/session-routing.test.ts -t 'tab reuse'
```

(`-t 'skips a listed-stopped'` also covers dead-read and read-error cases; `-t 'refuses missing'` covers duplicates; the `-t 'a refused repo'` and `-t 'a discovery read'` and `-t 'a failed session list'` tests depend on reconcile-wave behavior but try them too — report which of the six-to-nine still fail and why.)

## 8. Done-when, evidence and report

Your named tests pass, typecheck exits 0, commit on detached HEAD. Report the commit id, then:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
