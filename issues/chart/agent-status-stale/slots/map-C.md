# Map C: agent-status-stale

Slot C, 2026-11-04. Read-only checks: `hc get t15/t3k --json`, `hc ls --json`, `/proc/<pid>/environ` and fd links of the door's process tree, `~/.claude/jobs/acb047ee/{state.json,timeline.jsonl}`, the original session transcript's last user lines, string and regex extracts from the installed `claude` binary (2.1.318), AGENTS.md "The model" and "Mods", `hc --skill` "Status, recovery, and cleanup", the agents-by-tab mod and its test, herdr-setup `issues/config.yaml`, the herdr-app intake, the signposts record.

## 1. Cause: A is right, with a sharper mechanism

F1 Confirmed. The door's session became a Claude Code background job at 2026-11-03T19:56:41Z. `hc get t15` `status_ms` 1793735801327 is that second. The process tree under hc's foreground claude (pid 2943990, on hc's pty `/dev/pts/51`) is `claude daemon run --origin transient` → `claude bg-pty-host /tmp/cc-daemon-1000/.../pty/acb047ee.sock 83 31` → the real session `claude --session-id acb047ee … --fork-session --resume bf6c9fb4…jsonl`, all started 20:56:41 local, running on a second pty `/dev/pts/40` that the pty host owns. The old foreground process is now only the viewer.

F2 Why no status reaches hc, from the binary, not from inference. Claude Code decides per capability whether it may write a terminal sequence. For program status the source function reads: `programStatus: se({terminal, bgWorker: CLAUDE_CODE_SESSION_KIND==="bg", …})` and `function se(e){ … if(e.bgWorker) return {settled:false, source:"bg worker"}; …}`. The background worker's env has `CLAUDE_CODE_SESSION_KIND=bg`, so OSC 7501 is settled off before any terminal probe. In a normal terminal the capability is settled by a probe ("probe: OSC 7501 reply" / "probe: no reply to OSC 7501"), which hc answers; that is why t3, t3k, t3f and the consultants report. Two independent blocks, either one enough: the worker never emits, and its pty is not hc's anyway. The viewer's OSC parser knows the number (`PROGRAM_STATUS: 7501`) but handles only title, link and tab status; 7501 falls to "unknown", so nothing is re-emitted on hc's pty.

F3 Why the status is `null` and not merely stale. The interactive REPL's exit path (`restoreTerminalModes`) writes a status clear when program status was on. hc recorded that clear at 19:56:41.327Z and keeps `reported: true`. Since then `hc ls` lists t15 as `agent: bash` with no status; hc itself now sees the door as a plain shell.

F4 What triggered it. The worker's env has `CLAUDE_BG_SOURCE=slash`: the `/background` command (alias `/bg`, "Send this session to the background and free the terminal"). The transcript shows the operator's message "ok, close the task list, I can't see the subagents at the bottom" at 19:56:40.050Z and an empty user entry at 19:56:41.283Z, 1.2 s later; the job's `intent` field holds that message. Whether the operator typed `/bg` on purpose is not knowable from files (low confidence either way; see Q1).

F5 Small correction to A's finding. `CLAUDE_CODE_CHILD_SESSION=1` and `CLAUDE_CODE_SESSION_ATTENDED=0` are not in the worker's env. What is there: `CLAUDE_CODE_SESSION_KIND=bg`, `CLAUDE_BG_BACKEND=daemon`, `CLAUDE_BG_SOURCE=slash`, `CLAUDE_CODE_SESSION_NAME=c-akrogon`, `CLAUDE_JOB_DIR=~/.claude/jobs/acb047ee`. The conclusion stands; the gate is `SESSION_KIND`.

F6 The sidebar did what it is built to do. `tree.js` gives a silent parent a row with `status: null`; `main.js` ranks a row as `max(own rank, kids' ranks)` and the group id uses `rankOf(a) || RANK.idle`, so a parent with rank 0 and idle children lands in Idle. Two smaller flaws next to it: the folded group header's "most urgent" uses members' own status only and ignores sub-agents, and the "16h" duration is time since the clear, shown as if it were idle time.

F7 Family, not a one-off. `~/.claude/jobs/` holds 16 background jobs since 2026-09-30 (chart-framework, watch-framework, c-boulevard-automation, …), all `template: bg`, `backend: daemon`. Every one of them run from an hc terminal was silent to hc in the same way. A second face of the same family: when the viewer is closed ("free the terminal"), hc's foreground becomes bash and the sidebar drops the agent entirely while the job keeps working.

F8 There is a live status elsewhere: `state.json` `state: working`, `detail`, `tempo`, `updatedAt`, plus `timeline.jsonl` with one line per state change. It carries no hc address; the only join keys are `cwd` and `name` (here "c-akrogon", `nameSource: user`, equal to the tab title by coincidence of naming).

## 2. Where a fix can live

O1 Claude Code upstream. The worker emits program status, or the attach viewer re-emits the worker's status on its own pty. Removes the whole class for every multiplexer. Not ours to ship; a feedback item with the exact evidence in F2. Risk: none for us; it may never land.

O2 herdr-core. A way to set a terminal's status from outside (`hc status <t> working`) or to accept status from a sidecar. Breaks hc's one rule for status ("comes from the program's OSC 7501 reports; do not guess") and invites two writers racing on one terminal and faked status. hc is a binary from Herdr, not a registered repo, and `hc update` replaces it. Not a destination.

O3 agents-by-tab mod (herdr-setup). Two sub-options.
- O3a Be honest about silence: a parent with `status === null` that has live sub-agents is shown as "no status" (dim marker, no duration), is not folded into Idle, and the folded header counts sub-agents. Small, pure, testable in `tests/agents-by-tab.test.js` and `herdr-app check`. Does not restore "working"; the operator sees "this one stopped reporting" instead of a wrong "idle". Invites nothing. Depends on herdr's `terminals()` exposing something like hc's `reported` to tell "went quiet" from "never reported"; unverified (low confidence), and not needed for the minimal form.
- O3b Read `~/.claude/jobs/*/state.json` and paint the job's state onto the matching row. Restores the spinner for Claude only, ties the mod to an unversioned Claude Code internal, and joins job to terminal by name or cwd only, which collides as soon as two doors share a repo (the framework door already runs a job named c-framework earlier in the list). Would need `watchFolder` on `~/.claude/jobs`. Fragile; invites a silent mismatch that looks right.

O4 How the door is started and kept (akrogon rule text). The door's terminal is an interactive hc terminal and is never sent to the background; `/background` and `/bg` detach its status from hc for the rest of the session. Recovery when `hc get <A>` shows claude foreground with `status: null`: the binary's own hint is "run /stop, then claude --resume from your shell". Zero code, fits 1c (written rules over command checks) and 6a (survives the herdr-app move). Risk: a rule the operator must remember; it does not help if backgrounding the door is wanted (Q1).

O5 A hook in the background session writes OSC 7501 to hc's pty (`/dev/pts/51`, discoverable from the viewer pid's fd 1; the hook env still has `HC_TERMINAL_ID=t15`). hc holds the pty master so it would parse the sequence. Rejected: it writes raw escapes into another process's output stream mid-redraw, needs root-cause bypass of an upstream decision, and the moshi hooks already own `Stop` and `UserPromptSubmit`. Low confidence it would even be stable.

