# Old-suite port brief (implement pass 2, operator decision O1)

Authority: plan.md D26, N8 and "Operator decision (2026-11-07, door t15)" O1. A ports the old suite. Each port runs in a fork of the A session in its own worker worktree, and A reviews every diff before it cherry-picks it.

## Goal

Every case in the assigned files passes on the fixture core or is deleted with a stated reason. What each kept case asserts about akrogon stays the same: phase moves, state fields, worktrees, printed output, exit codes, refusals, notices.

## Tools (on the leaf branch from e69f13ff)

- `hcFixture({ mode?, window? })` in `tests/hc-fixture.ts` gives a fixture plus one real core. Both seats run the stand-in harness `fake` in `mode` (default `work`), and the repo prefix is `rp` (seat names `rp-<slug>-a|b`). Pass `f.env` to `cli`. Clean up with `await f.clean()`, which stops the core first.
- `delivered(f, slug)` lists `{ seat, address, text }` for every task each seat terminal of the leaf received, finished terminals included. It replaces `database(f).prompts`.
- `f.core`: `terminals(labels, all)`, `get`, `waitFor`, `tasks`, `hc([...])`, `rpc`, `appCalls()` (the herdr-app tab rename and close calls), `setWindow`, `shimLog`, `link`. Use `hcCore(g, { repo: 'other' })` plus `link` for a second repo, and `setPrefixes` to give it a prefix.
- `tests/stand-in.sh` modes: `work` (idle, each task makes one working-to-idle turn), `idle` (never starts work), `exit`, `trust`. A per-terminal hook runs from `$STANDIN_DIR/hook`.
- Seat labels: `akrogon=1`, `akrogon.repo`, `akrogon.leaf`, `akrogon.seat` (a|b), `herdr.space`, `herdr.tab`. State keeps `seat.{A,B}.{session,address}`, `prompted.{A,B}.{turn,address}`, `delivery_error`, and `tab` (an opaque hc tab id).
- Delivery is D13: busy means wait, the same turn means nothing, a turn past `prompted` with no phase move means re-prompt, and the third re-prompt fails the leaf. Clear `prompted` in state to make a seat eligible again (see `tests/hc-teardown.test.ts`).
- Notice sends still go through fake herdr. `core.env` carries `FAKE_HERDR`, so notice assertions on the fake herdr database stay.
- The existing hc tests are examples: `tests/hc-start.test.ts`, `hc-delivery`, `hc-teardown`, `hc-identity`, `hc-window-calls`, `hc-watcher`, `hc-status`.

## Rules

1. Edit only the assigned test files. Add helpers inside the file only. Never edit product code (`src/`), `tests/helpers.ts`, `tests/hc-fixture.ts`, `tests/fake-*`, `tests/isolation.ts` or another fork's files. If one of those needs a change, report it.
2. Port a case by swapping each fake herdr pane, tab, agent-start or prompt observation for its hc equivalent (seat terminals, labels, `delivered`, `appCalls`, state `seat`/`prompted`/`delivery_error`). Keep every assertion about akrogon itself.
3. Delete a case only when (a) it asserts removed behavior: pane layout or focus, herdr agent naming, session-file delivery settlement, pane boxing or busctl, hook-event gating (`HERDR_PLUGIN_EVENT_JSON`, `HERDR_PANE_ID`, `HERDR_SOCKET_PATH`), or herdr session/workspace routing of engine calls; or (b) an hc test already catches the same bug, and you name that test. Every deletion goes in the return list with its reason.
4. A case that fails because of a product bug, with akrogon behaving against the brief or design, stays out of the commit. Report the bug with its failing output. A writes the reproduction and the fix.
5. `hcFixture` already puts a fake systemctl on akrogon's PATH (`f.systemctl`: `db`, `log`, `env`), in its own folder after `f.home/bin`. Reconcile and `stop` stop real leaf slices, and slice names hash only repo and slug, so a real stop could kill a concurrent case's seat. A case that needs the real systemctl uses unique slugs and `f.core.env.PATH`. Never write a file through a symlink in `f.home/bin`. A test's own stub there is a new regular file, so `rmSync` first if the path may already be a link. One case once wrote through the link and overwrote `tests/fake-systemctl.ts`.
6. Use one commit per file, with message `test: port <file> to the hc fixture core`. Put a body line for each deleted case with its reason. End with the trailer `Test-Change: tests/<file> old herdr pane path removed by the brief ("old herdr calls in engine paths deleted"); ported to the real-core fixture ("the real-core test fixture ... land here"); deleted: <n> cases, reasons in the body`. No Co-Authored-By line. Never amend or rebase A's commits.
7. Proof: `akrogon run-check --name port-<file-stem> -- bun test --timeout=30000 tests/<file>` must end with every case passing. Also run `bunx prettier --check tests/<file>`, and `bunx tsc --noEmit` must show no error in the file. Run the setup first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
8. Stop line: never `pkill`/`killall`/pattern kills, never stash, temp files under `$TMPDIR`. Never touch the operator's hc or herdr-app sessions (default, infra, personal, mdconsultingny). Never `hc server stop` a core the fixture did not start.

## Return

- Each commit SHA, with the `check port-<stem>: 0 <log>` line.
- Per case: `kept` (unchanged), `ported` (which observation replaced which), or `deleted` (reason or replacing test).
- Product bugs found (case, failing output) and shared-helper needs, or `none`.
