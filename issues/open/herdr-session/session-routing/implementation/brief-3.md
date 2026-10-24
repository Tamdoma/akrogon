# Worker brief 3 — reconcile.ts session routing (plan U4)

## 1. Goal

Close the worker-seat surface in `src/reconcile.ts`: merged-leaf tab closes and the reaper's seat checks must call herdr in the resolved repo session only (plan D7, D12).

## 2. Acceptance criteria

1. `closeMergedTab(repo, leaf, live)` resolves `repoSession(repo)` internally: on `{ok:false}` (or a session that turns out stopped at call time) it does nothing and returns; otherwise its `pane list` call happens in the resolved session and only panes of the resolved workspace can satisfy its checks.
2. `reconcile` keeps its signature `(repo, live, force)` where `live` is the resolved session's pane list (or `null` when unavailable); no direct `panes()` call inside it.
3. `reapTab`'s seat-check `tabs()` call and `close` calls scope to the leaf's repo session. To do that it resolves the session for the leaf's repo via `repoSession(leaf.repo)` once per reconcile pass (accept a resolver or a `Map<repo-name, session-name>` parameter from the caller instead of resolving per leaf — pick the smaller diff; the observable contract is routed argv, not the shape).
4. `reconcileNeedsPanes` unchanged.
5. Tab closes in sessions other than the resolved one, and tabs in other workspaces of the resolved session, are never touched.

## 3. Read-first list

- `src/reconcile.ts` (whole file).
- `src/shell.ts` landed wave-1 interfaces: `repoSession`, `tabs(session?)`, `herdr(..., {session})`.
- `src/next.ts` call sites of `closeMergedTab`, `reapTab`, `reconcile`, `reconcileHost`, `reconcileNeedsPanes` (U2 owns next.ts concurrently — do not edit it; call it out as a mismatch if the landed signatures you need differ).
- `tests/session-routing.test.ts` criterion 2's seat-close tests (`closes a merged tab only ...`, `never touches tabs in other workspaces`) and the `blocks a wait-recorded tab close ...` pairing test.
- `tests/reconcile.test.ts` for existing `reapTab`/`closeMergedTab` expectations.
- Skill folder `ponytail.md`.

## 4. Change list and needed interfaces

Owns: `src/reconcile.ts`.

Consumed from shell.ts (verify in the landed commit):

```ts
repoSession(repo: Repo, opts?: {exe?: string}): Promise<SessionResolution>
tabs(session?: string, exe?: string): Promise<Tab[]>
herdr<T>(args, schema, {session?, exe?, deadlineMs?}?)
```

`Repo` comes from `src/config.ts`; reconcile.ts already imports it.

The calls feeding `closeMergedTab` and `reconcile` live in `next.ts` (worker 2) — keep signatures exactly as specified so it compiles: `closeMergedTab(repo, leaf, live)`, `reconcile(repo, live, force)`, `reconcileHost(repos, live, needsPanes)`, `reconcileNeedsPanes(leaves)`.

## 5. Do-not, reasons and exceptions

- Do not edit `src/next.ts` or tests; U2 owns next.ts and test changes belong to A.
- Do not resolve a session per leaf inside a loop over one repo — once per repo per pass.
- Do not touch unowned-git or unowned-filesystem logic beyond keeping `reconcileHost`'s signature.
- A signature conflict with the landed next.ts is a mismatch to A, not an edit; the exception is a revised brief from A.

## 6. Ordered steps

1. Read `src/reconcile.ts`, landed `src/shell.ts`, and the relevant criterion tests.
2. Update `closeMergedTab` to resolve its session and route `pane list`.
3. Update `reapTab`'s `tabs()`/`pane close` calls to the leaf repo's session (resolver/map approach, your call).
4. Run section 7 commands; commit.

Advisory size: 1 file, under 12 turns.

## 7. Commands

```sh
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'
akrogon run-check --name reconcile-typecheck -- bun run typecheck
akrogon run-check --name session-routing-c2b -- bun test tests/session-routing.test.ts -t 'closes a merged tab only in the resolved session'
akrogon run-check --name session-routing-c2c -- bun test tests/session-routing.test.ts -t 'never touches tabs in other workspaces'
akrogon run-check --name session-routing-c2d -- bun test tests/session-routing.test.ts -t 'blocks a wait-recorded tab close'
akrogon run-check --name session-routing-c3d -- bun test tests/session-routing.test.ts -t 'a discovery read deadline'
```

(The seat-close tests need U2's next.ts feed to go fully green; if they fail only because the lane's next.ts is unrouted in your worktree, report that — do not fix next.ts.)

## 8. Done-when, evidence and report

Acceptance criteria met where your file controls them, typecheck exits 0 (allow unrelated next.ts errors only if U2 hasn't landed in your worktree — wave-3 worktrees start from a head with wave 1+2 landed, so typecheck should be clean), commit on detached HEAD. Report the commit id, then:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