## 3. Questions a practitioner asks

Q1 Was `/bg` intended? If the operator wants doors in the background (free terminal, survive viewer close), the fix must live where background sessions are first class (O1, later O3). If it was a slip, O4 plus O3a closes the chart. Only the operator can answer; the files cannot.

Q2 What should a silent parent show? Nothing, "no status", or its children's state? Today's answer is "children's state", which reads as idle once they finish. That is the design choice behind the operator's screenshot, not a bug in the ranking code.

Q3 Does any akrogon engine logic, now or after the herdr-app port, read `hc ls` `agent`/`status` for the door? With the door at `agent: bash`, any "is A a claude" or "wait until A idle" check would be wrong. Nothing in the read set does today; the port's design should not start.

Q4 Does `hc wait --children` or any door script wait on A's own status? No: consultants report to A by `hc send`, and A's status is never a signal in the skill text read. Safe.

Q5 Is the pty size mismatch (worker 83x31, hc pane 58 cols) a separate symptom of the same backgrounding? Probably the viewer rewraps; not part of this chart (low confidence, not investigated).

## 4. Pitfalls

P1 Do not infer status from screen text ("Spinning…"); hc's skill forbids it and the mod would need polling `hc read`.
P2 Do not put the fix in hc or in a herdr-app default mod; neither is a registered repo. `agents-by-tab` in herdr-setup is the only sidebar code under the issue lifecycle (`issues/config.yaml`: checks `mods`, `json`, `shell`, `test`).
P3 Do not join jobs to terminals by name; two doors in one hc session already needed `<repo>-slot-<letter>` names to avoid a collision, and job names are free text the operator sets.
P4 Do not add a command check at door start that refuses `/bg`; signpost 1c says written rules.
P5 A fix that only restores "working" and not "no status" leaves the second family face (viewer closed, agent vanishes) untouched.
P6 The null status also hides A from `hc ls` as an agent; any watcher or operator reading `hc ls` for "which agents are live" undercounts.

## 5. Split with destination repo

S1 herdr-setup, mod `agents-by-tab` (O3a): a parent whose status is null with live sub-agents is shown as "no status", not folded into Idle, with no duration; the folded header's most-urgent includes sub-agents. Unit tests in `tests/agents-by-tab.test.js`; `herdr-app check` as merge check. One leaf.

S2 akrogon, rule text (O4): the door and every akrogon-started agent terminal stays interactive and is never backgrounded with `/background` or `/bg`; recovery line for a null status. Lives with the door rules the herdr-app move keeps (chart-issues SKILL.md or the herdr-app intake's door section), per 6a. Docs-only; could ride the herdr-app epic rather than its own leaf.

S3 Outside both repos: an upstream Claude Code report with F2's evidence. Recorded in the chart, not a leaf.

Not recommended: O2, O3b, O5.

Order: S2 is immediate and free; S1 is the one code change; S3 is a note. If Q1 answers "backgrounding is wanted", S1 stays, S2 shrinks to the recovery line, and S3 becomes the real fix with O3b as a stopgap the operator must explicitly accept.
