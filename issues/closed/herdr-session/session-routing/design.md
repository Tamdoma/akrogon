# Design: session-routing

## Binding decisions, verbatim

### session-address (issues/chart/herdr-session/forks/session-address.md)

Operator 2026-10-24, verbatim: "1a - Also fix the names so they're correct | 2c | 3a - just make sure the worktrees will work |"

Recorded after the final-shape check by B and C ([B](../slots/session-address-final-check-B.md), [C](../slots/session-address-final-check-C.md)):

- Q1 1a. Discover across running sessions: one `herdr session list --json`, then `herdr --session <name> workspace list` per running session; the repo's workspace is the one whose label equals the registered repo key exactly; zero or several matches refuse visibly, naming the label and the sessions searched. akrogon never creates a workspace. Reason: operator expectation in #117, no new config. Foreclosed: declared per-repo session (drift, schema churn), ambient socket (the bug).
- Name fix ("fix the names so they're correct"): audit 2026-10-24 found every registered repo has a same-named workspace in a running session except `Himne` (no workspace in any session, running or stopped). Fix is an operator layout step, not a registry rename, because 4 closed Himne leaves carry `repo: Himne`. Session choice is open in the next round. Check: the chosen session's `workspace list` shows label exactly `Himne`.
- Q2 2c. No session stored in leaf state. Binding rules:
  - Resolution happens before the first pane or tab list in every entry path: allocate (before src/next.ts:373), dispatch busy observation (src/next.ts:719-723), hook ownership, reconcile, phase, land wake paths.
  - Scoped-only uses (liveness and keep-vetoes such as reconcile `tabLive`, phase rename to and from `<slug> failed`): the stored id is looked up in the resolved session only, with no label or cwd condition, so a veto never weakens.
  - Acting uses (allocate tab reuse, recorded-pane close at src/next.ts:383, `ownsPane`, dispatch `pane get`, reconcile tab closes): the tab must belong to the repo's workspace (pane -> tab -> workspace_id join in the resolved session) and have a member pane whose cwd is inside the expected leaf worktree; a recorded pane is acted on only as a member of that accepted tab.
  - Second-seat guard: before creating a new tab, list panes and tabs in every running session; a pane whose cwd is inside the expected worktree path (the path ensureWorktree returns, not `leaf.state.worktree`) and whose tab is outside the repo's workspace (another session, or another workspace in the same session) refuses, naming session and pane. An unreadable running session makes the guard unknown and refuses. Panes with null cwd are not matched, the same as activeCount today (A's detail, stated limit).
  - `tab_closed` owner matching has no live tab to corroborate; it is explicitly deferred to cross-session-reads and is not made safe by this fork.
  Reason: blocks a second paid seat without a stored field. Foreclosed: 2a (second seat possible), 2b (new field, manual repair on every move).
- Q3 3a. Resolve once per repo per invocation; a workspace that vanishes mid-pass surfaces as the herdr error, never a silent retarget.
- Worktree criterion (operator "make sure the worktrees will work"): a seat placed by akrogon in the resolved session opens with cwd in the leaf worktree, and the second-seat guard detects a pane in that worktree from a session other than the repo's. Worktree paths live under worktree_store and do not depend on session.

### stopped-and-ambiguous (issues/chart/herdr-session/forks/stopped-and-ambiguous.md)

Operator 2026-10-24, verbatim: "1a 1b | 2a | 3a | 4a | 5a"

Recorded shape: [slots/sa-proposed-shape.md](../slots/sa-proposed-shape.md), with final checks [B](../slots/stopped-and-ambiguous-final-check-B.md) (no change) and [C](../slots/stopped-and-ambiguous-final-check-C.md). Correction from C D1: herdr() calls command(), which passes no deadline (src/shell.ts:124-126); the 10-second discovery deadline is plumbed from run's existing deadlineMs through herdr() for discovery calls, not assumed present. B's 1c (refuse on a session that stops after the list) is foreclosed by the operator's 1b.

Operator 2026-10-24: "1a 1b | 2a | 3a | 4a | 5a"
- Q1 1a+1b: skip sessions listed stopped, never start one; count matching workspaces (same session included), two or more refuse naming session and workspace_id; an open session returning any error other than server_not_running refuses (uniqueness unknown); a session listed running whose read returns server_not_running is treated as stopped and skipped; refusal names sessions searched and skipped-as-stopped; a failed `session list` is reported once per invocation.
- Q2 2a: per-repo refusal, other repos continue, invocation exits nonzero; one report per repo per invocation; cached refusal honored by later steps of that repo; paneOwners, owner-count throws, host reconcile step and selectLeaves contain a per-repo refusal instead of aborting the pass.
- Q3 3a: every discovery call (session list, per-session workspace list, and the cross-session pane/tab lists for the second-seat guard) runs with a 10-second deadline through the existing run/retryCommand deadline parameter in src/shell.ts; a deadline hit counts as an unreadable session (refuse).
- Q4 4a: no new notification; manual commands print the refusal, automatic passes log it.
- Q5 5a: done 2026-10-24, `herdr --session personal workspace create --label Himne --cwd /home/ivan/Work/personal/Himne --no-focus` created w3; `workspace list` shows label exactly `Himne`.

### call-coverage (issues/chart/herdr-session/forks/call-coverage.md)

Operator 2026-10-24, verbatim: "1a | 2a" (Q3 on chart peer scripts not yet answered)

