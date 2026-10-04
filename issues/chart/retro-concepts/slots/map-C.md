# Map C: retro-concepts

Slot C, 2026-10-04. Sources read: both practitioner copies, INTAKE.md, the live surfaces named in map-prompt.md. No other slot map read.

## 1. What retro does

Retro is an operator-invoked, read-only review of one coding session. It reads the session's primary sources (the current window or the session log, source-retro-SKILL.md:13), looks for improvement candidates, and presents them by severity (:25). It changes nothing itself.

Its target is the agent's environment, not the code (source-retro-SKILL.md:7, source-ask-matt-SKILL.md:32). Core ideas:

- I1 Session evidence. Findings come from what the agent actually did in the log, not from memory (:13).
- I2 Seven lenses. Navigation, automated checks, coding standards, global steering file size, tool economy, no-op instructions, information access (:17-23). Each has a "use when" trigger.
- I3 Route by class. A mechanical mistake becomes a deterministic check. Only a judgement call becomes a written rule (:19). "Default to building the check over writing the rule."
- I4 Existing check first. Look for a check that exists but is unwired or broken before inventing one (:18).
- I5 Reviewer owns standards. The review agent has the least context pressure, so rules go to review, not implementation (:29-35).
- I6 Steering stays small. Always-loaded files hold navigation pointers only, and no-op instructions get removed (:22, :41).
- I7 Timing. Run after a build, most of all one that went badly, or after a bug fix to ask what would have prevented it (source-ask-matt-SKILL.md:32, :48).

## 2. Coverage in Akrogon and the gaps

| Idea | Akrogon today | Gap |
|---|---|---|
| I1 | `issues/log.jsonl` records every phase move with a `session` id (502 lines, all carry it). `log-tail.ts` parses claude, codex and pi logs but prints only the last 20 calls (log-tail.ts:486) and serves only the watch's busy-seat loop check (watch-issues/SKILL.md:40). Charts read session logs by hand when asked (leaf-run-stalls/CHART.md:8-10). | No whole-session read after merge. Only on operator request through a chart. |
| I2 navigation | `grounding.index` plus 40-line AREA.md files (init-akrogon/SKILL.md:58-60). Plan keeps a read-first list (plan-issue/SKILL.md:25). Check verifies AREA paths exist (check-issue/SKILL.md:41). | None worth a mechanism. |
| I2 checks | `checks`, `merge_checks`, `akrogon phase` guards (src/AREA.md:24). | Covered. |
| I2 tool economy | Charts did this on demand: akrogon-slow-phases/CHART.md:4 (80 s suite to 10 s), check-reruns/CHART.md:4, long-implement/CHART.md:4. | Covered on demand. |
| I2 information access | `.env` symlink rule, `akrogon status` Missing lines (skills/AREA.md:24), log-tail. | Covered on demand. |
| I3 | Lessons have one shape and two exits: "applied or pruned at chart open" (LESSONS.md:5). They are "observations, not rules" (LESSONS.md:3, plan-issue/SKILL.md:27). Nothing asks which lessons should become a check. | Real gap. See F1. |
| I4 | Not stated anywhere. | Small. Folds into F1. |
| I5 | Both check seats judge against plan, brief and design (check-issue/SKILL.md:39). Standing design reaches review through the leaf design (standing-design.md:20). LESSONS.md is not review input (check-issue/SKILL.md:45). | Covered. Akrogon made the same split a different way. |
| I6 | No AGENTS.md or CLAUDE.md in the repo. Lesson prune is offered at chart open (chart-issues/SKILL.md:29). | Skills total 17,513 words and have no prune. See F2. |
| I7 | Every phase seat may write a lesson (plan:39, implement:31, check:59, merge:35). Seeds carry bigger observations (learn.md:20-24). | Covered. Lessons are written in-session, which is retro's preferred timing (source-ask-matt-SKILL.md:36). |

Findings:

- F1 Lessons do not get routed. Evidence: LESSONS.md:10 says to confirm `git status --porcelain` is empty before a verdict. `src/phase.ts:270-271` already throws on a dirty worktree. The guard exists and the line is still active, so every plan and chart open keeps reading it. Several other active lines are mechanical by retro's test (LESSONS.md:9 unguarded stderr JSON parse, :17 `.min(1)` accepts blanks, :11 grep criterion against verbatim text). Today they wait for an operator to notice at prune time.
- F2 Skill prose has no no-op check. chart-issues, check-issue and implement-issue are 2,300 to 2,600 words each, loaded whole each pass. Nothing tests whether a sentence still changes behavior. This is retro's I6 applied to skills.
- F3 Akrogon already runs retros, under the name "chart". 26 past charts, several on stalls and slow phases, each with file:line evidence, three blind slots, and a handoff to leaves. That is a stronger retro than Pocock's single-agent list.
- F4 Session-log reading is half built. The parser handles three harness formats but only the tail.

## 3. Where a concept would help, and where it would not

Helps:

