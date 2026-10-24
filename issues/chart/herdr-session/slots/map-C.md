# Territory map, seat C: akrogon must not trust inherited HERDR_SOCKET_PATH (#117)

Date of all live probes below: 2026-10-24. Installed herdr: 0.9.1 (`herdr --version`).

## Seed verification

All four locations in the seed match current source:

- `src/shell.ts:202-212` `herdr()` builds `['herdr', ...args]` and spawns with inherited env (no `env` override except git/gh credential env at `src/shell.ts:86-107`). Verified by reading the file.
- `src/shell.ts:214-224` `panes()` / `tabs()` / `workspaces()` list only the ambient session.
- `src/next.ts:407-408` picks `(await workspaces()).find(label === repo.name)` in that one session, else throws `No herdr workspace labeled <repo>`.
- `src/land.ts:33-35` forwards `process.env.HERDR_SOCKET_PATH` into the systemd land unit.

Two seed "not inspected" items resolved: `src/turn.ts` contains no herdr call at all (grep, 2026-10-24). The watch observer `skills/watch-issues/scripts/observe.ts:88,220` spawns ambient `herdr agent list` with no session selection.

Live facts that shape every fork below (practitioner tier, my probes, 2026-10-24):

- `herdr session list --json` exists on 0.9.1 and returns `name`, `running`, `socket_path`, `default` per session. Running now: infra, mdconsultingny, personal. Stopped: default, netreachconsulting.
- Registered akrogon repos (`~/.akrogon/config.yaml` `repos:`) span three running sessions: akrogon, framework, pi-extensions, lens, blepsis, varhop workspaces are in infra; mdcny-ghl-data-pulls, boulevard-automation, clinique-la-roya in mdconsultingny; lingua-relay in personal. One registered repo, Himne, has no workspace in any running session.
- `HERDR_SOCKET_PATH=<mdconsultingny sock> herdr --session infra workspace list` returned infra's workspaces. `--session` beats a wrong socket env on the installed 0.9.1.
- Workspace ID `w8` exists in both infra (akrogon) and mdconsultingny (archival-aesthetics area). Pane and tab IDs are per-server, not global.
- `herdr --session <each> plugin list` shows the identical plugin set and config dir (`~/.config/herdr/plugins/...`) in all three running sessions. Plugin registration looks global, not per-session.

Outside source (better-than-training, fetched 2026-10-24, note version skew in Fog): herdr Socket API docs, https://raw.githubusercontent.com/herdrdev/herdr/v0.9.5/docs/next/website/src/content/docs/socket-api.mdx, lines 645-650 give resolution order: 1. explicit CLI `--session <name>`, 2. `HERDR_SOCKET_PATH`, 3. `HERDR_SESSION=<name>`, 4. default session socket, and say "Use `HERDR_SOCKET_PATH` only for low-level overrides." Same file lines 254-257: herdr injects `HERDR_SOCKET_PATH`, `HERDR_PANE_ID` etc. into managed pane processes and its values win over caller env. Lines 563-566: plugin commands get the same injected vars from the firing server. CLI reference line 70: "Workspace, tab, pane IDs, and agent names belong to a single server."

## F1. What decides which herdr session holds a repo?

Question: when akrogon acts for a repo, how does it learn the session, given the ambient env may lie?

Options:

- F1-O1 Discover: run `herdr session list --json`, list workspaces in each running session, the unique session whose workspace label equals the registered repo name wins. Refuse when zero or several match.
- F1-O2 Declare: new per-repo config key (for example `herdr_session`) in the repo schema. akrogon targets that session and validates the labeled workspace exists there.
- F1-O3 One configured global session for all repos.
- F1-O4 Keep ambient env, only add a mismatch check and refuse.

