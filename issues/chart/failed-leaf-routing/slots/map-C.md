# Map C: akrogon #33 and #34

Read 2026-09-28 against akrogon HEAD ccea397 and framework live state. Carries honoured: no time limit, no restart verb, no clock, watch-issues Never list unchanged by stuck-seat-recovery.

## #33 watch-issues idles on a failed leaf that names an owner

### Cause

- C1 The failed-leaf rules have two branches only. `skills/watch-issues/SKILL.md:38` "Failed on a human prerequisite" fires when the reason names a credential, permission, operator decision or external step, then notify-only. `:39` "Failed otherwise" re-runs the same phase. A reason that names an owning leaf and a concrete defect matches neither, and the reporter's reason said "must reopen first", which reads as an operator decision.
- C2 The watcher may not open work. `SKILL.md:53` Never: "Edit `state.yaml`, worktrees or `issues/`". A fix leaf is a new folder under `issues/open` plus a `blocked-by` edit on the failed leaf. Both are forbidden.
- C3 akrogon has no reopen verb. `src/phase.ts:186` `Merged is terminal`. `src/akrogon.ts:33-82` verbs are config, init, phase, next, pull, close, sync, park, unpark, status, install. `src/routing.ts:35-38` lets a failed leaf move to any working phase, so the failed leaf itself can be resumed, but a merged owner cannot.
- C4 The design line has no command. Framework `issues/open/satellite-network-simplify/satellite-route/live-replay/design.md:46` "The run fails, and the owning leaf reopens." Nothing in akrogon implements it.
- C5 The stop rule cannot fire. `SKILL.md:43-45` stops only when no leaf remains or every remaining leaf is failed on a human prerequisite with shown evidence. update-replay is blocked, not failed, so the cron ticks forever with nothing to do.
- C6 Recovery of the failed leaf alone does not help. The operator did exactly that by hand: framework `issues/log.jsonl` shows live-replay failed 03:56Z, resumed to implement 09:47Z, failed again 10:25Z on a second defect ("content-batch must strip provenance", `live-replay/state.yaml` failure.reason). Each live run finds the next upstream defect. Re-running without fixing the owner is the unproductive cycle that `SKILL.md:39` already counts.

### Live surfaces

- `skills/watch-issues/SKILL.md:38-39` (failed rules), `:43-45` (Stop), `:47-57` (Never).
- `src/phase.ts:176-250` `transition`: `:186` merged terminal, `:191` failed needs reason, `:204-210` any phase may fail with cause blocked, `:213` a blocked failure skips the clean-worktree check on resume.
- `src/routing.ts:35-38` failed → any working phase.
- `src/next.ts:529` a failed leaf is `waiting` and never dispatched.
- `skills/chart-issues` is the only door that creates leaves (`assets/shapes.md:160` state.yaml authoring rules).
- Framework live-replay leaf as the consumer case.

### Material forks

**F1. Who turns a blocker that names an owner into work?** Reshapes everything else.
- O1 The watcher routes it through chart-issues: on a failed leaf whose reason names an owning leaf, the tick invokes the chart door with the report as intake, the door opens a fix leaf under the same issue, and the watch treats the failed leaf as waiting on that fix. Requires the Never list to allow the chart door to write `issues/` on the watcher's behalf, which stuck-seat-recovery left unchanged but did not lock for other charts.
- O2 The watcher escalates once and stops: a failed leaf whose reason names an owning leaf gets one `herdr notification show` with the owning leaf and exact action, is counted as "needs you" for the Stop rule, and the watch stops when only such leaves and their dependents remain. No new verb, no `issues/` write.
- O3 An akrogon verb `akrogon reopen <slug>` that moves a merged leaf back to implement. Contradicts `phase.ts:186` and the merge guide, and a merged leaf's worktree and branch are gone (`next.ts:564-565` removes the worktree at cleanup).
- Recommendation: O2 now, O1 as the follow-up if the operator wants the watch to be a full replacement. Source: the operator's own quote in the intake ("reopen it yourself according to the plan") wants O1, but the chart-issues skill requires an operator interview for every chart (`skills/chart-issues/SKILL.md:47`, questions.md:40 "Research never settles anything"), so an unattended fix leaf would skip the door's own contract. O2 fixes the two observed defects, silence and the never-stopping cron, inside the watch skill alone. Pitfall for O1: a fix leaf opened by a watcher inherits the failed seat's diagnosis without review, and the second live-replay failure shows the diagnosis moves each run. Pitfall for O2: the epic still waits for a human, which the intake calls the problem.

**F2. Is "reopen the owning leaf" ever the right shape?**
- O1 Never reopen. A defect in merged work is a new leaf with its own review, blocked-by from the consumer leaf. Matches `phase.ts:186` and the per-leaf worktree lifecycle.
- O2 Add reopen. Needs worktree recreation, branch recovery, and a merged log record reversed.
- Recommendation: O1. Source: `src/next.ts:564-565` and `phase.ts:186`. The design line at framework design.md:46 should be reworded to "a fix leaf opens", which is a consumer-repo edit, not akrogon work. Pitfall: the epic's sibling folders must accept a new leaf after their own merge, which `SKILL.md:37` already handles.