- S1 `skills/chart-issues/SKILL.md:29`, the lesson prune at open. Add retro's I3 and I4 as the prune's question: for each active line, say whether a guard already covers it (remove the line), whether a deterministic check could cover it (offer a seed), or whether it stays an observation. One sentence in an existing step. It fixes F1 and adds no file, phase or term.
- S2 `learnings/LESSONS.md:5`, the header rule. It already names "applied" as an exit. S1 only makes the door check for it.

Would duplicate or widen:

- S3 A `/retro` skill or a retro phase. It duplicates chart-issues (F3), adds a tenth skill, and breaks the repeated lock "no new phase, state field, clock or watchdog" (leaf-run-stalls/CHART.md:4).
- S4 A lesson class field (mechanical or judgement) on every line. It changes the one-line shape that four skills and `merge=union` depend on (init-akrogon/SKILL.md:77, lessons-merge-conflicts/CHART.md:7). Seats would classify at write time, when they know least about existing guards.
- S5 A whole-session mode for `log-tail.ts`. Useful only if someone reads it. The watch needs only the tail, and charts that needed more read the raw log successfully.
- S6 A `CODING_STANDARDS.md`. Standing design plus the leaf design already serve review.
- S7 Seven lenses as a checklist in merge-issue. Lifecycle seats "pause for nothing" (skills/AREA.md:23). A seven-item review per merge costs tokens on every leaf to find something on few.

## 4. Forks, practitioner questions, pitfalls

Forks for the operator:

- K1 Adopt anything? Options: a) nothing, b) S1 only, c) S1 plus a skill no-op prune (F2), d) new retro mechanism (S3).
  - a) costs nothing. Stale and mechanical lessons keep piling up until someone notices.
  - b) one sentence. Later risk: the door offers seeds the operator keeps declining, and the question becomes noise.
  - c) invites the door to propose rewording skills every open. Skills are verbatim contracts that tests and leaves cite, so a casual prune can break a locked rule (LESSONS.md:11 is this exact failure).
  - d) a second door that overlaps chart-issues. The operator must then choose between two doors for one job.
- K2 If S1: who routes? a) the door at open, as part of the prune offer, b) the seat that writes the lesson. Option b is S4 and has its problems. Option a keeps seats unchanged.
- K3 If S1: what does "a check could cover it" produce? a) an offered `/seed-issue` line the operator accepts or not, b) the door opens a chart for it on the spot. Option b drags an unrelated destination into the current chart. Option a uses the existing seed path (learn.md:20-24).
- K4 Does the prune also verify "already guarded"? a) yes, the door greps for the guard and cites it, b) operator judgement only. Option a is the Function over form answer and uses "check the live surface" (chart-issues/SKILL.md:17). It adds a few greps per open for 15 lines.

Practitioner questions:

- Q1 Pocock's retro assumes one session equals one build. An Akrogon leaf spans four phases, two or three seats and worker sessions. Which session would a retro read? No good answer exists without a new aggregator, which argues against S3 and S5.
- Q2 Pocock keeps a human in the loop for every candidate (source-retro-SKILL.md:25). Akrogon lifecycle seats are unattended. The only attended point is the chart door, so that is the only place retro's output could land.
- Q3 Retro has no memory. It re-derives findings each run. Akrogon's lessons file is the memory retro lacks, so the transferable part is the routing rule, not the procedure.

Pitfalls over the work's lifetime:

- R1 Check sprawl. "Default to building the check" applied to every mechanical lesson grows `checks`, which every leaf pays for on every pass. check-reruns and akrogon-slow-phases were both charted to cut that cost. Removed by K3a: a seed goes through charting, which weighs the cost.
- R2 Lessons read as rules. Routing language can drift into "this lesson must become a rule", which contradicts LESSONS.md:3. Removed by keeping "stays an observation" as a named outcome.
- R3 Prune fatigue. A longer prune offer at every open gets skipped. Removed by keeping it one question per line with a default of "stays".
- R4 Vocabulary creep. Importing "retro", "guardrail", "navigation pointer" adds terms beside lesson, nit, seed, fix. Removed by writing S1 in existing words only.
- R5 False "already guarded". The door removes a line because a grep matched something that does not cover the case. The history file is kept, so the loss is recoverable, but the door should cite the guard's file:line in its prune offer.

## 5. Recommendation

Adopt a narrow change to an existing surface: K1b, with K2a, K3a, K4a. Edit the prune sentence at `skills/chart-issues/SKILL.md:29` so the door sorts each active lesson into one of three outcomes: already guarded (cite the guard, remove the line), checkable (offer a seed), or stays. Nothing else changes.

Do not add a retro skill, phase, lesson field, standards file or log-tail mode. Akrogon's chart door already does what retro does, with better evidence and a path to delivery (F3).

Is it worth doing? Marginally yes. The cost is one sentence and one small leaf. The payoff is small too: 15 active lines, at least one already guarded (LESSONS.md:10), three or four checkable. If the operator would rather not touch chart-issues for a gain this size, "adopt nothing" is a defensible answer, and the only lasting cost is a lessons list that grows stale more slowly than it gets pruned.

The one idea worth taking from retro is I3: a mechanical mistake should end as a check, not as a line someone has to keep reading.
