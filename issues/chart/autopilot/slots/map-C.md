# Territory map C: autopilot mode for the charting door

Scope as corrected by the operator: autopilot covers only `chart-issues` deciding at the points where the operator would answer, picking the best option rather than always the recommended one, then handing off. The watcher (`skills/watch-issues/SKILL.md`, tab `watch-akrogon`) is opened and run by the operator and takes over after handoff. It is not redesigned here. Consultants are named by the operator per session. Attended stays the default.

## History: what failed before, and why

- H1 Pre-rewrite factory (Jul–Sep 2026, carried into this repo at `00dc46e` as `new-beginning/skills-jul20|jul28` and `reference/`). The overnight system acted on weak signals and paid for it repeatedly: prompt delivery parsed rendered pane text and broke three times in one day (`learnings/history/2026-09-05-screen-scraped-delivery.md`); a watchdog cleaned panes on unproven state and could race a starting lane (`2026-09-05-watchdog-cleanup-evidence.md`); queue ordering preempted work that already owned a seat (`2026-09-05-queue-order-preempted-active-work.md`); ambient discovered skills overrode the dispatched task (`2026-09-05-ambient-skills-overrode-dispatch.md`). The 2026-09-06 review records that autonomous machinery-fault repair stayed "design discussion only", procedural holds could sit unresolved indefinitely, and heartbeat attribution was shared across sibling seats (`learnings/history/2026-09-06-factory-reliability.md`, sections "In progress" and L1/L5). Mechanism: automation acted without positive evidence, and stops had no next owner.
- H2 Seat-stall detection, 2026-09-18. The operator foreclosed hidden watchdogs, clocks and polling, foreclosing a systemd user timer by name, and accepted that a stall made of pure silence stays invisible (`issues/chart/seat-stall-detection/CHART.md:15`, `forks/no-akrogon-detector.md` Taken). Any autopilot that needs a new timer or daemon reopens a settled refusal.
- H3 The watch itself, 2026-09-19 to 2026-09-28. The operator first asked for "a replacement for me" that could "restart the failed leaf as many times as necessary" (`~/.claude/projects/-home-ivan-Work-infra-akrogon/6928d853-5894-43da-8100-de13a0f24c38.jsonl`, 2026-09-19). What shipped is bounded: recovery ends after two unproductive cycles, human-prerequisite failures are never recovered, and the watch never answers a seat or edits `issues/` (`skills/watch-issues/SKILL.md:40-41,51-53`). On 2026-09-28 the operator foreclosed the watch charting unattended (`issues/chart/failed-leaf-routing/forks/fix-routing.md:17`). Pattern: every "full replacement" ask was cut down to bounded, evidence-gated acts before it survived.
- H4 Leaf run stalls, 2026-10-01. Unattended nights were lost not to wrong decisions but to stops nobody owned: provider deaths needing hand-written remainder briefs, and a red done-criterion handed to review anyway (`issues/chart/leaf-run-stalls/INTAKE.md:4,50`, `CHART.md:4`). One blocked leaf held a six-leaf epic overnight.
- H5 Night flow, 2026-10-11. Taken: the watch is an informal operator habit and nothing may depend on it (`issues/chart/night-flow/forks/keep-running.md:31`, `CHART.md:14`). The same chart found no pass is guaranteed once agent events stop. Autopilot therefore cannot quietly make the watcher a required part, even though the operator now says he will run it.
- H6 The autopilot night itself, 2026-10-16 (operator tier, `issues/chart/sources/autopilot-night-2026-10-16.md`). It worked: temp-release and state-cutover charted, decided and landed with no steps skipped. Recorded friction: B and C read different base commits and disagreed on what was delivered; B's reviews kept finding rollout-safety gaps A's first shapes skipped, at about 5 minutes per round (state-cutover took 4 repair rounds); A's own watch loop read a leaf leaving `akrogon status` as merged and was right by luck; 22 leaked test shells sat alive since 2026-10-13. Measured base rate: of 582 answered questions (2026-09-16 to 2026-10-16) the operator took the recommended option in 89%, another listed option in 2%, and wrote his own answer in 9%, pushing toward do-it-now, the user-facing optimum, tighter time targets, a stronger model floor, and work owned by the right repo. "Always take the recommendation" would lose exactly that 9%.

Synthesis: past failures were rarely "the agent picked the wrong option". They were acting on unproven state, unbounded retry, stops with no owner, hidden processes nobody could see or stop, and self-judgment with no independent check. An autopilot that avoids those five is a different thing from the attempts that failed. One that reintroduces any of them repeats H1 to H5.

## Material forks