- Pinned in this chart: src/shell.ts herdr() and every caller. The raw bypasses src/next.ts:192,611,646 and src/reconcile.ts:387,667 move onto one argv builder, which is used for both execution and recorded or retried argv. Agent start and prompt keep their own waits, and the discovery deadline applies only to discovery reads. src/land.ts drops HERDR_SOCKET_PATH forwarding, and the land process resolves per repo. tests/fake-herdr.ts gains --session, per-session stores and session list --json, with today's defaults in one running session. src/install.ts and src/self-update.ts plugin link and integration install are left unchanged.
- watch-issues observe.ts is pinned as its own leaf, blocked by the shell.ts session work, through the shared resolver, with the OBSERVE_HERDR seam threaded to it.
- Recorded behavior change: a stopped repo session shows no notice, and receipts persist.

Operator 2026-10-24, verbatim: "3a - but we need to map it out immediately after this is done."

- The chart peer scripts and their prose (peer-ask, peer-wait, peer-restart, peer-create, door-reset, the questions.md wait chain, the SKILL.md agent list) are split into the sibling chart [peer-session](../../peer-session/CHART.md). The operator named it as the next chart after herdr-session hands off, ahead of pull-gh-path. Its open method question is B (explicit door session) vs C (session found from the pane id).

### leaf-split (issues/chart/herdr-session/forks/leaf-split.md)

Operator 2026-10-24, verbatim: "1a"

Three leaves as proposed. L1 alone delivers the seed's fix (seats open in the repo's session). Foreclosed: one leaf (1b), and two leaves with L1 and L2 merged (1c).

### cross-session-reads (issues/chart/herdr-session/forks/cross-session-reads.md)

Operator 2026-10-24, verbatim: "1a | 2a | 3a | 4a |"

- Reads: every running session is listed and each pane, tab and workspace result is tagged with its session. Capacity counting (activeCount), reconcile keep-vetoes and the second-seat guard use all tagged results. Acting calls (close, rename, send, launch) go only to the tagged session. An unreadable session counts as unknown, so nothing it might hold is closed. The inventory is updated or invalidated after each launch or close within the pass.
- Hooks: ids come from the event JSON. The emitting session is the `herdr session list` entry whose socket_path exactly equals the injected HERDR_SOCKET_PATH. The event's workspace_id must equal the repo workspace's id, so hookEventSchema (src/next.ts:75-98) keeps workspace_id. tab.closed and other close events are handled here, which replaces the session-address deferral. Every action still passes the session-address acting checks.
- Manual runs: scope is set first from cwd or an explicit target. An inherited HERDR_PANE_ID is used only as a hint inside that scope and only when it agrees with it.
- src/log.ts: the slot's pane is read first. With no slot, the diagnostic pane is null, and the env HERDR_PANE_ID is not used.

Exclusions: cross-session-reads bindings for capacity, vetoes, hook origin, HERDR_PANE_ID and log.ts belong to session-reads. The second-seat guard's all-session read is here because session-address binds it to tab creation. The watch observer belongs to watch-session. The chart peer scripts belong to the peer-session chart.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Every done-criterion is proven at the CLI boundary through tests/fake-herdr.ts, which this leaf extends with sessions as part of its own product proof. The fake is the existing test stand-in, not new machinery: it gains `--session` parsing, per-session stores and `session list --json`. A real herdr call is not the cheapest proof here, because the door proved real herdr `--session` behavior at charting (operation-proofs P1-P7), including worktree cwd on tab create. Each new behavior shows one deliberate break turning its test red, for example dropping `--session` from agent start. Tests that compare exact argv (tests/shell.test.ts, tests/next.test.ts, tests/status.test.ts) are updated to the routed argv because the old expectation becomes false. The seat makes no real herdr call and no model launch.

## Leaf architecture

- Owned surfaces: src/shell.ts (discovery, session-tagged reads, argv builder, herdr() with a session parameter and discovery deadline; the argv builder and discovery take the herdr executable as a parameter defaulting to `herdr` and use it for every call they make, delivered here for watch-session to pass OBSERVE_HERDR through the same resolver (A,B,C)), src/next.ts (entry-path resolution, allocate, dispatch, raw start, prompt and busy notice onto the builder, acting checks, second-seat guard), src/reconcile.ts (both tab closes onto the builder, scoped liveness), src/phase.ts, src/verify.ts, src/scope.ts, src/land.ts (drop the forwarding, resolve per repo), src/log.ts limited to passing the repo's resolved session into its pane lookup, while which pane it prefers changes in session-reads (A,B,C), tests/fake-herdr.ts and tests/helpers.ts.
- Literal interfaces: `herdr session list --json` returns `{sessions:[{name,running,socket_path,session_dir,default}]}`, parsed once at the boundary with a schema. `herdr --session <name> <cmd>` beats HERDR_SOCKET_PATH (proved at charting). An API call to a stopped session exits non-zero with server_not_running and never starts it.
- State changes: leaf state gains no session field (session-address 2c). delivery_error.command keeps its shape, and its value is the routed argv.
- Consumers relying on changed preconditions: next.ts tab-matching code (it today assumes one session), reconcile closeMergedTab and closeTab, phase renameTab.
- Open for the plan: how per-repo refusal is carried through `selectLeaves`, paneOwners and the host reconcile step without aborting the pass (stopped-and-ambiguous 2a names the containment, not the mechanism).
- Open for the plan: the fake's default session name. Unmodified fixtures must resolve their `repo` workspace with no per-test change.
