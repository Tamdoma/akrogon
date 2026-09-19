# Intake: noninteractive-leaf-execution

## Scope
A dispatched seat never waits for a human. A required seat that reports `blocked` ends its attempt as a reason-bearing visible failure on that event, the operator is notified through a push channel, and merged leaves carry no live busy state. Groups #19 and #20 items 3, 4, 6, 7. Items 1 and 5 of #20 are charted at `../execution-readiness/`. Item 2 is #18, shipped in c9e31af and c8dac2a.

## Provenance
- GitHub: Tamdoma/akrogon#19
- GitHub: Tamdoma/akrogon#20
- GitHub: Tamdoma/akrogon#21
- Operator: 2026-09-19 message "2 new issues. Big problem, halted my entire night. Let's find an elegant and beautiful solution by following our principles"

## Source: Tamdoma/akrogon#19
# A leaf blocked on a request_user_input question stalls silently for hours; missing human prerequisites should fail fast and notify

Source: Tamdoma/akrogon#19
URL: https://github.com/Tamdoma/akrogon/issues/19

Unverified intake.

## Observation
The setup-command leaf (repo boulevard-automation, harness pi, seat B, pane w4:pA) hit a missing GHL token scope during `implement` at 2026-09-18T22:46Z. The seat called `request_user_input` asking the operator to add the scope, committed its partial work, and ended its turn. The pane reported `blocked` from then on. akrogon kept the leaf at `implement` with `busy_since` for seat B for over 7 hours (status showed `busy B 7h00m`). The only notification path is `herdr notification show "Busy leaf ..."` after STALL_MS (60 min), which the operator did not see overnight; no distinction is made between a working seat and a seat blocked on a question. An external watchdog (Claude cron in the charting tab) found it by reading the pane. `herdr agent prompt` rejects a blocked pane with `agent_blocked`, so the only way to answer was `herdr pane run` with a reply line in the request_user_input grammar.

Second observation from the same night, same root: the chart-issues preflight requires human prerequisites to be recorded and complete, but nothing in the skill requires proving external write permissions (GHL token scopes) with a reversible probe; the chart probed GHL with GET calls only, so the missing `locations/customFields.write` scope reached implement instead of being caught before handoff.

## Location
akrogon `next` busy/stall handling (src/next.ts, STALL_MS and `busy` notification), herdr `blocked` state from the pi `request_user_input` extension (~/.pi/agent/extensions/tamdoma-request-user-input), skills implement-issue (behavior on a missing human prerequisite) and chart-issues (preflight, prerequisites). Consumer leaf: boulevard-automation issues/open/boulevard-ghl-sync/client-setup/setup-command.

## Reproduction
Hand off a leaf whose implementation needs an external permission the operator has not granted. Dispatch with pi seats. The seat asks via request_user_input and ends its turn; the pane turns `blocked`; akrogon shows the leaf busy indefinitely. Observed once, 2026-09-18/19, one full night lost.

## Expected behavior
Not provided in detail by the operator. Observed needs: a seat that hits a missing human prerequisite should move the leaf to a visible waiting state (failed or a parked/needs-operator marker) with the exact operator step recorded, and the notification should reach the operator (push, not only the herdr notification list); `akrogon status` should show `blocked` distinctly from `busy`; chart-issues preflight should require a reversible write probe for every external write a leaf performs and record proven scopes in the chart.

## Urgency
High for unattended runs: one blocked seat stops the whole dependency chain for the night. Workaround: an external watchdog reading panes every 20 minutes, and answering the pending question with `herdr pane run <pane> "<reply>"`.

## Source: Tamdoma/akrogon#20
# Overnight run 2026-09-18/19 on boulevard-automation: every stall, in order, with evidence

Source: Tamdoma/akrogon#20
URL: https://github.com/Tamdoma/akrogon/issues/20

Unverified intake.

## Observation
Consolidated report of one unattended overnight akrogon run (repo boulevard-automation, epic boulevard-ghl-sync, nine leaves, harness pi on both slots, herdr workspace w4). The operator lost the night; two leaves merged, one stalled 7 hours. Related earlier reports: #18 (debate artifacts in worktree), #19 (blocked seat stalls silently). Events in order:

1. First `akrogon next` on a fresh repo failed for every eligible leaf with `fatal: invalid reference: origin/main` (worktree add from `origin/main`). The repo had an origin remote but zero commits and nothing pushed. Full error: `{"command":["git","worktree","add","-b","worker-scaffold",".../issues/worktrees/worker-scaffold","origin/main"],"code":128,"stderr":"fatal: invalid reference: origin/main"}`. Resolved by a manual first commit and push. Nothing in handoff or `akrogon status` warned that the remote branch was missing.