### D1 · Where the mode lives, and how it turns off
- O1 Per-session delegation: the operator states it at chart open, recorded verbatim in the chart, expiring with the session. This is what already happened on 2026-10-16 (`issues/chart/temp-release/forks/release.md:41`).
- O2 A persistent config key (repo or global config, `src/config.ts:25-64`). Later cost: a forgotten key makes autopilot the effective default, which the operator ruled out, and a later reader cannot tell who turned it on or why.
- O3 A command-owned switch like `paused.yaml` (`src/pause.ts:20-65`). Clean and checkable, but builds code before the mode has a track record, and any file switch can in principle be flipped by an agent.
Pick O1. It cannot be left on by accident, needs no code, and keeps provenance in the chart. Cost: the operator restates it each session, and enforcement is skill prose, not a gate. Any operator message in the door pane ends it from that point, recorded in the chart.

### D2 · Which decision points the delegation may take
- O1 All of them: rounds, handoff review, route, debate, seats.
- O2 Rounds and handoff, with a named exclusion list that always holds the chart for the operator: live-change grants (`skills/chart-issues/SKILL.md:61`), the needs sheet and outside-account keys (`SKILL.md:59`), human-only prerequisites (`SKILL.md:59`), destination choice for an unregistered repo, and any fork that widens scope beyond the intake the operator named.
- O3 Rounds only. Handoff review still waits for the operator. Safest, but leaves sit unstarted overnight, which removes most of the point.
Pick O2. The excluded items are the irreversible or outside-world ones, and each already has a "hold" shape in the skill. Cost: some charts hold until morning. That is the intended stop line, not a defect.

### D3 · Direct route under autopilot
- O1 Allowed when eligible, as state-cutover ran on 2026-10-16. Selecting direct includes the door's push authority (`skills/chart-issues/SKILL.md:99`), so one agent decides, implements and pushes to the default branch with only B's review.
- O2 Lifecycle only under autopilot. Every autopilot chart goes through plan, implement, check and merge seats, and the watcher sees the same states as attended work.
Pick O2 for the first version. Direct worked once, with 5 B reviews hardening it. One success is not a rate. Cost: small settled jobs take the slow path overnight. Revisit only with a recorded run of autopilot lifecycle charts behind it.

### D4 · How "best, not recommended" is picked, and who can veto
- O1 A picks alone, using the operator values recorded in the source log (simplicity, function over form, delete rather than stack, speed, cost).
- O2 A picks, but a material fork where a named peer still disagrees after rebuttal holds the chart for the operator instead of being decided.
- O3 Majority of slots. Undefined when the operator names one peer or four, and two similar models can outvote a correct third.
Pick O2. Anthropic's long-running harness report (practitioner, below) found agents grade their own work generously and that a separate skeptical evaluator is what helps. H6 shows the same locally: B found real gaps in A's shapes. Cost: a held chart waits. Under O1 there is no check on the exact failure H6 measured.

### D5 · Minimum seats for autopilot
- O1 Requires at least B named, mirroring direct-route eligibility ("B is not named", `skills/chart-issues/SKILL.md:97`).
- O2 Single-slot autopilot allowed.
Pick O1. Without a peer, D4 has no veto and the round's author, recommender and decider are one agent. Cost: the operator must name panes each session, which he has already said he will do. A peer exchange that ends in failure or blocked outcome holds the chart. Autopilot never falls back to single-slot mid-chart.

### D6 · Stop conditions and session bound
- O1 Hold only the affected chart and move to the next, using the existing Drain movement rules. Hold triggers: peer disagreement (D4), remaining fog (`SKILL.md:55`), any D2 exclusion, a failed or declined proof, a fork outside the named intake, and a material fork whose best research is model-knowledge tier only (`assets/questions.md:42`).
- O2 Stop the whole pass at the first hold. Simpler to reason about, wastes the night on one stuck chart.
Pick O1. Session bound: autopilot works only on the intake the operator named at open. Seed import keeps today's rule (only when the door opens without a note or the note asks). Autopilot invents no new charts overnight. Cost: ready leaves may run out before morning. H4 and the overnight-recs chart both show that is a smaller loss than speculative work charted from unverified seeds.