Pick: F1-O1. The label-equals-repo-name convention already exists at `src/next.ts:407`, the operator statement in the seed is exactly "find the repo's workspace regardless of session, refuse visibly when missing or ambiguous" (operator tier, seed Expected behavior), and discovery needs no config change in any registered repo. Cost: one `session list` plus one `workspace list` per running session per resolution, so resolution must be cached per pass; an operator workspace rename silently becomes "repo not found" until relabeled.

Rejected:

- F1-O2: removes ambiguity by construction, but adds a key to a strict schema (`src/config.ts:39-109` `repoSchema` is `z.strictObject`), so init, config printing, docs, and every existing repo config are in the blast radius, and akrogon must still validate the workspace exists in the declared session. It also creates a second fact that can disagree with where the operator actually put the workspace. Worth revisiting only if duplicate labels become a real working style.
- F1-O3: false today. Registered repos live in three running sessions (probe above).
- F1-O4: does not meet the operator statement. The manual export workaround in the seed stays required.

Evidence: operator (seed statement), practitioner (session and workspace probes, 2026-10-24), better-than-training (`src/next.ts:407-408`, `src/config.ts:39-109`).

Pitfalls:

- F1-P1 Label is a display string, not an ID. Himne is registered with a capital H and has no workspace today (probe). A case-differing label (`himne`) would not match `item.label === repo.name`. What removes it: the refusal message names the label searched and sessions searched, so the operator sees the mismatch instead of a silent wrong placement.
- F1-P2 Repo names come from registration keys (`src/config.ts:252`, `repos:` record), not from the checkout. Two registered keys could point at one checkout with one workspace label. What removes it: nothing in this work; discovery keys off the same name allocate already uses, so no new failure class is added.

## F2. By what mechanism does one herdr call get pinned to the chosen session?

Options:

- F2-O1 Prefix every invocation with `herdr --session <name> ...` inside `src/shell.ts:202` `herdr()` and at every direct `run(['herdr', ...])` / `command(['herdr', ...])` site.
- F2-O2 Rewrite `HERDR_SOCKET_PATH` in the spawn env to the chosen session's `socket_path` from `session list --json`.
- F2-O3 Set `HERDR_SESSION=<name>` in the spawn env.
- F2-O4 Talk to the session socket directly (raw socket API) and drop the CLI.

Pick: F2-O1. It is documented precedence level 1, above the stale socket (Socket API docs lines 645-648), and I proved it overrides a wrong `HERDR_SOCKET_PATH` on the installed 0.9.1. The session name is also the stable identity the operator sees in `herdr session list`. Cost: argv shape changes everywhere, including commands recorded in leaf state (`delivery_error.command`, `src/state.ts:22-30`) and the test fake's argv parsing (F9).

Rejected:

- F2-O2: works, but the docs reserve the socket path for low-level overrides, error records then hide which session was meant, and deriving a name later means parsing `~/.config/herdr/sessions/<name>/herdr.sock`, which differs for the default session (`~/.config/herdr/herdr.sock`, live `--json` output).
- F2-O3: precedence level 3, below `HERDR_SOCKET_PATH` (docs line 647). With a stale socket env present it does nothing. This is the trap option.
- F2-O4: replaces the one CLI wrapper akrogon already has (`src/shell.ts:202-224`) with protocol code. Far beyond the defect.

Evidence: better-than-training (Socket API docs, fetched 2026-10-24), practitioner (override probe on 0.9.1, 2026-10-24).

Pitfalls:

- F2-P1 `herdr --help` describes `--session` as "Use or create a named persistent session" (live 0.9.1 help text). Pinning a call to a stopped session may start its server as a side effect. What removes it: only ever pin to sessions `session list --json` reports `running: true`, and never probe a stopped session with an API command. Whether API commands auto-start is unproven; see Fog and proof calls.
- F2-P2 `herdr session list` itself is the enumerator and must stay unpinned. What removes it: it is not routed through the same pinned path as workspace, tab, pane, agent, and notification calls.
- F2-P3 Call sites that bypass `herdr()` keep ambient behavior silently. Live inventory of bypasses in scope: `src/next.ts:192` (busy notification), `src/next.ts:611` (agent start), `src/next.ts:646` (agent prompt), `src/reconcile.ts:387` and `src/reconcile.ts:667` (tab close). What removes it: one pinned argv builder that both `herdr()` and these sites use, so a bypass has to be deliberate.

