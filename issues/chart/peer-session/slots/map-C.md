# Opening map, seat C: peer-session

Destination (CHART.md:5): the chart peer scripts act only on the operator-named panes in the session where those panes live, never on a same-id pane in another session.

## Surfaces inspected

- Scripts: skills/chart-issues/scripts/peer-ask.ts, peer-wait.ts, peer-restart.ts, peer-create.ts, door-reset.ts (full reads, line cites below). Four separate herdr spawn helpers exist today, no single choke point: peer-restart.ts:60 `run()` (also used by peer-create.ts:3,61,68), peer-ask.ts:36 and :49, peer-wait.ts:95 and :117, door-reset.ts:75 (plus door-reset imports readPeerAgent from peer-wait at door-reset.ts:5). None pass `--session`, none read HERDR_SOCKET_PATH explicitly, so every call goes to whatever session the inherited socket names.
- The dangerous calls, in order: peer-restart reads `pane process-info` (peer-restart.ts:177) and later runs `kill -TERM -- -<group>` on the group that read returned (peer-restart.ts:215). Its read phase checks kind, history tokens and agent-name holder (peer-restart.ts:156-205), but all those reads happen in the same wrong session in the failure case, so they pass for the wrong pane's agent; nothing binds the pane to the operator's peer. peer-ask prompts at peer-ask.ts:36 and seeds kind and harness session from `agent list` at peer-ask.ts:49. peer-create splits A's pane and starts agents at peer-create.ts:61-68, which mutates another session's layout if misrouted. peer-wait only waits and reads (peer-wait.ts:95,117), so its harm is a wrong verdict, not a mutation. door-reset prompts at door-reset.ts:121,126,149 but already binds the target pane to a caller-supplied harness session id before sending anything (door-reset.ts:70-72,167-172), so a same-id pane in a wrong session fails that binding unless it also carries the same harness session; its risk is mostly refusal, not a wrong reset.
- Prose call sites: the pre-prompt wait chain typed raw by A (assets/questions.md:46, `herdr agent wait <paneB> && ... && bun peer-ask.ts ...`), the peer-ask and peer-wait rerun forms in the same paragraph, SKILL.md:27 (peer-create), SKILL.md:29 (peer-restart), SKILL.md:39 (seat record fields are `pane_id`, `agent`, `agent_session.value` from `herdr agent list`), SKILL.md:147 area (door-reset handover).
- The word "session" already means harness session everywhere in this area: seats.yaml `session:` (this chart's seats.yaml:5,10,15), exchange JSON `session` (peer-wait.ts:50-55), outcome line `session` (peer-wait.ts:242-245), restart line `session` (peer-restart.ts:98-105), door-reset argv `<session>` (door-reset.ts:159), chart-usage.ts:11 reads seats.yaml `session` as a harness transcript id. Any new herdr-session field named `session` will be misread by a human or a consumer.
- Sibling locks (Taken sections, 2026-10-24): discover across running sessions, zero or several matches refuse visibly, stopped sessions skipped and never started, an unreadable running session refuses, resolve once per invocation and never silently retarget, no session stored in leaf state (session-address 2c forecloses 2b storing it), acting calls go only to the resolved session, unknown is never treated as empty (cross-session-reads). session-routing delivers the src/shell.ts resolver (repo workspace by exact label), the argv builder with an executable parameter, and multi-session tests/fake-herdr.ts (issues/open/herdr-session/session-routing/brief.md). Real herdr 0.9.1 behaviour for `--session` routing of session list, workspace/tab/pane reads, pane split, process-info, agent start/prompt/wait/list was proved 2026-10-24 under a grant (operation-proofs P1-P7, recorded in session-routing/readiness.yaml).
- Live read by C, 2026-10-24, read-only: `herdr --version` 0.9.1; `herdr session list --json` shows 3 running sessions (infra, personal, mdconsultingny), 2 stopped; this pane's env HERDR_SOCKET_PATH names infra, HERDR_PANE_ID=w8:pV6. Pane lists across the 3 running sessions hold 55 pane ids with 0 duplicated across sessions today. One running session does hold early sequential ids (w1:p1, w1:p3, w4:p2), so cross-session duplication is possible in principle, just not present in this sample. Installed skill scripts run from ~/.akrogon/current (symlink into ~/.akrogon/releases/<rev>, which contains both src/ and skills/), not from this checkout.
- Tests: tests/peer-ask.test.ts, peer-wait.test.ts, peer-restart.test.ts, peer-create.test.ts, door-reset.test.ts drive the scripts against tests/fake-herdr.ts via a PATH shim and FAKE_HERDR db (tests/peer-ask.test.ts:89) and record every herdr argv. The fake is single-session today (tests/fake-herdr.ts:153 dispatches on args[0]); session-routing extends it with `--session`, per-session stores and `session list --json`.
- Outside source: herdr docs index https://herdr.dev/llms.txt, fetched 2026-10-24, points at v0.9.5 docs while the installed binary is 0.9.1, so I treat the sibling chart's 0.9.1 proof calls as the primary evidence and the docs only as corroboration that `--session <name>` is a global selector and ids belong to a single server.

## Forks

### F1 · How does a script learn which herdr session holds its pane?

Question: explicit door-supplied session (the B position carried in INTAKE.md), lookup by pane id (the C position carried in INTAKE.md), or something else?

- O1 Lookup by pane: each invocation runs `herdr session list --json`, searches every running session for the target pane, requires exactly one hit, then pins `--session <name>` on every herdr call it makes. Zero, several, or unreadable refuses before any mutation.
- O2 Explicit door session: A passes a herdr session name into every script, the detached child, and the raw wait chain, and scripts use it as given after checking the pane exists there.
- O3 Reuse the session-routing repo resolver: find the workspace whose label equals the chart's repo key and act in that session.
- O4 Record the herdr session name in seats.yaml at open and have scripts read it.
- O5 Keep trusting the inherited socket, but verify the pane exists in that session first.

Pick: O1. Reason: it removes the stale-socket class without new operator or door input, without changing any script's argv (so no version skew between installed scripts and prose, see F6), and it matches the sibling locks in both directions that matter: discover across running sessions with zero-or-several refusing, and derive the session fresh each invocation instead of storing it (session-address 2c, which foreclosed the stored field 2b for leaf state). It also works unchanged for operator-supplied panes, peer-created panes, and a peer-wait rerun copied from an old outcome line, because the pane id is the one input every call already has. Cost: a pane id that exists in two running sessions refuses a legitimate exchange (see pitfalls), and every invocation pays one session list plus one list per running session before its first real call.

Rejected:

- O2: the name is only as good as A supplying it correctly on every call for the life of the chart, and a wrong-but-valid name whose session holds a same-id pane still sends peer-restart's kill to the wrong process group, because existence in the named session is not identity. It also changes every CLI signature, the peer-ask to peer-wait child argv (peer-ask.ts:76-83), the door-reset detached child (door-reset.ts:175-178), the outcome-line rerun form (questions.md:46), and the raw wait chain, which creates an old-prose/new-script skew window at install. Its one real win is determinism under duplicate pane ids; F2 buys most of that win without a supplied name.
- O3: wrong anchor. The repo resolver answers where akrogon places leaf seats. The peer panes are where the operator put them beside the door, and the door can chart a repo whose workspace lives in a different session (the Himne workspace is in personal per stopped-and-ambiguous Q5, while a door charting Himne can sit in infra), or chart an unregistered repo (SKILL.md Open allows charting one locally). The peers would not be in the resolved session and every exchange would refuse.
- O4: seats.yaml `session` already means harness session (SKILL.md:39, chart-usage.ts:11), so a same-named or sibling field invites consumer confusion. It also stores what the sibling chart explicitly decided to derive each pass, goes stale if the operator renames or recreates the session, and forces every script to take a chart-folder argument it does not have today (peer-restart runs before some chart records exist in final form, and peer-create runs at open).
- O5: this is the bug with a check on top. The harm case is exactly a same-id pane existing in the stale session (INTAKE.md agent findings), and that is precisely when the existence check passes.

Evidence: operator tier, "3a - but we need to map it out immediately after this is done", recorded in call-coverage Taken, 2026-10-24 (scope only, no method chosen). Practitioner tier, script surfaces above. Better-than-training tier, sibling operation proofs P1-P7 on herdr 0.9.1, 2026-10-24, show `session list --json` and `--session`-routed reads and actions work while the inherited socket names another session. Practitioner tier, my live read 2026-10-24: 0 duplicate pane ids across 55 panes in 3 running sessions, so O1's refusal cost is not triggered by today's layout, though one sample does not bound the rate.

Pitfalls:

- P1 A new or restarted session later creates a pane with an id a live chart is using (early ids are sequential, w1:p1 exists today), and exchanges start refusing mid-chart. Removed by: F2's anchor, which can disambiguate in the common layout; otherwise this stays a visible refusal the operator resolves by closing the colliding pane, never a silent wrong action. What it invites later if ignored: pressure to add a silent fallback, which is O5 returning.
- P2 The intended session is stopped while another running session holds the same pane id, so the unique hit is the wrong pane and O1 acts on it. Removed by: F2 (the hit must share A's session), not by O1 alone. Without F2, O1 narrows the destination's "never" to "never while the intended session is running".
- P3 Scan hangs on a dead session socket; the spawnSync helpers have no timeout today (peer-restart.ts:60-64). Removed by: F3's per-call discovery deadline.

### F2 · Must a peer pane share A's herdr session, and how much identity is enough?

Question: is a unique pane hit anywhere enough, or must the pane live in the door's own session? And should acting scripts check more identity than they do today?

- O1 Anchor required: resolve A's own pane the same way, and refuse unless each target pane resolves to that same session. A pane is already an argument to peer-restart (peer-restart.ts:134 usage, argv[0]) and peer-create (peer-create.ts:50); for peer-ask and peer-wait the anchor id is the caller's HERDR_PANE_ID used only as an id to look up, never as a socket to trust; for door-reset the target is A's pane itself, so no separate anchor is needed.
- O2 No anchor: per-pane unique hit suffices, so a consultant may live in any session.
- O3 Anchor as tie-break only: use A's session only when the pane lookup is ambiguous.
- O4 Session plus added identity: also pass expected kind or harness session into peer-restart and peer-ask and refuse on mismatch.

Pick: O1, if the operator confirms consultants are always set up beside the door. Reason: created peers are beside A by construction (peer-create.ts:29-44 split geometry, SKILL.md:27), and supplied panes are named at open from the layout the operator is looking at (questions.md:46). Requiring co-location removes F1 P2 (stopped intended session, same id live elsewhere) and the mistyped-pane case where an id A got wrong happens to exist uniquely in another session. It also makes duplicates in other sessions harmless in the common case, because only a duplicate inside A's own session plus one outside then matters, and the outside one is excluded by the anchor rather than refusing the exchange. Cost: it forecloses a deliberate cross-session consultant layout, and peer-ask and peer-wait gain a dependency on the caller's pane id being findable, so a run from a shell whose pane is gone or duplicated refuses even though the peer lookup was clean.

Rejected:

- O2: leaves F1 P2 open and accepts prompts to a same-id pane in a session the operator never pointed at, as long as it is the only live one. That is a weaker reading of the destination than the chart states.
- O3: does not remove F1 P2, because the dangerous case there is a unique hit, so the tie-break never runs.
- O4: widens scope past the destination. Within the correct session, a wrong pane typed by A is a pre-existing exposure (peer-restart has never bound kind or harness session to seats.yaml), and door-reset and peer-wait already carry the strong bindings where the protocol has them (door-reset.ts:70-72, peer-wait.ts:152-160). Adding expected-session arguments to peer-restart and peer-ask is a separate chart's decision, not needed to fix session routing.

Evidence: practitioner tier, peer-create and questions surfaces above. Model-knowledge tier only on the claim that panes do not move between herdr servers, so a pane's session is fixed for its life; if herdr grows cross-session moves later, O1 plus per-invocation lookup still follows the pane, while stored or supplied names would not.

Pitfalls:

- P1 If cross-session peers are ever wanted (a consultant deliberately left in another session), O1 refuses by design and will look like a bug. Removed by: the operator answer to this fork now, or O2.
- P2 HERDR_PANE_ID inside a hook is only injected on focus and can be stale (cross-session-reads findings), so anchoring peer-ask on it is only sound for a caller running inside its own pane's shell. Removed by: treating the anchor id as a lookup key that must resolve uniquely and refusing when it does not, and by FG3 below confirming who actually invokes these scripts.

### F3 · Resolution timing, list choice, and failure rules

Question: when is the session fixed, what happens on stopped, unreadable, duplicate, or vanishing sessions, and which herdr list proves the pane is there?

- O1 Mirror the sibling locks: resolve every target pane once at invocation start, before any mutation; skip sessions listed stopped and never start one; a running session that answers server_not_running counts as stopped; any other error or a discovery deadline hit refuses, naming sessions searched and skipped; pin the result for the whole invocation including poll and wait loops; if the session vanishes mid-invocation, surface the herdr error and never re-resolve. Search with `pane list`, so a pane whose agent has exited is still found.
- O2 Resolve lazily per herdr call or per loop iteration.
- O3 Proceed on a unique hit when some other running session is unreadable.
- O4 Search with `agent list` only.

Pick: O1. Reason: it is the sibling chart's settled shape for the same failure classes, and two peer scripts run long loops where re-resolution is a retargeting hazard, not a convenience: peer-wait loops up to its whole budget (peer-wait.ts:266-340) and peer-restart polls every 250ms for up to 30s after the kill (peer-restart.ts:228-232). peer-ask today interleaves seed and prompt per peer (peer-ask.ts:118-128), so resolving all panes first also means a resolution refusal never leaves one peer prompted and another unstarted for session reasons. Cost: peer-ask's partial-failure behaviour changes slightly, in that a session-resolution failure for any peer refuses the call before prompting, where today a prompt failure skips only that peer; that difference needs one prose line so autopilot drop rules can classify it (FG2).

Rejected:

- O2: if the pinned session stops during a long peer-wait and the same pane id exists elsewhere, a re-resolving wait silently starts reporting the other pane's status, and `finish()` would report the other agent's harness session into seats.yaml (peer-wait.ts:235-246). It also multiplies session list calls by every loop.
- O3: uniqueness is unknown when a running session cannot be read, so acting on the one hit found repeats the unknown-as-empty error the sibling chart foreclosed (cross-session-reads Taken).
- O4: agent list misses a pane between agents, which is a real state in this area: peer-create's split source only needs to be a pane, peer-restart's own post-kill poll exists because the agent row lingers then drops while the pane remains (peer-restart.ts:26-28 comment), and door-reset reads its pane through readPeerAgent already and would still need pane existence for resolution. Resolution by pane list, then the script's existing agent reads in the pinned session, covers both.

Evidence: operator tier, sibling Taken answers 2026-10-24 (stopped-and-ambiguous 1a, 1b, 3a for skip, stopped-on-read, and the 10-second discovery deadline; session-address 3a for resolve-once). Practitioner tier, loop surfaces above. Better-than-training tier, P3 (2026-10-24) proved a stopped session read returns server_not_running and does not start the session, but only for `workspace list`, not `pane list` (see FG6).

Pitfalls:

- P1 Discovery deadline absent in today's sync spawns, so a hung session stalls the door inside a prompt step that A cannot leave. Removed by: a bounded timeout on the session list and per-session pane list calls only, as the sibling does for discovery reads, never on the prompt and wait calls that carry their own waits.
- P2 A resolution refusal under autopilot has no classification in SKILL.md:141's drop list, so the door may either stall or drop a healthy consultant. Removed by: one explicit prose mapping in this chart (FG2).
- P3 Resolving all peers up front lengthens the pre-prompt phase by one scan; with the questions.md:46 rule that T, the 5-second prompt waits and the budget fit under the harness command timeout, a slow scan eats budget. Removed by: the same deadline as P1, keeping the scan to a few list calls.

### F4 · How the resolved session travels: children, reruns, detached child, raw prose

Question: peer-ask spawns peer-wait children, door-reset spawns a detached child that outlives the door turn, peer-wait is rerun days later from an outcome line, and the pre-prompt wait chain is raw herdr typed by A. Which of these re-resolve, and which inherit?

- O1 Inherit inside one operation, re-resolve at each new door-typed invocation. peer-ask passes the resolved herdr session to its peer-wait children through a channel that is not the exchange JSON (own argument or env on the spawn at peer-ask.ts:76-83). door-reset's parent resolves and validates as today, then passes the herdr session to the detached child alongside DOOR_RESET_CHILD (door-reset.ts:175-178), and the child does not re-resolve. A standalone peer-wait rerun with no inherited session re-resolves by pane. The exchange JSON and outcome line gain no field.
- O2 Every process re-resolves, children included.
- O3 Put the herdr session in the exchange JSON and outcome line so reruns inherit it verbatim.

Pick: O1. Reason: peer-ask has already sent the prompt when its child starts, so a child that re-resolves and refuses leaves a prompted peer unwaited, breaking the rule that no prompt is sent without its wait (questions.md:46). door-reset's parent already proves identity and prints `queued` (door-reset.ts:167-179), so a child re-resolution can only add a failure the operator was told did not happen. The standalone rerun is different: it is a new invocation typed by A under a fresh budget, it mutates nothing, and re-resolving keeps the copy-verbatim rerun form unchanged. Cost: peer-wait gains two entry modes (inherited session given, or resolve), which is one conditional at startup, and a peer-wait rerun can refuse if a duplicate pane appeared during a long wait; that refusal is visible and safe because the wait sends nothing.

Rejected:

- O2: breaks the prompted-peer wait guarantee above, and doubles scans.
- O3: the exchange already has a `session` field meaning harness session (peer-wait.ts:50-55) and is schema-parsed (peer-wait.ts:264-272); adding a required herdr field breaks every outcome line already printed by the installed release when the new script reads it, and adding an optional one named anything session-like invites A to copy the wrong value into seats.yaml at SKILL.md:39. It also stores the session in a record, which F1 O4 rejects.

Sub-fork, the raw prose calls (questions.md:46 wait chain, and any agent list A types under SKILL.md:39):

- O1 Move the pre-prompt idle wait into peer-ask: wait for every peer to be idle in the pinned session before prompting any, then delete the raw chain from questions.md.
- O2 A learns the session name at open and types `herdr --session <name> agent wait` in the chain.
- O3 Leave the chain unpinned because a wait mutates nothing.

Pick: O1. Reason: it removes the whole class of door-typed herdr calls instead of giving A a name to carry, and peer-ask is where the session is resolved under F1 anyway. Today an unpinned chain can pass on a same-id idle pane in the wrong session, after which peer-ask prompts the right, still-working pane and the prompt fails as stalled; or it can block on a wrong working pane until T expires. No wrong prompt is sent, but the chain's purpose, no prompt unless every peer is idle, is defeated exactly in the stale-socket case this chart exists for. Cost: peer-ask's contract grows (idle phase for all peers first), and the timing arithmetic in questions.md:46, T plus the 5-second prompt waits plus budget under the harness timeout, and the rerun-the-whole-chain rule on a wait timeout, must be rewritten to match; that is an operator-visible behaviour change in the door protocol, not plumbing.

Rejected:

- O2: creates two sources of truth, a name A remembers for prose and a lookup scripts perform, and the name A learns at open through the socket match is the inherited socket this chart distrusts, so the chain can still wait on the wrong session while the scripts act on the right one.
- O3: leaves the gate described above defeatable, and leaves a standing example in the skill text of an unpinned herdr call for the next editor to copy.

Evidence: practitioner tier, peer-ask.ts:76-83 child spawn, door-reset.ts:166-179 parent and detached child paths including the DOOR_RESET_INLINE route at :173 which must follow the same rule, questions.md:46 chain and timing text. Practitioner tier, lesson in learnings/LESSONS.md dated 2026-09-11 (implementation changed a peer-question rule in the skill while docs kept the old rule): prose and scripts in this area have drifted before, so any contract change here must sweep the other copies, including SKILL.md:27,29,147 which restate the script invocations.

Pitfalls:

- P1 The door-reset child runs up to DOOR_RESET_TURN_BOUND_MS plus confirm time (door-reset.ts:12-15, defaults 600s and 60s), long enough for the session to be stopped and another to reuse the pane id; because the child pins the session name and re-checks the harness session binding before sending (door-reset.ts:114-120), a stopped session surfaces as read failures in the log, never as a reset sent elsewhere. Keeping both bindings is what removes this; dropping the harness binding while adding the session pin would reopen it.
- P2 During the release window, new prose with old installed scripts means A skips the wait chain while the old peer-ask does not wait for idle, so prompts go to working peers and fail as stalled. Removed by: scripts and prose shipping in the same release switch (F6), since both live in skills/chart-issues in this repo.

### F5 · Code shape and sequencing against session-routing

Question: one shared helper or four edited call sites, peer-local code or an import from src/shell.ts, and does this work wait for the sibling leaf?

- O1 One peer-local resolution module under skills/chart-issues/scripts/, imported by all five scripts, owning session list parsing, pane-to-session lookup with F3's rules, and the `--session` prefix. Each script keeps its own spawn and error semantics. The leaf is blocked by session-routing for the multi-session fake.
- O2 Import the resolver and argv builder from src/shell.ts that session-routing delivers.
- O3 Edit each of the four spawn helpers in place, no new module.
- O4 Do this chart before session-routing lands, extending the fake here.

Pick: O1. Reason: the sibling resolver answers repo-to-session by workspace label, which is F1 O3 and the wrong question here; only its fake and possibly its session-list shape are reusable. The five peer scripts today import nothing from src/, they run from the installed release, and their error contracts are verbatim-stderr shaped (peer-wait.ts:286-289 passes herdr stderr through and exits with herdr's code; peer-restart.ts:74-76 failureText prints full argv), while src/shell.ts herdr() at :202 is async and file-captured with different failure shapes. The peer folder already has the shared-module pattern (peer-restart exports run, failureText, agentName; peer-wait exports readPeerAgent), so one more shared helper follows the repo's own shape. Blocking on session-routing costs ordering only: without its multi-session fake, the wrong-session cases that are this chart's whole point cannot be proven. Cost: the session-list JSON schema is parsed in two places in the repo (src/shell.ts after session-routing, and the peer helper), a small duplication the plan can collapse if session-routing happens to export a clean session-list reader; and the chart waits for a leaf in another chart's handoff.

Rejected:

- O2: function mismatch above, plus it couples the door's consultant machinery to src/ refactors made for leaf dispatch. The executable parameter session-routing adds exists for watch-issues' OBSERVE_HERDR seam (watch-session design); the peer scripts' test seam is the PATH shim, so that parameter buys them nothing. Note direct-guards.ts:3-6 in the same folder does import src/, so the import would work mechanically in both checkout and release layouts; it is rejected on fit, not feasibility.
- O3: four spawn sites with the prefix added four times is how one site gets missed; peer-ask alone has two herdr spawns with different shapes (:36, :49), and a missed site fails silently because the call still works in the common single-session-feeling case.
- O4: duplicates the fake's session work that session-routing already owns (its brief names tests/fake-herdr.ts gaining `--session`, per-session stores, session list), so two leaves would reshape the same test file and collide.

Evidence: practitioner tier, surfaces above; session-routing brief and design (owned surfaces, argv builder with executable parameter, fake extension) and watch-session design (resolver consumed through OBSERVE_HERDR) under issues/open/herdr-session/, read 2026-10-24.

Pitfalls:

- P1 A future sixth peer script spawns bare `herdr` and reopens the hole. Removed by: the leaf proving, by grep over skills/chart-issues/scripts/, that every herdr spawn takes the helper's prefix, the same discipline the sibling applies to raw bypasses in src/ (call-coverage Taken).
- P2 The fake after session-routing defaults to one running session (session-routing design: today's defaults preserved), so existing peer tests keep passing without proving anything new. Removed by: new tests per script that seed the same pane id in two sessions and assert from the recorded calls that the non-target session received no prompt, start, split, or process-info call, and for peer-restart that the kill target came from the pinned session's process-info.

### F6 · Proof shape and rollout, given these scripts run the door itself

Question: the scripts being changed are the ones carrying this exchange, they run from the installed release, and a leaf seat cannot run them against live consultants. What proves the leaf, and what proves the release?

- O1 Fake-based tests per script at the CLI boundary as in F5 P2, plus one real door or operator smoke after install, using throwaway panes in two sessions with the socket deliberately pointed at the wrong one, showing the prompt and wait land in the pane's own session and the other session gets nothing.
- O2 Fake-based tests only, relying on sibling proofs P1-P7 for all real behaviour.
- O3 Leaf seat proves against real panes during implementation.

Pick: O1, with the real smoke as a door step after the release switch, not leaf-seat work. Reason: P1-P7 prove herdr 0.9.1 routes these verbs by `--session`, but they do not prove the new scan-and-pin logic inside these five scripts, and the failure class only exists live. The fake proves the logic, including duplicate and unreadable refusals that are impractical to stage live because the server assigns pane ids; one live smoke proves the installed artefact, the env it actually inherits, and the prose A types, which the fake cannot see. Cost: the smoke needs a grant shaped like the sibling's, covering throwaway panes and one short model turn in a named session, and it happens after merge, so a failure there is a repair, not a blocked leaf.

Rejected:

- O2: leaves the installed-script path unproven, and the installed path is the only one the door ever runs (skill folder resolves into ~/.akrogon/current). The repo has a lesson for exactly this shape of error: citing stale lines because the checkout and the live copy differed (learnings/LESSONS.md, 2026-09-27).
- O3: a real peer-restart proof kills a process group and a real peer-ask proof prompts an agent; run by a leaf seat against consultant panes it would destroy the very exchange reviewing it. The sibling chart already settled this division: grants name the door as principal and leaf seats make no real herdr call (session-routing readiness.yaml).

Evidence: operator tier, sibling grant and proofs 2026-10-24. Practitioner tier, live layout read 2026-10-24 (~/.claude/skills/chart-issues symlinks into the release). Practitioner tier, LESSONS.md entries dated 2026-09-10 (review by reading missed defects that running the code found) and 2026-10-01 (explanatory prose assertions couple tests to wording; prefer refusal, reason and side-effect assertions), which together argue for recorded-call side-effect assertions plus one real run, and against wording assertions on the new refusal text.

Pitfalls:

- P1 Outcome lines printed by the old release are rerun by A as peer-wait calls after the switch. Removed by: F4 O1 keeping the exchange schema unchanged, so old lines parse under the new script.
- P2 A chart open during the switch has seats.yaml written by the old door and read by the new one. Removed by: F1 and F4 keeping seats.yaml unchanged.
- P3 The refusal message wording gets asserted in tests and then blocks later edits. Removed by: asserting exit code, the sessions named, and the absence of calls to the wrong session, per the 2026-10-01 lesson.

## Fog

- FG1 Whether a named consultant may ever deliberately live in a different herdr session from A. This gates F2: if yes, F2 falls to O2 and F1 P2 stays open as a named limit. Operator territory; no surface in the repo describes such a layout, and peer-create cannot produce one.
- FG2 How a session-resolution refusal classifies under autopilot: drop that consultant like a prompt refusal, or end A's turn. SKILL.md:141 lists drop causes (failure, blocked, prompt refusal, restart not restarted, repeated unproven budget) and a resolution refusal is none of them; questions.md:46 says other non-zero script exits alone do not identify a consultant to drop, but a per-peer resolution refusal does identify one. Needs one sentence in this chart, whichever way it goes.
- FG3 Whether anything invokes these scripts from outside a pane shell in A's own session (cron, a background job, a watcher). INTAKE.md's stale-socket scenario came from a background `akrogon next`; for the peer scripts I found only door-typed invocations in SKILL.md and questions.md plus door-reset's detached child. If a non-pane caller exists, F2's anchor-by-caller-pane needs rethinking for peer-ask and peer-wait.
- FG4 The real duplicate-pane-id rate over time. One live sample showed 0 of 55, but a new session's first panes get sequential ids (w1:p1 seen 2026-10-24), so the refusal cost of F1 depends on how often the operator starts sessions. If duplicates turn out common, F1 O2 deserves a second look despite its costs.
- FG5 The final shape of session-routing's builder and fake (function names, sync usability, whether a session-list reader is exported from src/shell.ts). F5's pick does not depend on it, but the plan cannot write its tests until the fake's session fixtures have names.
- FG6 Whether `herdr --session <stopped> pane list` returns the same structured server_not_running as P3 proved for workspace list. Under F3 the scan never calls a session listed stopped, so this only matters for a session that stops between the session list and the pane list; the code path treats that error as stopped either way if it matches on the error code, but the match itself is unproven on this verb.
- FG7 Whether peer-create's A pane is guaranteed to hold an agent at call time in every door flow, or can be a bare shell pane when the door runs one step removed. Resolution by pane list (F3) makes the answer not matter; an agent-list-only design would need it.

## Human-only prerequisites and external operations

- H1 Operator answer needed before handoff: FG1 (co-location) and the F4 sub-fork (moving the idle wait into peer-ask changes door timing and rerun behaviour). Both change what a leaf can be told to build.
- H2 A real proof call needs a grant before it can happen, shaped like the sibling's (principal: chart door seat A; targets: two named herdr sessions; fixtures: throwaway panes and one short model turn; cleanup and absence check named). It should cover, with HERDR_SOCKET_PATH pointed at the wrong session: peer-ask prompts only the pane in its own session; peer-restart's process-info and kill touch only a throwaway agent there; door-reset is already identity-bound, so its proof is only that it still queues and completes under a wrong socket. Duplicate-refusal and unreadable-session cases cannot be staged against real herdr without stopping a real session, so those stay fake-proven; that limit should be recorded, not worked around by stopping an operator session. This call cannot run before the release exists, so it belongs to the door after install, and the leaf's readiness should record the sibling P1-P7 proofs as its inherited evidence rather than claim this one.
- H3 No credentials, accounts, or paid launches beyond the H2 smoke's short turn. The install or self-update step that switches ~/.akrogon/current is existing operator machinery, not leaf work, but the handoff should name that nothing changes for the door until it runs.

Most important for A: F1 resolves by pane lookup, pinned per invocation, with no argv, seats.yaml, or exchange change; F2's co-location anchor is the one pick that needs the operator before it can stand; everything else follows the sibling locks and waits on session-routing's fake.