### D7 · The handoff seam to the watcher
- O1 After each valid handoff, the door runs `akrogon next` for that repo's handed-off leaves, from the registered root, as A did on 2026-10-16. This is an autopilot-only exception to "the handoff runs no `akrogon next`" (`skills/chart-issues/SKILL.md:85`). The watcher then only does its existing job.
- O2 The door never dispatches. The watcher's Waiting rule starts leaves on its next tick (`skills/watch-issues/SKILL.md:36-39`). This makes the door depend on the watch existing, against H5's Taken, and if the watcher is not actually running (session loss, 7-day cron expiry, `SKILL.md:14`) leaves sit silently.
- O3 The door prompts the watcher pane at handoff. New coupling between two skills, and the watcher has no such input in its contract.
Pick O1, with two guards from the 2026-10-16 log: `next` runs per registered repo root for the handed-off leaves only, never a global `--all` from outside every repo (worktree-cleanup note, source log 02:50 entry: from outside it would have started blepsis `headless-default`, which the operator had not started), and the door's footer states that watcher takeover is per the operator's word, not verified. There is today no surface outside the watcher session that proves its cron job exists. Claiming otherwise would repeat H1's unproven-state failure.

### D8 · Record shape for the morning
- O1 Today's form only: each pick in the fork's Taken as `A on operator autopilot delegation` with the verbatim delegation and reason.
- O2 O1 plus one autopilot section in CHART.md: every decided point, the rejected options, peer agreement tags, anything held and why, and leaves started. One place, readable in minutes.
Pick O2. No new file type, no code. Cost: a few lines per chart. Without it, morning review means reading every fork, and a wrong direction is found after merge instead of before.

## Practitioner evidence

Questions a practitioner would ask here: who evaluates the decider, what is the stop rule, what does morning verification cost, which decisions cannot be undone, and what record survives session loss. Findings:

- Practitioner · Anthropic, "Harness design for long-running application development", anthropic.com/engineering/harness-design-long-running-apps, March 2026, fetched 2026-10-16 · agents "reliably skew positive when grading their own work"; a standalone evaluator tuned to be skeptical, calibrated with few-shot examples of the operator's preferences, is what made multi-hour autonomous runs work. This supports D4 and D5, and supports recording the operator's measured values (H6) as the calibration set rather than inventing them.
- Practitioner (repo citation, not re-fetched) · Daniel Vaughan, "The Overnight Agent Pattern", 2026-08-04, updated 2026-10-15, cited at `issues/chart/overnight-recs/slots/answer-D.md:32` · overnight work must pass a "sleeping test", verifiable in two minutes in the morning, and runs stall on ambiguous tasks and overlapping scope. Supports D6's fog-hold and D8.
- Practitioner · Marc Brooker (AWS), "Timeouts, retries, and backoff with jitter", AWS Builders' Library, checked 2026-10-16 · retry at one layer only, capped. Already embodied in the watcher's two-cycle bound. Autopilot adds no second retry layer at the door.
- Better-than-training (repo citation) · Claude Code docs, `CLAUDE_CODE_RETRY_WATCHDOG` retries capacity errors indefinitely "for unattended sessions" (`issues/chart/leaf-run-stalls/forks/provider-death.md:26`) · vendors accept long unattended waits on provider capacity. That is evidence about surviving outages, not about delegating decisions. It should not be read as support for O1 in D4.
- Nothing stronger found: I found no primary source from a named team that lets an agent replace the product owner in requirements decisions unattended at scale. Searches run: this repo's charts, learnings and transcripts, plus direct fetches of the Anthropic and AWS sources above. For the decision-delegation question itself, the strongest evidence available is the operator's own measured record (H6, operator tier) and one completed autopilot night. Anything beyond that in this map is model knowledge and is marked by relying on those two.

## Pitfalls over the work's lifetime

- R1 Mode left on, or on by habit, becoming the default the operator refused. Removed by D1: per-session delegation, no config, ends on any operator message.
- R2 Closed loop: A writes the round, writes the recommendation, and takes it. Removed by blind peer notes first (existing protocol), D4's disagreement hold, and picks recorded against the operator's measured values, including where the pick is not the recommendation.
- R3 Wrong direction merged before the operator ever sees the chart. The lifecycle checks defects, not direction. Partly removed by D2 exclusions and D8. Not fully removable while merges run unattended. This is the main accepted cost of the mode and should be stated to the operator as such.
- R4 Peers reading different base commits (H6). Removed by naming the commit to read in every peer brief under autopilot, and holding the fork when returns cite different bases.
- R5 Peer pane blocked, failed or replaced mid-chart, with no operator awake to be reported to. Removed by D5: hold the chart, never degrade to single-slot.
- R6 Compaction or session loss drops the delegation, or worse, a resumed session assumes it. Removed by recording the verbatim delegation in the chart at folder creation (alongside `seats.yaml`), since resume already runs from CHART.md (`skills/chart-issues/SKILL.md:5`).
- R7 Cost runaway: the door drains charts all night and usage is only totaled at handoff. Removed by D6's named-intake bound. No new metering.
- R8 Global dispatch starting other repos' leaves the operator never started. Removed by D7's per-repo rule.
- R9 Autopilot wording leaking into attended rounds, so silence starts to count as an answer. Removed by amending the lock narrowly: silence still never supplies an answer. Only a recorded delegation does, and only inside its session and bound.