2. worker-scaffold (debate: yes) completed plan.positions and plan.rebuttal, but `akrogon next` then refused synthesis: `Debate leaf skipped its debate: worker-scaffold; set phase: plan.positions`. Both seats had written positions-A/B.md and rebuttal-A/B.md into the worktree's copy of the leaf folder and committed them on the branch (10aa033, bc82e28, f067a1c, 2da051f); `akrogon phase` accepted those transitions with `issues/` diffs (history rows show `diff: 2 files changed` and `4 files changed`). The authoritative `issues/open/.../worker-scaffold/` held only brief, design, state. Seats idle, no busy_since, no dispatch, no notification. Manually copied the four files to the authoritative folder and ran `akrogon next worker-scaffold`. Filed as #18. The seat later self-repaired plan.md with commit 716a9df "move issue artifacts to registered checkout"; leaf merged 22:13Z as 72cc469.

3. setup-command seat B (pane w4:pA, pi session `.../issues/worktrees/setup-command--/2026-09-18T22-13-56-129Z_01a0b695-5921-71a0-95ef-cdc30397b7e0.jsonl`) hit a GHL permission error at ~22:46Z during implement (token lacked `locations/customFields.write`). It called `request_user_input` asking the operator to add scopes, committed partial work, and ended its turn. herdr showed the pane `blocked` (`screen_detection_skip_reason: full_lifecycle_hook_authority`, pi extension tamdoma-request-user-input). akrogon showed the leaf at `implement`, `busy B`, for 7h00m until 05:48Z. The only alert path is `herdr notification show "Busy leaf ..."` after 60 minutes; the operator did not see it. `akrogon status` does not show blocked distinctly from busy. Filed as #19.

4. Answering the blocked seat: `herdr agent prompt w4:pA "<text>"` returned `agent_blocked`; `herdr agent send-keys` accepts key names only (`unsupported key ...`); `herdr agent read --lines N` returned `agent_not_idle` while blocked. What worked: `herdr agent read --source visible` to see the question and `herdr pane run w4:pA "1: <reply>"` to type the reply in the request_user_input grammar. The seat resumed (`busy B` reset, attempts B=2).

5. The scope the seat asked for was partly real: `locations/customFields.write` was missing, `calendars.write` and `calendars/events.write` were already granted. A reversible probe (POST custom field 201 then DELETE, POST calendar 201 then DELETE) confirmed all three work after the operator added the one scope. The chart-issues pass that handed off this epic probed GHL with GET calls only, so no write scope was proven before handoff, and the chart recorded the operator's "I added the permission" without verification.

6. Merged leaves keep a stale busy marker: booking-prototype (merged 21:55Z) and worker-scaffold (merged 22:11Z) showed `busy A 7h50m` and `busy A 7h35m` at 05:50Z in `akrogon status`, with their panes and tabs long closed. Harmless for dispatch, but it makes the board read as if seats are alive.

7. Operator rule stated 2026-09-19, verbatim: "it shouldn't be asking me questions anyways. No questions after chart-issues".

An external watchdog (a cron in the charting Claude session running `akrogon status`, `herdr agent list`, `herdr tab list`, `herdr pane read` on the dispatcher tab, `git worktree list`, diffed every 20 minutes) was the only thing that surfaced items 2 to 6; its log is in that session's scratchpad `watchdog/history.md`.

## Location
akrogon: `next` (worktree creation from `origin/main`, debate eligibility check in src/next.ts around lines 482-487, STALL_MS busy notification around lines 172-203, busy marker after merge), `phase` (src/phase.ts `requireCodeOnly` only at check.review), `status` (no blocked state). Skills: chart-issues (preflight, prerequisites, probing), plan-issue and implement-issue (pass artifact location, asking the operator). Pi extension: ~/.pi/agent/extensions/tamdoma-request-user-input (global "ask whenever you need a decision" policy) and herdr-agent-state.ts (`herdr:blocked`). herdr: `agent prompt` on blocked panes, `agent send-keys` text. Consumer: boulevard-automation, issues/open/boulevard-ghl-sync, worktrees issues/worktrees/{worker-scaffold,booking-prototype,setup-command}.