## F3. What makes a recorded tab or pane ID in state.yaml mean one specific pane?

Leaf state stores `tab` and `pane.A` / `pane.B` with no session (`src/state.ts:96,100`, strict object). IDs belong to a single server (CLI reference line 70) and `w8` exists in two sessions right now (probe).

Options:

- F3-O1 Store the session name in state at allocate time (new optional field). Existing leaves get resolved once.
- F3-O2 Store nothing. Resolve the repo's session per pass (F1) and read stored IDs as scoped to that session only.
- F3-O3 Search all running sessions for the stored ID each time it is used.

Pick: F3-O2. One source of truth (the workspace label) instead of two facts that can disagree after the operator moves a workspace. Allocate already re-matches a tab by slug label plus pane cwd inside the worktree when the recorded tab is absent (`src/next.ts:396-402`), so a workspace that moved sessions degrades to re-match, not corruption. Cost: no herdr call on a leaf may run before its repo session is resolved, which forces session context through call chains that today just call `panes()`.

Rejected:

- F3-O1: schema and migration work, plus a stored name that goes stale exactly when the operator reorganizes sessions. The disagreement case (stored session vs. label discovery) then needs its own rule.
- F3-O3: bare-ID search can hit a same-ID pane in the wrong session. Destructive uses exist: pane close at `src/next.ts:383`, tab close at `src/reconcile.ts:387,667`. Making every ID use cwd-verified is a wider change than scoping lists by session.

Evidence: better-than-training (`src/state.ts:96-100`, `src/next.ts:383,396-402`), practitioner (duplicate `w8` probe).

Pitfalls:

- F3-P1 Allocate matches a tab by `tab_id` alone before the label-plus-cwd arm (`src/next.ts:397`). Under F3-O2 this is safe only if the tab list is already scoped to the resolved session. What removes it: resolve the session before the first `panes()` / `tabs()` call in `allocate` (`src/next.ts:373,388`), not at the workspace lookup on line 407 where it sits today. This ordering is the actual defect shape: today, pane close at line 383 runs in the wrong session before line 408 ever throws.
- F3-P2 The seed incident already wrote wrong-session IDs into one leaf's state. After the fix, those IDs simply will not be found in the resolved session and allocate re-matches by label and cwd. What removes it: nothing extra, but handoff should say existing poisoned state self-heals only through that re-match path.

## F4. Which panes count for cross-repo decisions in one pass?

Several decisions use one shared pane list for all repos: capacity counting (`src/next.ts:354-370` `activeCount` iterates every registered repo against one `panes()`), the pass-level lazy list shared with reconcile (`src/next.ts:1348-1356`, `src/next.ts:1526`), reconcile's live-pane keep vetoes (described in `src/AREA.md`, reconcile entry), merged-tab closing (`src/reconcile.ts:383-389`), and hook pane ownership (`src/next.ts:1330`).

Options:

- F4-O1 Union: list panes in every running session, each pane tagged with its session. Vetoes and counting read the union. Destructive calls go to the owning session from the tag.
- F4-O2 Per-repo lists only: every consumer takes the pane list of its own repo's session.
- F4-O3 Keep the single ambient list.

Pick: F4-O1 for reads that protect work (reconcile veto, capacity), with the session tag carried so closes and prompts are issued in the owning session. A veto that misses a live pane because it sat in another session can delete a worktree under a running seat; that is the worst failure in this territory and it exists today whenever the ambient env names the wrong session. Cost: the `Pane` type (`src/shell.ts:150-162`) gains a session tag or a parallel structure, and every consumer that matches by bare `pane_id` or `tab_id` must be audited for cross-session ID collision.