## Existing locks this collides with

- L1 `skills/chart-issues/assets/questions.md:31` "Recommendations and silence cannot supply an operator answer." Direct collision. Needs the narrow amendment in R9, not removal.
- L2 `skills/chart-issues/SKILL.md:3` "Operator-invoked only" and `:10` "This is an attended door". Autopilot stays operator-invoked under D1, but "attended" needs a stated exception for the delegated session.
- L3 `skills/chart-issues/assets/questions.md:42` "Research never settles anything." Under autopilot, research plus peer agreement settles within the delegation. The tier order still applies, and D6 holds model-knowledge-only forks.
- L4 `skills/chart-issues/SKILL.md:85` handoff runs no `akrogon next`. D7 creates an autopilot-only exception. Attended flow unchanged.
- L5 `skills/watch-issues/SKILL.md:3` started and stopped only by the operator, `:51-53` never edit `issues/` or answer a seat. No collision if the seam stays at D7 O1. Any design where the watcher opens the door, or answers for a held chart, collides head-on. Also `issues/chart/failed-leaf-routing/forks/fix-routing.md:17` forecloses the watch charting unattended.
- L6 `issues/chart/seat-stall-detection/CHART.md:15` no hidden watchdogs, clocks or polling. Autopilot must need no new timer, daemon or polling loop. The door's existing foreground peer-wait is the only wait.
- L7 `issues/chart/night-flow/forks/keep-running.md:31` nothing depends on the watch. D7 O2 would break this. O1 does not.
- L8 `skills/learn-issues/SKILL.md:3` operator-invoked only. No collision, provided autopilot is scoped to chart-issues alone and does not become a general "agent may invoke operator doors" precedent. That scoping sentence belongs in the skill text.
- L9 Grants and needs rules, `skills/chart-issues/SKILL.md:59,61`: approval provenance and operator-created keys. D2 keeps these human. An autopilot pick must never be recorded as grant approval provenance.

## Fog

- G1 How the recorded operator values get corrected over time. Morning review will produce corrections ("you picked X, I would have picked Y"). No current surface owns that list: lessons hold mechanisms, forks hold one chart's reasons. Where corrections accumulate, and how a later door reads them, cannot be stated precisely yet.
- G2 Whether the door can verify the watcher is running before dispatching, without new machinery. CronList exists only inside the watcher session. A herdr pane listing proves a pane, not a cron job. This may dissolve into "state it unverified" (D7) or may need a watcher-side artifact. The watcher is out of scope for redesign, so the seam question is real but its options are not yet enumerable.
- G3 Session replacement mid-chart under autopilot: seats.yaml already appends on session change, but whether a replacement A inherits the delegation, and what it must re-read before its first pick, is unstated. Related to R6 but not settled by recording alone.
- G4 What counts as "material" for the D4 disagreement hold when peers disagree on wording or cost estimates rather than direction. Today materiality is the door's judgment in attended rounds. Under autopilot that judgment is the thing being delegated.

## Proposed split

One destination: akrogon skills. No `src/` code in the first version under D1.

- S1 One leaf (or direct item, attended, at the operator's choice): skill-text changes to `skills/chart-issues/SKILL.md` and `assets/questions.md` covering D1, D2, D4, D5, D6, D8, the L1 to L4 amendments, and the L8 scoping sentence. Done-criteria should be behavioral where possible: a chart run from a fixture intake under a recorded delegation decides, holds on peer disagreement, and refuses single-slot. Prose-only criteria would repeat the wording-test trap in `learnings/LESSONS.md` (2026-10-01 entry).
- S2 Same leaf or a small second leaf, same destination: the D7 seam text (per-repo `next` after handoff, unverified-takeover footer line) plus a guide line in `docs/guide/` so the attended default and the exception are both documented once. Independent of S1's decision rules and could land after.
- S3 Not a leaf: one attended trial. The operator runs one real chart under the new text while present but silent, then reviews the D8 record against what he would have picked. This measures the thing H6 can only suggest, before the mode is trusted overnight. Whether the trial is a leaf criterion or an operator step is a handoff question.

Off route: any code switch or config key (D1 O2/O3) until the prose mode has a track record; direct route under autopilot (D3 O1); watcher changes of any kind, including having it open the door or chart fix leaves for failed leaves (foreclosed 2026-09-28); seed auto-drain and ready-leaf buffers (considered and rejected in overnight-recs, D4 there); new timers, daemons or polling (L6); applying the delegation precedent to learn-issues or any other operator-invoked door (L8).

END map-C