## Reproduction
1: run `akrogon next` in a registered repo with an origin remote and no pushed default branch. 2: hand off a `debate: 'yes'` leaf, dispatch pi seats, let positions and rebuttal complete from the worktree cwd, run `akrogon next <slug>`. 3 and 4: hand off a leaf whose implement needs an external permission not yet granted, dispatch a pi seat with tamdoma-request-user-input enabled, wait past 60 minutes, then try `herdr agent prompt` on the pane. 5: chart an integration whose leaves perform external writes, probe only with GETs, hand off. 6: let a leaf reach `merged` and read `akrogon status` hours later. Each observed once, 2026-09-18 21:30Z to 2026-09-19 06:00Z.

## Expected behavior
From the operator: no skill after chart-issues asks the operator anything; a seat that needs a human should end its pass visibly with the required step written down. For the rest, not provided beyond: a fresh repo should be refused or bootstrapped with a clear message before dispatch; a completed debate should not be reported as skipped; a blocked seat should be visible in `akrogon status` and reach the operator overnight; merged leaves should not show busy seats; chart preflight should prove every external write the leaves need.

## Urgency
High for unattended runs: items 2 and 3 each stop the whole dependency chain until a human intervenes, and the notifications in place did not reach the operator. Workarounds used: manual first commit and push; copying debate files to the authoritative folder and `akrogon next <slug>`; a 20-minute external watchdog; `herdr pane run <pane> "1: <reply>"` to answer a blocked request_user_input; a reversible write probe script (scripts/probe-ghl-scopes.ts in boulevard-automation) to prove scopes.

## Source: Tamdoma/akrogon#21
# herdr reports a pi seat as blocked while it is running a subagent, indistinguishable from a pending operator question

Source: Tamdoma/akrogon#21
URL: https://github.com/Tamdoma/akrogon/issues/21

Unverified intake.

## Observation
On 2026-09-19 at about 06:50Z, appointment-mirror seat B (repo boulevard-automation, pane w4:pE, harness pi) showed `agent_status: blocked` in `herdr agent list` and `herdr tab list`. The screen (`herdr agent read w4:pE --source visible`) showed active work: live GHL probes on the test contact and the footer "Parent — Working · action: subagent · task: imp · 3m/31s", "Sam Working · child $0.003 · active 0s ago". No question or approval dialog was open. `herdr agent explain w4:pE` reported `state: blocked`, `screen_detection_skip_reason: full_lifecycle_hook_authority`. The tamdoma-subagents extension emits `herdr:blocked` while a subagent runs (~/.pi/agent/extensions/tamdoma-subagents/index.ts around lines 116-119); the tamdoma-request-user-input extension emits the same event for a pending question (index.ts around lines 827-828); herdr-agent-state.ts folds both into one `blocked` state. Overnight on the same run, a genuine question-blocked seat (setup-command, see #19, #20) looked identical from the outside.

## Location
herdr lifecycle state for pi seats: ~/.pi/agent/extensions/herdr-agent-state.ts (`herdr:blocked` handler), tamdoma-subagents, tamdoma-request-user-input. Consumers: `akrogon status`, `herdr agent list`, any watchdog reading pane state.

## Reproduction
Dispatch a pi seat with tamdoma-subagents enabled, let it delegate a task to a subagent, then run `herdr agent list` or `herdr agent get <pane>` while the child is running. Observed once, 2026-09-19.

## Expected behavior
Not provided by the operator. Observed need: a seat running a subagent should read as working; `blocked` should mean only that a human input is required, so an operator or watchdog can act on it without reading the screen.

## Urgency
Medium: it causes false alarms and hides real blocks among false ones in unattended runs. Workaround: read the visible screen and look for a question card or "action: subagent" in the footer.

## Agent findings
See `slots/map-merged.md` for the attributed A/B map. Key inspected facts: `blocked` counts as busy (src/next.ts:169-173); the blocked event reaches dispatch (src/next.ts:604-607) but nothing ends the attempt; `implement -> failed` is not a legal move (src/routing.ts:26-38); merged keeps busy_since (src/phase.ts:26-41) and next skips merged leaves (src/next.ts:468-477); all alerts are `herdr notification show` (src/next.ts:199, 477); the pi extension policy asks globally (~/.pi/agent/extensions/tamdoma-request-user-input/README.md "Default interaction policy"); skills/implement-issue/SKILL.md:39 tells the seat to wait. Operator-placed evidence: the boulevard watchdog history (blocked w4:pA, merged leaves with busy markers).

#21 (added 2026-09-19 before handoff): tamdoma-subagents emits `herdr:blocked` on a child-to-parent question and on an admission fault (~/.pi/agent/extensions/tamdoma-subagents/index.ts:115-120); the request-user-input extension emits it for a human question; herdr-agent-state.ts:207 folds all three into `blocked`. So `blocked` on a pi seat does not mean a human is needed.
