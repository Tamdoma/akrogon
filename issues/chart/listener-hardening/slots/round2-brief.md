# Round 2 brief (door A, 2026-11-08)

Operator direction, verbatim:
- "slot b should actually be an indented subagent with the same functionality, just to keep everything organized. It should also open on the right side of the tab as a 50% width pane. So everything the same, except slot b actually spawns as an indented agent."
- "consult actively with consultants to find and fix all the bugs, and make the system work flawlessly and less complex if possible so that there are less and less vectors where the systemic errors are possible."
- Earlier: "always look at how to make the system less complex rather than adding more and more complexity for potential future failures."

Write your answer to `issues/chart/listener-hardening/slots/round2-<your letter>.md`, then reply with its path. Cite path:line for every claim about code. Mark low-confidence items.

## Part 1 (B only): review the K3 fix, uncommitted in /home/ivan/Work/infra/akrogon

`git --no-pager diff -- tests/hc-fixture.ts tests/hc-delivery.test.ts` and new file `tests/core-bin/systemd-run`.
What it does: each test core now runs with its own scratch `XDG_RUNTIME_DIR` (`/run/user/<uid>/<session>/core`) that has a `bus` link but no `systemd` link. hc 0.1.18 then finds no user manager, so it creates no `hc-shutdown-*` / `hc-serve-*` unit, and the socket never appears in the real `/run/user/<uid>/herdr-core` (so the operator's listener never sees test cores). akrogon under test keeps its scratch dir with `bus` + `systemd` links and a link to the core socket, as before. Seat scopes inside the core run `systemd-run --user --scope`, which needs the real runtime dir: `tests/core-bin/systemd-run` sets the real dir for systemd-run only and passes the core's dir back to the command with `--setenv`.
Evidence: full suite twice, units 546->546 and 574->574, real sockets 7->7. Remaining failures (3) also fail on base HEAD in this env (isolation, status --json, leftovers).
Verdict line: `Verdict: ready` or `Verdict: changes needed` with concrete defects only.

## Part 2 (all): slot B as an indented child of slot A

Today: leaf seats start parentless in the leaf tab (`src/seat.ts:205-260`, `parent: null`, labels `herdr.space`/`herdr.tab`). Consultants start as children of the caller (`src/seat.ts:295-330`). `run()` maps `parent` to `--parent`/`--no-parent` (`src/hc.ts:286-296`).
hc facts (`hc run --help`, `hc --skill`): children end when the parent's program ends unless `--outlive-parent`; hc types notes about a child into its parent unless `--no-notify`; `hc wait --children` in the parent counts children.
herdr-app facts (`~/.config/herdr-app/AGENTS.md` ~line 150): "Sub-agents are terminals an agent started with hc run: the core records the starter as parent. They belong to their parent's tab without a pane; the agents mod shows them, terminal.peek opens one, terminal.keep gives one a pane." Layout mods live in /home/ivan/Work/infra/herdr-setup (`mods/`, `layouts/flat.json` panel-bar, `layouts/board.json` tabs mod).

Answer:
1. How do we get all of: B indented under A in the sidebar, B shown as a pane on the right half of the leaf tab at 50% width, B behaves exactly as today otherwise. Which repo owns each part (akrogon labels/flags vs herdr-setup mod vs herdr-app command), and does it need a herdr-app capability that does not exist (check `herdr-app commands`)?
2. Every state where A's terminal is not live when B starts (merge and check.repair run B alone; A killed, finished, restarted under a new address, stop/reconcile/teardown). What should B's parent be then, with no fallback branch if possible?
3. Side effects on A: notes typed into A, A's `hc wait --children`, A's exit killing B, teardown order, watcher/listener logic keyed on parent or `akrogon.seat`.
4. The simplest design you would defend, and what it removes.

## Part 3 (all): remaining bugs that stop leaves

Known open vectors (your round-1 maps in this folder): a failed or hung listener pass is never retried (no deadline on `hc()` calls or pass children, `src/listen.ts:27-36`); an operator core restart ends a session's event stream and can kill the listener (`src/listen.ts:90-95`, `src/hc.ts` follow); pass failures are only logged; `resolveSpace` "uniqueness unknown" refusals. Find any others that can leave a leaf stuck with nothing retrying it. For each: the smallest fix that removes the failure class, preferably by deleting a moving part. Rank by how likely it stops a leaf.
