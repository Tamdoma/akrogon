# Intake: unattended-runs

## Scope

One chart consolidating three akrogon reports about unattended operation (operator away): the watch cannot confirm in-tab prompts (#135), run-check launches paid work for a leaf already in `failed` (#136), and a reboot resume burned seat attempts (#137). Destination repo: akrogon. Grouping into issues and leaves is decided at the map.

## Provenance

- GitHub: Tamdoma/akrogon#135
- GitHub: Tamdoma/akrogon#136
- GitHub: Tamdoma/akrogon#137
- GitHub: Tamdoma/akrogon#138 (added 2026-11-16T09:53Z by the operator)
- Operator: door session c-akrogon, 2026-11-16, switch-on message
- Operator: door session c-akrogon, 2026-11-16T09:53Z, changed list

## Source: Tamdoma/akrogon#135

# watch-issues cannot confirm prompts in agent tabs, so work stalls until the operator returns

Source: Tamdoma/akrogon#135
URL: https://github.com/Tamdoma/akrogon/issues/135

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

On 2026-11-15 in framework, agent tabs in hc session `infra` stopped on in-tab confirmation prompts and waited for the operator. These were a tool permission prompt asking to confirm an action and a seat's AskUserQuestion dialog. The `/watch-issues` agent was running the whole time, saw the work stall, and confirmed nothing. The operator had to come back and confirm one prompt by hand.

Related case the same day: chart row N11b ("yes 12" or "keep 10", which gates `ia-skill-revamp` through the readiness `file` input `issues/chart/ia-revamp/approvals/n11b.md`) went unanswered because the question scrolled away when the door reset its tab.

When the watch tried to act, Claude Code's auto-mode classifier denied it as "[Undermining Oversight]". Once it was an `hc keys` answer to a seat's AskUserQuestion, and once an `hc send` relaying an approval to the chart door.

Operator's position: "It's your job to confirm it if it's not that dangerous, to keep everything moving." Confirming these prompts belongs to the `/watch-issues` agent, not the operator.

## Location

`skills/watch-issues/SKILL.md`, installed at `~/.claude/skills/watch-issues`, which links to `~/.akrogon/releases/8532a1f786367d9e521e24567e7294d6660dd743/skills/watch-issues`. This is the operator-away watch over seats and chart doors.

## Reproduction

1. Run `/watch-issues` while the operator is away.
2. A seat or chart door tab shows a permission prompt or a question dialog.
3. Every tick reports or ignores it, and the tab waits until the operator returns.

Frequency: every in-tab confirmation prompt during a watch.

## Expected behavior

The watch detects a tab waiting on a confirmation prompt and confirms it when the action is not dangerous. The skill should define:
- what counts as dangerous (for example, destructive, outward-facing, or above a cost bound)
- which keys or message to send for each harness
- how the watch records that it confirmed

Dangerous prompts are left for the operator, with a notice.

## Urgency

Leaves and chart doors stall for the whole time the operator is away, which can be a full night. Workaround: the operator confirms by hand when they return.

## Suspected cause

Supported hypothesis: the skill's Never list includes "Answer a seat." (`SKILL.md:56`) and "Edit `state.yaml`, worktrees or `issues/`", and it has no rule for detecting or confirming in-tab prompts. So the watch has no allowed action. A contributing factor is that Claude Code's auto-mode classifier blocks an agent from answering another agent's prompt unless a permission rule allows the watch's `hc keys` and `hc send` calls.

Whose view: reporter and agent.

Files read: `~/.akrogon/releases/8532a1f78636…/skills/watch-issues/SKILL.md` (installed release copy, not the source checkout), `framework/issues/open/ia-revamp/ia-skill-revamp/readiness.yaml`, `framework/issues/open/ia-revamp/ia-skill-revamp/design.md:230,245`, `framework/issues/chart/ia-revamp/CHART.md:70`.

Not inspected: the akrogon source checkout's copy of the skill, how hc reports a terminal blocked on a prompt, and Claude Code permission settings.

Related reports: none found. Searched Tamdoma/akrogon, all states: the filing account's reports since 2026-11-13 (limit 30), and the query "watch-issues approval" (limit 10).

## Source: Tamdoma/akrogon#136

# run-check started 3 paid capture runs for a leaf already in phase failed, with no refusal

Source: Tamdoma/akrogon#136
URL: https://github.com/Tamdoma/akrogon/issues/136

Origin repo: Tamdoma/tamdoma-framework
Lesson history: akrogon learnings/history/2026-11-15-background-wait-fails-leaf.md

Unverified intake.

## Observation

On 2026-11-15, framework leaf `keyword-research-skill` was in implement with slot A. Seat A started a slow paid capture (`akrogon run-check --name capture-buffalo -- bun --env-file=<framework>/.env .claude/hooks/tests/fixtures/ia-spine/scripts/capture-phrases.ts --case buffalo`, about 150 s) as a background shell command and ended its turn to wait for it. The prompt was re-delivered twice, at 21:36:35 and 21:36:46 (framework `issues/timings.jsonl` 79183, 79186). At 21:36:56 the leaf moved `implement -> failed` with `failure: {cause: attempts, reason: "seat A ended 3 turns without reporting"}` (framework `issues/log.jsonl:6738`).

The seat did not see the move. Over the next 10 minutes it launched three more paid capture runs through `akrogon run-check` (capture-national, capture-ecommerce, capture-buffalo-2). Each started, and `timings.jsonl` 79197-79216 records each with `"phase":"failed"`. Together they cost about $2.20 of model usage and $0.18 of DataForSEO under the leaf grant. The leaf returned to `implement` at 21:48:46 (`log.jsonl:6740`, slot null).

## Location

`akrogon run-check` for a leaf-scoped run (`src/run-check.ts` `checkedRun`), together with the attempts move in `src/next.ts:509-515`.

## Reproduction

Steps as reported, seen once:
1. A seat runs a slow `akrogon run-check` command in the background and ends its turn.
2. The controller re-prompts it until `attempts` reaches 3 and moves the leaf to `failed`.
3. The seat runs further `akrogon run-check` commands for that leaf.

## Expected behavior

Not provided. The reporter's view: a covered paid launch for a leaf in `failed` should not start silently.

## Urgency

Paid model and API runs were spent while the leaf was failed, and nothing told the seat. Every run here stayed inside the leaf grant, so no bound was exceeded. Workaround: run slow commands in the foreground (implement-issue proof order item 3) so the turn does not end.

## Suspected cause

Supported hypothesis: `leafFields` (`src/run-check.ts:150-158`) copies `state.phase` into the run record, and `checkedRun` (`src/run-check.ts:264-300`) only writes it into the check fields. No check in that path refuses `phase: failed`. Contributing condition: the attempts move (`src/next.ts:509-515`) treats a turn that ends while a background run is in flight as a turn without a report.
Whose view: both (reporter observation, agent code read).
Files read: `/home/ivan/Work/infra/akrogon/src/run-check.ts` (development checkout, the `akrogon` repos entry), `/home/ivan/Work/infra/akrogon/src/next.ts`. The installed release is `~/.akrogon/releases/8532a1f786367d9e521e24567e7294d6660dd743`. It was not diffed against the checkout.
Not inspected or would disprove: other callers of `checkedRun`, and any phase guard inside `withAdmission` or `ownerRefusal` (not read).
Related reports: none found. Searched Tamdoma/akrogon, all states: `--author @me created:>=2026-11-13` (limit 30), `run-check failed phase` (limit 10), `turns without reporting` (limit 10). #85 and #82 concern moves to failed, not launches during failed.

## Source: Tamdoma/akrogon#137

# After a reboot, the listener started seat A of one leaf 3 times in 32 seconds and raised attempts from 1 to 4

Source: Tamdoma/akrogon#137
URL: https://github.com/Tamdoma/akrogon/issues/137

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

After a PC reboot on 2026-11-16, the akrogon listener's boot `next --resume` started seat A of framework leaf `competition-read-skill` (phase `implement`) three times in 32 seconds. Each start incremented `attempts.A`, so it went from 1 to 4.

- `journalctl --user -b -u akrogon-listener`: the pass processes 17802, 19659 and 21656 printed seat addresses `t1xs` (10:30:55 CET), `t1xt` (10:31:13) and `t1xv` (10:31:27).
- systemd: scope `akrogon-lf8dd86a9e8ec-fw-competition-read-skill-a-9a5649ce.scope` ended after 17.3 s wall (10:31:11), and `...-9568a1fd.scope` after 9.9 s (10:31:22). Neither has a `Stopping` line. Then `Removed slice Slice /akrogon/lf8dd86a9e8ec` at 10:31:25, and the slice was recreated at 10:31:26 for `t1xv`, which survives.
- The Claude transcripts of the two dead seats (`~/.claude/projects/-home-ivan--akrogon-worktrees-framework-competition-read-skill/3391c93c-2be8-425e-b04c-586dd2a92371.jsonl`, `034fb39b-fc24-4173-9d9f-51efb0867c82.jsonl`) end mid first turn on an `api-request` record with no exit message.
- Their hc terminals were removed, not left finished (`hc ls --all` no longer lists `t1xs`/`t1xt`).
- None of the three passes logged an error, and the listener logged no `pass failed` line for them.
- The leaf's `state.yaml` now shows `attempts: A: 4`, `seat.A: t1xv`.

Separate observation, not part of this report: at boot, the listener's first start crashed with `Executable not found in $PATH: "akrogon"` at `src/listen.ts:42`, and systemd restarted it 2 s later.

## Location

akrogon listener boot resume (`src/listen.ts`) → `next --resume` / `next --wake` → `dispatchSlot` (`src/next.ts`) → `startSeat` (`src/seat.ts`). Installed release `8532a1f786367d9e521e24567e7294d6660dd743`, hc session `infra`, repo `framework`.

## Reproduction

Seen once: reboot the host while a leaf is in `implement` with a live seat A, then let the listener start at login. Frequency: Not provided.

## Expected behavior

Not provided.

## Urgency

`src/next.ts:509` fails the leaf on its next silent stop once `attempts[slot] >= 3`. The reboot used up the leaf's whole re-prompt budget without a single real turn. Known workaround: the operator re-runs `akrogon phase <slug> implement` after the leaf fails.

## Suspected cause

No supported hypothesis. The seat restart itself is expected, because `next --resume` sweeps leaves that have a tab or worktree, and the reboot killed the old seat. Neither the triple start nor the attempts count is explained.
Whose view: agent.
Pattern consistent with the logs: something ended the first two seats from outside akrogon's passes (no pass error, no `systemctl stop`). Each `finished`/`lost` event then enqueued `next --wake` (`src/listen.ts`), whose `dispatchSlot` (`src/next.ts` ~437) ended the finished terminal and called `startSeat`. `startSeat` (`src/seat.ts` ~274) adds 1 to attempts on a confirmed first task, so a seat that never ran a turn still counts as an attempt. Candidates for what ended the seats: the herdr-app window restoring its layout at boot, or hc. Not confirmed.
Files read: installed copies under `~/.akrogon/releases/8532a1f786367d9e521e24567e7294d6660dd743/src/` (`listen.ts`, `next.ts` `nextCommand`/`dispatchSlot`, `seat.ts` `startSeat`/`place`, `reconcile.ts` seat teardown, `hc.ts end`). These are an installed release, not the destination source checkout.
Not inspected or would disprove: why the first two claude processes exited. No exit code survives because `end()` removes the terminal. Also not inspected: the herdr-app log for the boot window (no relevant lines found in `~/.local/state/herdrapp/infra.log`) and the hc core logs. The `place()` (`PANE_WAIT_MS` 15000) and cgroup-check paths in `startSeat` both `end()` and throw, but no thrown error was logged, which argues against them.
Related reports: none found (Tamdoma/akrogon, `--author @me created:>=2026-11-14` gave #135 and #136, both different; keyword searches "attempts resume" (all states, limit 10: #20, a different closed overnight-stall report) and "listener reboot seat" (none)).

## Source: Tamdoma/akrogon#138

# chart-issues door used its pre-restart hc address, so consultants were not stacked and their done reports went to a dead terminal

Source: Tamdoma/akrogon#138
URL: https://github.com/Tamdoma/akrogon/issues/138

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

On 2026-11-16 the framework chart door (chart-issues, ia-revamp re-chart) ran in terminal t1xr (`$HC_TERMINAL_ID`), but it used its old address t1tm, which it carried over from the summary written before its session restarted. t1tm is a finished terminal.

1. `herdr-consultant-column t1tm t1xz t1y0 t1y1` printed `herdr-consultant-column: door not in a tab`. Following chart-issues SKILL.md `## Open` (a "door not in a tab" exit is recorded once and the round continues), the door continued. The three new consultants stayed side by side in the tab instead of stacked in one column. The operator noticed it. Rerunning with `t1xr` laid them out correctly.
2. The consultant brief written in the same pass ended with the report step `hc send t1tm "done X: <path>"`, so every consultant's report goes to the finished terminal and never wakes the door.

## Location

chart-issues door: `skills/chart-issues/SKILL.md` `## Open` (column helper call, restart, "door not in a tab" rule) and `skills/chart-issues/assets/questions.md` `## Blind peer exchange` (Asking: the report step `hc send <door address> ...`). The column helper itself is `herdr-setup/bin/herdr-consultant-column` (another repo).

## Reproduction

A chart door session whose context was summarized and continued in a new terminal (new hc address). The summary records "Door A = hc t1tm". The door then starts consultants and builds a brief using the address from the summary. Seen once.

## Expected behavior

The door uses its live address (`$HC_TERMINAL_ID`) for the column helper and in every brief's report step. A "door not in a tab" result for an address that is not the door's own live terminal is not treated as the harmless "door is not in a tab" case.

## Urgency

Medium. The consultants work, but the operator sees a broken layout, and the door's `hc wait` gets no report messages. It only notices consultants through child status changes and return files. Workaround: rerun the helper with `$HC_TERMINAL_ID`, and collect returns by file.

## Suspected cause

Agent view. The skill names "the door's address" or "<door address>" in the column, restart and report-step rules, but never says where to read it. SKILL.md line 27 uses `HC_TERMINAL_ID` only to test that the door is inside hc. After compaction, the address in the summary and in seats.yaml (`seat: A, address: t1tm`) is stale, and nothing makes the door check it against `$HC_TERMINAL_ID`. Contributing: SKILL.md `## Open` turns any "door not in a tab" exit into a one-line log and continue, so a wrong door address looks the same as a door without a tab. herdr-consultant-column throws `ColumnError("door not in a tab")` when no tab holds the given terminal (herdr-setup issues/closed/herdr-app/consultant-weights/plan.md D3), so it cannot tell a dead address from a tabless live door.
Files read: installed release copy `~/.akrogon/releases/8532a1f786367d9e521e24567e7294d6660dd743/skills/chart-issues/SKILL.md` and `assets/questions.md` (installed copies, not the source checkout), and `herdr-setup/bin/herdr-consultant-column` plus its closed brief and plan.
Not inspected: the source checkout of chart-issues, and whether the handover rules (assets/handover.md) refresh the A address after compaction. Disproving evidence would be a rule there that already requires re-reading `$HC_TERMINAL_ID`.
Related reports: none found (Tamdoma/akrogon, states all, the account's reports since 2026-11-14 (#135-#137, different defects), and searches "consultant column", "door address stale", "HC_TERMINAL_ID", limit 8).

## Source: operator 2026-11-16 switch-on

3 issues pulled. Consolidate them and chart them out. Elegance and least complexity solutions first. Slot b consultant (codex default) and slot c consultant (pi default). Full autopilot mode, singposts autopilot, too.

## Source: operator 2026-11-16T09:53Z changed list

Another issue was filed, pull it up, and consolidate it here for the build. Still full autopilot mode.

## Agent findings

From the blind opening maps (slots/map-A.md, map-B.md, map-C.md), agreeing slots tagged.

- #136 (A,B,C): `leafTarget`/`leafFields` (src/run-check.ts) copy the leaf phase into the run record only; `checkedRun` checks ownership (`ownerRefusal`) and admission, never phase. The three paid captures started with `phase: failed` (framework timings, B: 21:41:23Z, 21:43:59Z, 21:46:38Z).
- #136 (B,C): `dispatchSlot` (src/next.ts) never reads `liveRuns` (src/admission.ts); the seat was re-prompted at 21:36:35Z and 21:36:46Z while capture-buffalo ran 21:36:32Z-21:39:09Z, and failed at 21:36:56Z.
- #137 (A,B,C): `startSeat` (src/seat.ts) adds 1 to attempts on a confirmed first task and `deliver` adds 1 per re-delivery; the fail move's reason claims silent turns. Three deliveries at 09:30:55Z, 09:31:13Z, 09:31:27Z (framework timings; journalctl --user -b). The killer of the first two seats is unknown; `end` (src/hc.ts) kills and removes the terminal, so no exit evidence survives (B,C).
- #137 (A,B,C): the boot PATH crash is separate (src/listen.ts spawns bare `akrogon`; the systemd unit uses an absolute path).
- #135 (A,B,C): hc reports `status.state: blocked` with `kind` permission, question or auth; the listener wakes `next --wake` on it, but `observeBusy` treats blocked like working and sends a quiet notice after 60 min, and the watch's observe/judge has no blocked branch. Its Never list says "Answer a seat".
- #135 (A,C): claude seats called `AskUserQuestion` in framework worktrees on 2026-11-15; the pi harness line already excludes its question tool, the claude line does not. Machine harness lines live in ~/.akrogon/config.yaml.
