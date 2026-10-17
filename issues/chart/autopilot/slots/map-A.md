# Opening map, slot A (chart: autopilot)

Scope (operator correction, binding): autopilot is the chart-issues door answering at the points where the operator would answer, picking the best option, then handing off. The existing watcher (skills/watch-issues/SKILL.md, tab watch-akrogon, pane w8:pQ6, ticking every 20 min) takes over after handoff. Consultants are named per session by the operator. All inside herdr.

## Live-surface facts
- L1 Handoff to watcher seam already exists: a fresh leaf (phase plan.synthesis, seats absent) is "Waiting" under watch-issues Judge, so the next tick runs `akrogon next <slug>` (skills/watch-issues/SKILL.md, Judge: Waiting). Door handoff "runs no `akrogon next`" (skills/chart-issues/SKILL.md, Handoff). Last night A ran `next` itself (sources/autopilot-night-2026-10-16.md "How A runs it"); with the watcher live that step is redundant. Worst start delay 20 min.
- L2 The rule autopilot overrides: "Recommendations and silence cannot supply an operator answer" (skills/chart-issues/assets/questions.md:31). Autopilot needs an explicit, recorded exception, not silent drift.
- L3 Door turn ends: A ends its turn for an operator round, peer `failure`, peer `blocked`, non-zero script exit (questions.md, Blind peer exchange). Under autopilot each of these stalls the night unless a rule says what happens instead.
- L4 Human-only prerequisites, needs sheets, live-change grants and required probes all hold the handoff by design (SKILL.md Take). Autopilot cannot satisfy them.
- L5 Direct route includes push to main, source close, broadcast (SKILL.md Direct route). Last night autopilot used it (state-cutover landed 568556b, a one-time host migration).
- L6 Operator record (sources file): 89% recommended taken, 2% other listed, 9% own free text. Free text pushed toward: do it now, user-facing optimum, tighter time targets, stronger model floor, move work to owning repo.
- L7 Watcher is Claude Code cron, 7-day expiry, session-bound (watch-issues Invocations). Not redesigned here.

## Forks (material)
F1 Switch: how the operator turns autopilot on and off.
- 1a Per-invocation: operator says it in the door (e.g. `/chart-issues autopilot`), door writes `Mode: autopilot <start time>, operator words` into each chart it touches so a compacted or replaced session reads it; off = operator's next message in the door pane that says so, mode never outlives the session. (pick) Cost: must be re-said each night. Invites later: none persistent to forget.
- 1b Persistent config flag (`autopilot: true` in issues/config.yaml or machine config). Breaks later: forgotten flag makes an attended day silently autopilot. Rejected.
- Q: does any operator message end autopilot, or only an explicit off? Last night operator sent mid-run inputs. Pick: explicit off; any other operator message is an input the door applies, and a question to the door is answered.

F2 Decision scope: which answers autopilot may give, and which it holds.
- 2a Decide judgment questions within the repo's evidence; hold any question that needs a fact only the operator has (business, money, people, priorities between projects), a human-only prerequisite, a need, a grant, a live-change or outside-account effect, a change to an earlier operator answer, or a peer disagreement still standing after rebuttal. Held fork stays open; door moves to the next chart (Drain already does this for waits). (pick) Cost: some charts finish at "held" overnight.
- 2b Decide everything except prerequisites/needs/grants. Breaks: re-litigates locked answers, picks priorities the operator owns (the 9% free-text cases).
- 2c Decide only all-recommended rounds where all slots agree. Too narrow: operator wants "best", not "recommended".

F3 Route under autopilot: may the door take the direct route (it pushes to main itself)?
- 3a Lifecycle only under autopilot; direct needs the operator. (pick) Reason: lifecycle has a second review and merge seat and the watcher; direct is the door grading its own work with one reviewer, and its push/close/broadcast are outward. Cost: small items take longer (lifecycle ~35-60 min vs direct).
- 3b Direct allowed when eligible. Last night state-cutover went direct and took 4 repair rounds on a host migration (sources file); the risk shows.

F4 Intake: what autopilot may chart.
- 4a Only what the operator queued: notes they gave, seeds they named, or "all seeds of repo X". Door findings found mid-night become seeds (seed-issue), not new charts. (pick) Prevents scope growth (state-cutover was a door finding charted by itself).
- 4b Anything, including door findings. Breaks: runaway self-generated work.

F5 How a pick is made (quality).
- 5a Every step kept (research, blind peers, merge, rebuttals, full written round). Then A picks against a written values file (operator-owned, from the operator record: simplicity, function over form, delete over stack, speed, cost, plus the free-text tendencies), sends the pick plus reasons to each peer for one challenge, and records `autopilot pick` with reasons and the peer verdict in the fork. Standing objection from a peer -> hold (F2). (pick)
- 5b A picks without the extra challenge. Cheaper; last night the final-shape check still caught real gaps (B F1, F2 on temp-release).

F6 Self-modification: may autopilot chart changes to akrogon's own process (chart-issues, watch-issues, autopilot rules)?
- 6a Hold them for the operator. (pick) Autopilot changing its own stop rules removes the operator's control.
- 6b Allow. Breaks: the guard erodes itself.

F7 Morning report and overturn.
- 7a Door keeps a run log (like sources/autopilot-night) and ends with a summary: each pick, held forks with the reason, leaves started. Overturn = operator correction appended to the fork; if handed off, it becomes new intake (shapes rule). (pick)

F8 Stalls (L3): peer failure/blocked, script exit, door question.
- 8a Peer failure or blocked: mark that chart held with the reason, notify via `herdr notification show`, move on; no auto re-prompt (questions.md forbids). (pick)

## Practitioner questions (to research)
- Who runs unattended agent loops with bounded autonomy: Anthropic "Building effective agents" (stop conditions, human checkpoints), Simon Willison on agent YOLO risk, aviation autopilot mode-confusion literature (mode awareness, explicit annunciation), Google SRE on toil automation and kill switches.

## Pitfalls
- P1 Mode confusion: operator unsure whether autopilot is on. Removed by mode line in chart + start/stop announcement.
- P2 Rubber-stamp drift: A always takes its own recommendation. Removed by peer challenge on the pick (5a) and recording disagreement.
- P3 Night-long stall on one peer. Removed by 8a.
- P4 Re-litigating locked operator answers. Removed by 2a hold.
- P5 Self-modification. Removed by 6a.
- P6 Context loss after compaction drops the mode. Removed by mode line in CHART.md.

## Locks touched
questions.md:31; chart-issues SKILL.md:3 "Operator-invoked only" (autopilot is still operator-invoked); watch-issues unchanged; seat-stall-detection "no hidden watchdogs, clocks or polling" (no new timer: autopilot runs inside the door session).

## Fog
- What the earlier failed attempts were and why (research pending).
- Whether the values file is a new operator file or a section of an existing one.

## Proposed split
One destination akrogon, skill text only: chart-issues SKILL.md autopilot section, questions.md exception, docs/guide/chart.md. Likely one lifecycle leaf (skill text, tested by whatever skill-text tests exist). Off route: watcher redesign, persistent config flag, dispatch changes.
END map-A