Rejected:

- F4-O2: cleaner scoping, but `activeCount` and the shared pass list are cross-repo by design (one list per pass is a stated pattern, `src/next.ts:1347` comment). Per-repo lists for the veto still need a rule for panes whose repo does not resolve (Himne today), which reintroduces a union for safety anyway.
- F4-O3: the current defect. A wrong-session process sees zero panes for leaves in the real session.

Evidence: better-than-training (lines above, `src/AREA.md` reconcile entry), practitioner (three sessions hold registered repos, so `--all` passes are cross-session by construction).

Pitfalls:

- F4-P1 One session's socket erroring must not turn the union into an empty or null list for everyone. Today `panes().catch(() => null)` (`src/next.ts:1352`) keeps everything, which is the safe direction. What removes it: per-session failure marks that session unknown, and unknown keeps vetoes and counts capacity as full for its repos, matching the existing unknown handling in `activeCount` (`src/next.ts:356-368`).
- F4-P2 Union lists make bare-ID matches ambiguous (same pane ID in two sessions). Match sites: `src/next.ts:1330`, `src/log.ts:40`, allocate's recorded-pane filter (`src/next.ts:374-376`). What removes it: matches compare session tag plus ID, or verify pane cwd inside the leaf worktree as `activeCount` already does (`src/next.ts:360`).
- F4-P3 Listing panes in N sessions per pass multiplies herdr calls on a hot path (plugin fires `akrogon next` on every pane status change, `plugin/herdr-plugin.toml:12-27`). What removes it: the existing once-per-pass lazy list pattern extended per session, not a fresh list per leaf.

## F5. What about stale HERDR_PANE_ID, the second half of the stale pair?

Uses: hook attribution at `src/next.ts:1345` feeding `paneOwners` (`src/next.ts:1330-1337`), diagnostic session lookup at `src/log.ts:36-46`, and deliberate omission in land (`src/land.ts:16`). The incident's stale value `w4:p2` is a real, live pane in mdconsultingny, so an existence check passes.

Options:

- F5-O1 Trust it once the socket is fixed.
- F5-O2 Validate existence only.
- F5-O3 Trust it only in the hook case (plugin event present, where the firing server injected the pair fresh), and for dispatch-driving attribution also require the pane's cwd to sit in the claimed leaf's worktree.

Pick: F5-O3 for attribution that drives dispatch; `src/log.ts` diagnostic use can keep a plain lookup since it already tolerates failure. Herdr injects both vars into plugin command env (Socket API docs lines 563-566) and into pane processes at birth (lines 254-257), so the pair is fresh exactly in the hook case and in a real seat shell. The Claude Code spare-process case has no plugin event. Cost: manual `akrogon next` run from inside a seat pane without an event may lose whatever hook-pane routing it gets today; how much that path matters is Fog.

Rejected:

- F5-O1: with F4 union lists, the stale `w4:p2` would now be found, in the wrong session, and could attribute the pass to an unrelated leaf or none.
- F5-O2: existence is true for the incident value. The check removes nothing.

Evidence: better-than-training (Socket API docs lines 254-257, 563-566; `src/next.ts:1330-1345`), operator (seed process-tree evidence of the stale pair).

Pitfalls:

- F5-P1 `paneOwners` already filters by leaf ownership (`ownsPane`, `src/next.ts:1334`), which bounds the damage to wrong attribution among leaves that record that pane. What removes the rest: the cwd check, since a foreign pane's cwd will not be inside the leaf worktree.

## F6. Which herdr surfaces are in scope beyond seat placement?

Inventory (all ambient today, grep 2026-10-24):