**F3. Should the failed-leaf classifier read structure instead of words?**
- O1 Keep prose matching (`SKILL.md:38` word list) and add "names an owning leaf" as a third class.
- O2 Add a structured field to the failure record (`src/phase.ts:204-210`, `--owner <slug>`) so the watch reads a field, not a sentence.
- Recommendation: O2 if F1 picks O1, O1 if F1 picks O2. Source: `phase.ts:191` already forces `--reason`, so one more flag is the same door. Pitfall: seats must learn the flag, and old failure records lack it, so the prose rule stays as fallback.

### Practitioner questions and pitfalls

- P1 A watcher that opens work on its own is a supervisor writing to the plan. Erlang supervisors restart children, they never rewrite the supervision tree. Keep planning writes behind the door that has the interview.
- P2 The blocked dependent (update-replay) is the real cost. Any option must make the Stop rule count "dependents of a needs-you leaf" or the cron stays alive for nothing.
- P3 Do not add a tick counter or elapsed limit to detect "no change for N ticks". That is a clock by another name and the carry forbids it. The signal is the failure record itself, which is state.

### One destination or two

One destination for #33: "a failed leaf that names an owner is escalated once and lets the watch stop", with F1-O1 as a separate later chart if chosen. The framework design line fix is off route (consumer repo).

## #34 chart-issues consultant panes B and C layout

### Cause

- C7 The skill never creates panes. `skills/chart-issues/SKILL.md:23` "name the operator-supplied B pane, then the C pane". `assets/questions.md:44` "Named peer panes are supplied by the operator at chart open, not elected from config". Layout is whatever the operator had.
- C8 `herdr pane move` refuses same-tab moves (intake, `same_tab`). Installed CLI confirms `pane move` has `--tab`, `--split`, `--target-pane`, `--ratio`, `--new-tab`, no same-tab flag. So a wrong existing layout can only be fixed by the two-hop workaround.
- C9 The wanted layout is exactly two splits in order. Live proof, read-only: `herdr pane layout --current` on this tab shows A at x=0 width 64, B at x=64 y=0, C at x=64 y=19, splits `right` ratio 0.54 then `down` ratio 0.51 on the right pane. `herdr pane split <A> --direction right --ratio 0.5` then `herdr pane split <B> --direction down --ratio 0.5` produces it. `pane split` also takes `--cwd`, `--env`, `--no-focus`.

### Live surfaces

- `skills/chart-issues/SKILL.md:23` Open, `assets/questions.md:44` Blind peer exchange.
- herdr CLI: `pane split` (direction right|down, ratio, cwd, env, focus), `pane move` (tab, split, target-pane, ratio, new-tab, workspace), `pane resize`, `pane layout`, `tab create`. No same-tab move.
- `src/next.ts:280-330` `allocate` already does the same thing for seats: `tab create`, then `pane split … --direction right` twice, so the pattern and the herdr wrapper exist in akrogon.

### Material forks

**F4. Who creates B and C?**
- O1 The chart door creates them: at open, when the operator asks for peers, A runs the two splits with `--cwd <root> --no-focus`, starts the harness with `herdr agent start`, and names the panes itself. The operator supplies nothing.
- O2 The door keeps operator-supplied panes and documents the split order and ratios in the skill, so a human makes the layout right in two commands.
- O3 An akrogon verb `akrogon chart-panes` that lays out the tab like `allocate` does for seats.
- Recommendation: O1. Source: `next.ts:280-330` shows the split sequence works and is already wrapped. It removes the whole problem class: no operator layout, no `pane move`. Pitfall: the door must pick harness and model for B and C, which today come from the operator's own choice. Reuse the seat config from `akrogon config` (`src/config.ts:9-22` harness templates) or ask once at open. Pitfall: A must not split when B is already supplied, so "supplied pane" and "create pane" are two branches, not a flag.

**F5. Layout with B only.**
- O1 B takes the whole right half. Matches the intake's guess and needs one split.
- O2 Same three-pane layout with C empty. Wastes space.
- Recommendation: O1. Source: the intake, and `pane split` semantics.

### Practitioner pitfalls

- P4 Ratios are of the parent rect, so split A at 0.5 first, then the right pane at 0.5. Reversed order gives 25/75.
- P5 `pane split` launches a shell in the new pane. The harness start must follow, and `herdr agent start` needs a shell prompt (herdr skill `SKILL.md:120`).
- P6 Never `pane move` to repair. If the tab already has panes in the wrong place, close and re-split, or leave the operator's layout.

### One destination or two

One destination: "chart-issues opens its own peer panes in the fixed layout". Separate from #33. Low urgency, small leaf, no fork blocks it except F4.

## Searches that found nothing

- `reopen` in akrogon `src`, `skills`, `docs`: only the merge guide saying a broadcast failure does not reopen.
- A same-tab option on `herdr pane move --help`: none.
- A chart or seat config for peer panes in `src/config.ts`: none.
- A structured owner field in the failure schema (`src/phase.ts`, `shell.ts` failureSchema): none.
