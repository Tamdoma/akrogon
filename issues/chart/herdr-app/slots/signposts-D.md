# Signposts angles: slot D (herdr-app)

Settled, not asked again: one cutover, no compatibility layer, no fallback to old herdr; every agent gets a visible pane at start and after restart; consultants stacked in one column in order; consultant names `<repo prefix>-slot-<letter>`; chart folder exists from open, no /tmp paths; reset is kill and restart, never `/clear` sent by another terminal; no polling, a slot sends its own message (operator 2026-11-06).

## Q1 Bootstrap order: what runs the leaves that build this port?

Until the engine lands, `akrogon next` still dispatches into old herdr (`src/shell.ts:226`), which nobody uses now. So the port's own leaves have no working runner.
- 1a (recommended) One engine-first leaf, run direct/manual in herdr-app. Once it lands, dispatch the rest of the epic through the new engine, which also proves it.
- 1b Build the whole epic direct/manual outside the leaf engine, cut over at the end.
- 1c Chart-door skills first, engine last.
Steers: epic leaf order, direct vs leaf route, when old herdr can actually be switched off, what counts as proof.

## Q2 Engine shape: is there a long-lived parent, or does each slot drive the next step itself?

Today herdr plugin events trigger stateless `akrogon next` runs (`src/next.ts:1605` reads `HERDR_PLUGIN_EVENT_JSON`). In hc, a `hc send` needs a live parent terminal to land in. Leaf slots have no door.
- 2a (recommended) Stay stateless. A finishing slot runs `akrogon next` itself (or sends to its peer slot). No daemon. Add an `hc events` watcher only if a named case proves one is needed.
- 2b One long-lived supervisor per repo (terminal or process) following `hc events` and receiving sends. It needs a home, restart, and crash behaviour.
- 2c A herdr-app mod triggers the engine (`notify` lives there too).
Steers: plugin replacement, startup `pull`/`--resume` home, notifications, who notices a slot that died without reporting, reconcile.

## Q3 Survival: what happens when a parent terminal, the window, or the core goes away?

hc children die with their parent unless `--outlive-parent`; `hc keep` after core loss gives a shell, never reruns the task (hc manual).
- 3a (recommended) Split: consultants die with their door (clean restart from seat record), leaf slots outlive their starter, and akrogon state files are the only recovery source after loss.
- 3b Nothing outlives. Closing a door or tab ends its work by design.
- 3c Everything outlives, and reconcile owns orphan cleanup.
Steers: state identity (stable hc names, not addresses), orphan rules, kill safety, what "resume" can promise after reboot.

## Q4 Where does hc awareness live for agents inside herdr-app?

`~/.config/herdr-app/AGENTS.md` is rewritten on every app start and is only read by agents working in that folder, so alone it teaches nothing to a normal session. The old global herdr skill actively points agents at the wrong binary.
- 4a (recommended) Replace the global herdr skill with an hc/herdr-core skill for each harness, gated on hc env (`HC_SESSION`/`HC_TERMINAL_ID`). Nothing in global CLAUDE.md/AGENTS.md. Akrogon briefs still state their report line explicitly and never rely on the skill loading.
- 4b Global CLAUDE.md/AGENTS.md in pi, codex, and Claude Code. Always loaded, including outside herdr-app.
- 4c Akrogon only: briefs and akrogon skills teach hc. Agents run in herdr-app outside akrogon stay unaware.
Steers: install and self-update scope (does akrogon own a global skill across four harnesses?), the installed-vs-repo skill split, whether sub-agents started by hand behave.

## Q5 Truth source: how far do we trust hc status and sends?

Intake shows `started: true` lying, codex reporting `working` while blocked on a question, sandboxed codex silently unable to reach the hc socket, and a backgrounded Claude reporting no status at all.
- 5a (recommended) Files and akrogon state are truth. hc status and `done` sends are transport and hints. Keep only the guards that check a file or a turn actually happened.
- 5b Trust hc. Delete the old guards (door-reset checks, delivery proof) and accept the known lies.
- 5c Block cutover on upstream fixes for the listed quirks.
Steers: how much of `peer-wait`/`door-reset` logic survives, stall detection on codex questions, start-helper size, test design.

## Q6 What are we willing to lose that only `agent_session.value` made possible?

Seat records, usage, log lookup, and delivery proof key on it (`src/log.ts:51`, `src/next.ts:708`). `hc get` has no agent session id.
- 6a (recommended) Re-key on hc name and terminal where that works, and drop features that only the session id enabled. No scraping harness session files per agent kind.
- 6b Must keep per-seat usage and log linkage. Accept per-harness file lookup (claude, pi, codex, agy) as a permanent part.
- 6c Keep the features, accept gaps where a harness exposes nothing.
Steers: `seats.yaml` and `state.ts` shape, USAGE.md, verify/log scope, leaf count.

## Q7 Equal consultant heights: blocker, upstream ask, or dropped?

The column works, but no command sets pane weights, so three consultants land 50/25/25, not 33% each. Weights exist only in the stored tab tree file.
- 7a (recommended) Accept unequal heights now, file the upstream feature ask, never write herdr-app's private tab-tree file from akrogon.
- 7b Blocker: equal heights must work at cutover, even if that means a herdr-app change lands first.
- 7c Write the weights into the tab-tree file directly.
Steers: start-helper complexity, dependency on herdr-app releases, overlap with the herdr-panels chart.

## Q8 Cutover moment: what happens to work already in flight?

Open leaves and chart folders hold old pane ids; other repos run the installed akrogon; the installed chart-issues skill already differs from the repo copy.
- 8a (recommended) Drain or abandon open leaves before landing. No state migration code (that is a compatibility layer by another name). One landing order for all repos: engine, skills, installed copies, old skill removal.
- 8b Ship a one-time migration for open leaf state.
- 8c Land per repo as each is ready.
Steers: landing sequence, whether `state.ts` needs migration, multi-repo rollout, when `~/.claude/skills/herdr` is deleted.

Note for A: Q1 and Q2 are the pair most easily missed. Together they decide whether this port is mostly deletion (stateless, slot-driven) or a new supervisor program.