- src through `herdr()`: allocate and dispatch (`src/next.ts:206,383,426,441,473,476,505`), notifications (`src/next.ts:866,880`, `src/phase.ts:87-99`, `src/verify.ts:241`), tab rename (`src/phase.ts:64`), pane process info for scope boxing (`src/scope.ts:123`), log diagnostic (`src/log.ts:40` via `panes()`).
- src bypassing `herdr()`: `src/next.ts:192,611,646`, `src/reconcile.ts:387,667`, `src/install.ts:136-137` (integration install, plugin link), `src/self-update.ts:284` (plugin link).
- Entry and forwarding: `plugin/next.sh` (hook entry), `src/land.ts:33-35` (systemd forwarding, F8).
- Skill scripts, each with its own spawn: `skills/chart-issues/scripts/peer-ask.ts:36,49`, `peer-wait.ts:95,117`, `peer-restart.ts:60`, `door-reset.ts:75`, `skills/watch-issues/scripts/observe.ts:88`.

Options:

- F6-O1 Everything that names a pane, tab, workspace, agent, or notification gets session-pinned; machine-global commands (plugin link, integration install) stay ambient.
- F6-O2 Only the allocate and dispatch path in `src/next.ts`.
- F6-O3 src only; skill scripts keep ambient because they usually run inside a correctly injected pane env.

Pick: F6-O1 for src in this work, and treat the five skill scripts as in-scope territory for the chart to size as their own piece. Inside src, `src/scope.ts:123` (shell pid for boxing) and `src/reconcile.ts:667` (tab close) are not optional extras: a wrong-session process-info call fails allocate after state is saved (`src/next.ts:428-430` saves tab state before boxing), and a wrong-session tab close at least fails safe via `tab_not_found` keep (`src/reconcile.ts:667-675`). Notifications go to the repo's session, with no ambient fallback; verify already stores `error` and retries on the next base run (`src/AREA.md` verify entry), so a stopped repo session delays the notice instead of showing it in a wrong place. Plugin link and integration install stay ambient: plugin registration presents identically in all sessions (probe), and integration install writes harness configuration, not session state (model-knowledge, 2026-10-24; worth one confirming look during implementation).

Rejected:

- F6-O2: leaves the same defect class alive in reconcile, scope, phase, verify, and land. The seed's own first symptom was a phase-side rename warning (`tab wA:tRE not found, skipping rename`, produced at `src/phase.ts:62-81`), which F6-O2 would not fix.
- F6-O3 as a permanent state: peer scripts and door-reset run under seat A and the door, which are exactly the processes a stale-spare daemon can hand a wrong env to, and `observe.ts` runs under cron (skills/watch-issues/SKILL.md:12) and would silently report a wrong session's agent states. Acceptable only as a sequenced second step, not as the end state. Note the scripts cannot import `src/shell.ts` conventions for free; each has its own spawn helper (`door-reset.ts:74-82`, `peer-restart.ts:60-72`), so pinning them means passing a session name in from the caller that knows it.

Evidence: better-than-training (file lines above), practitioner (plugin list probe), model-knowledge (integration install scope).

Pitfalls:

- F6-P1 Hook entry is the one ambient case that is correct by construction: the firing server injects its own socket (docs lines 563-566), and `--resume` at server start (`plugin/herdr-plugin.toml:7-10`) runs once per session server. If akrogon learns to ignore ambient env entirely, a hook pass must still be able to find its own pane (F5) without scanning being per-leaf expensive. What removes it: hook passes resolve repos by F1 like any other pass; the injected socket is used, at most, to name the hook's own session by matching `socket_path` in `session list --json` output, never parsed from the path string.
- F6-P2 Agent names are per-server (CLI reference line 70) and akrogon derives agent names from pane IDs (`src/next.ts:609`). Cross-session name collision is impossible to hit once calls are pinned, but any future cross-session agent listing must not treat names as global. What removes it: pinning (F2); no separate work.

## F7. Missing, stopped, and ambiguous: exact refusal behavior

Options per case:

- Missing label in every running session: refuse, naming the repo label and the sessions searched (extends the current error at `src/next.ts:408`). Himne is this case live today.
- Label exists only in a stopped session: refuse naming that session, or start it.
- Same label in two or more running sessions: refuse listing them, or tie-break (ambient session wins, or focused workspace wins; `workspace list` output carries a `focused` flag per workspace, live output 2026-10-24).
- Duplicate label within one session: first match wins (today, `find` at `src/next.ts:407`) or refuse.

Pick: refuse visibly in all four, no starting, no tie-break. This is the operator's stated expected behavior (seed), and starting a stopped server with `--resume` startup hooks (`plugin/herdr-plugin.toml:7-10`, which runs `next --resume` and `pull --all`) is a large side effect to trigger from a lookup. Cost: an operator who legitimately keeps same-named workspaces in two sessions must rename one. That cost is the point: the label is the address.

Rejected: ambient tie-break reintroduces the stale env as the deciding vote. Focused tie-break rests on per-client focus state whose semantics for detached servers are unproven (Fog).

Evidence: operator (seed), better-than-training (`src/next.ts:407-408`, `plugin/herdr-plugin.toml:7-10`).

Pitfalls:

- F7-P1 Refusal inside a `--all` pass must not abort repos that resolve cleanly. Today an allocate throw propagates per leaf; the handoff needs the refusal scoped per repo so one Himne does not block infra repos. What removes it: resolution failure recorded per repo and surfaced once, other repos proceed. Exact current throw propagation should be confirmed in implementation, not assumed.
- F7-P2 "Exists only in a stopped session" cannot be detected by listing that session's workspaces without possibly starting it (F2-P1). So this case is indistinguishable from plain missing unless herdr exposes stopped-session workspace labels without starting. What removes it: nothing known; the refusal message should list stopped sessions as "not searched (stopped)" so the operator can start the right one. See Fog.

## F8. Detached contexts: the systemd land unit and cron watch

`src/land.ts:33-35` forwards the caller's `HERDR_SOCKET_PATH` into `akrogon-land-<attempt>`. The land process later calls `mergeWake` (see `src/AREA.md` land entry), which reaches notification code.

Options:

- F8-O1 Keep forwarding the socket.
- F8-O2 Forward the resolved session name instead.
- F8-O3 Forward nothing herdr-related. The land process resolves the repo's session itself (it knows repo and slug, `src/land.ts:17`).

Pick: F8-O3. Forwarding any ambient value re-imports the exact staleness being removed, and resolution (F1) needs only `herdr` on PATH with HOME set, both already set in the unit (`src/land.ts:29-30`). Cost: land pays one resolution; nothing else changes.

Rejected: F8-O1 keeps the incident vector for merges. F8-O2 is a second mechanism to keep consistent when F1 resolution already exists in-process.

Evidence: better-than-training (`src/land.ts:16-35`).

Pitfalls:

- F8-P1 Tests around the land unit argv exist in the suite (land unit is named and asserted as a surface). Changing `--setenv` lines breaks exact-argv assertions if any; that is expected churn, sized in F9.
- F8-P2 `observe.ts` under cron has the same shape: no pane, possibly stale or absent env. Under F6 it gets the repo session passed or resolved the same way; until then it can only misreport, not misplace, which is why it sequences after src.

## F9. Test harness shape: the fake herdr has no sessions

`tests/fake-herdr.ts` holds a single DB (`tests/helpers.ts:139` `herdr.json`), parses `process.argv.slice(2)` with `args[0]` expected to be the subcommand (`tests/fake-herdr.ts:84,162`), and defaults workspaces to `w1/repo` and `w3/other` (`tests/fake-herdr.ts:59-61`). Fixtures blank `HERDR_PANE_ID` but pass `HERDR_SOCKET_PATH` through in at least one case (`tests/phase.test.ts:1867` points it at a missing socket).

Options:

- F9-O1 Teach the fake sessions: parse a leading `--session <name>`, keep one DB per session name, answer `session list --json` from those DBs with a running flag.
- F9-O2 Keep the fake single-session and make akrogon's resolution treat "no session list" as one ambient session in tests only.

Pick: F9-O1. The behaviors that need proving (wrong ambient session, label in another session, ambiguous label, stopped session) cannot be expressed in a one-session fake. Cost: this is a meaningful fraction of the total diff; every fixture that seeds panes or workspaces must name a session, defaulting sensibly.

Rejected: F9-O2 adds a test-only branch in production resolution code, which is the kind of seam that later hides a real single-session deployment bug.

Evidence: better-than-training (test file lines above).

Pitfalls:

- F9-P1 The same fake backs door-reset, green-merge, pause, seat-containment, batch-dispatch, and state-inventory tests (grep of tests/, 2026-10-24). A fake change is a broad but mechanical blast radius; the skill script tests (`skills/watch-issues/scripts/observe.test.ts`) use their own stubs and would need the same treatment only when the scripts are pinned (F6).

## Fog

- Does an API command with `--session <stopped>` start that session's server, error, or hang? The 0.9.1 help says "Use or create a named persistent session" for the flag generally. F2-P1 and F7-P2 both depend on this. Not probed: starting a server is operator-visible and fires startup hooks.
- Can one session hold two workspaces with the same label? Unknown. F7's within-session duplicate rule is a guess until probed.
- Is label = registered repo name a written operator contract anywhere, or only code at `src/next.ts:407`? Not found in `src/AREA.md` or `docs/reference-index.md` (read 2026-10-24). If it is only a habit, F1 makes it a load-bearing address and init or docs may need to say so.
- Version skew: docs fetched are v0.9.5, installed herdr is 0.9.1, plugin requires 0.9.0 minimum (`plugin/herdr-plugin.toml:4`), and one test fixture was captured on 0.9.3 (`skills/watch-issues/scripts/observe.test.ts:490`). The two facts this map leans on (`--session` precedence and `session list --json` shape) were proven live on 0.9.1; other docs claims (injected plugin env) were not re-proven live.
- How much does manual `akrogon next` from inside a seat pane (no plugin event, real `HERDR_PANE_ID`) rely on hook-pane routing today? F5-O3's cost cannot be priced without reading the selection paths that consume `hookPane` end to end.
- Remote and saved-machine herdr (`--machine`, `--remote`) are unaddressed. akrogon's scope boxing is local cgroup work (`src/scope.ts`), so remote panes cannot host seats; the map assumes local sessions only, but nothing stops a same-labeled workspace existing on a remote machine. Should resolution explicitly ignore non-local servers, and can `session list` even see them? Unknown.
- Seat shells launched by Claude Code background jobs will keep receiving stale env from the upstream daemon-spare bug (seed). This work makes akrogon stop trusting the pair for session choice; any other tool the seat runs that trusts `HERDR_SOCKET_PATH` stays exposed. Out of scope, but the operator should not expect the fix to cover seats' own direct herdr calls typed by hand.

## Human-only prerequisites and proof calls before handoff

1. Proof call, needs operator OK because it may start a server and fire startup hooks: run one read-only API command against a stopped session (throwaway name preferred: `herdr --session akrogon-probe workspace list`, then `herdr session stop akrogon-probe` and delete it) and record whether the server started. This settles F2-P1 and the F7 stopped-session message.
2. Proof call, same throwaway session: create two workspaces with one label and confirm whether herdr allows it. Settles the F7 within-session duplicate rule.
3. Operator decision: workspace label exactly equal to the registered repo name (case included) is the address akrogon resolves by, per F1/F7. Himne currently has no workspace, so its leaves will refuse until one is labeled `Himne` or the repo is re-registered under a matching key.
4. Operator decision, small: notifications for a repo whose session is stopped are dropped and retried by existing receipt logic, never shown in an ambient session (F6 pick). Confirm that refusable silence is preferred over a visible-but-wrong-session notice.
