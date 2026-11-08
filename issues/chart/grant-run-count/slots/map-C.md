# Map: grant-run-count, slot C

Blind map, 2026-11-04. Surfaces inspected: `src/readiness.ts` (`grantSchema`), `src/run-check.ts` (`checkedRun`), `src/timing.ts` (`appendTiming`), the four seat skills' grant reuse sentence (plan-issue, implement-issue "Shared context", check-issue "Shared context", merge-issue), chart-issues "Take" grant paragraph and "Handoff", `assets/shapes.md` grants shape, `assets/standing-design.md` recorded-output rule, the closed framework leaf `fixture-weave-recorder` (`readiness.yaml`, `implementation/report.md`, `review-B.md`), framework `issues/timings.jsonl`, the #107 chart `issues/chart/paid-proof-bounds` (INTAKE, direct brief, forks `limit-mechanism` and `bound-unit`, `slots/limit-mechanism-C.md`), `issues/chart/proof-cost/forks/proof-run.md` "Taken", the coverage-audit brief, and the herdr-app intake "Skills" list.

## 1. What actually happened (grounding)

F1. The seat had the data and applied the wrong unit. A's report lists runs 3 to 6 under the renewed grant and still writes "1 run + 1 rerun": run 4 excluded as "dirty-worktree refusal, no session" (correct), run 5 excluded as "no session beyond batch" (wrong: the batch session is the paid one). The bound text was "at most 1 known-good recorder run and 1 rerun" (`readiness.yaml` grants[2]). "Known-good" let A count only runs it judged good. Source: `implementation/report.md` "Initial paid run" paragraph.

F2. The true count was worse than the intake says. Framework `issues/timings.jsonl` holds one `check_end` per `run-check --name record` with duration: in `implement` there are 9 runs on 2026-11-03, six of them 78 to 100 s (the length of one paid batch session), three under 9 s (no session). Grants[0] plus grants[2] allowed 2 + 2. So 6 paid invocations against 4 allowed, not 3. B's `check.repair` runs: 3 (103 s, 267 s, 142 s) against grants[3] 2 + grants[4] 2, and B stopped. Nobody read timings; both seats counted from memory.

F3. The grant that worked was the one whose bound named a unit. B wrote grants[3] and [4]: "at most 2 recorder invocations in total, counting every invocation that reaches a paid session whatever its outcome; at most 4 sessions per invocation". That sentence is the whole fix in miniature. The door-written grants[0] and [2] had no unit and no "whatever its outcome".

F4. This is the exact revisit trigger the #107 chart set. `forks/limit-mechanism.md` Taken 2a: "one proven paid launch past a written bound reopens ..." and `slots/limit-mechanism-C.md` P1: "a fresh pass after compaction may not know what was spent. Removed by: every pass artifact records ... the running count". The shrunk 1a then dropped "recording consumption in pass artifacts" and the unit rule (`bound-unit` Taken: "No unit ... free-text bounds stays as today", operator 2026-10-19 "I don't want to overcomplicate the system"). e522c186 delivered the reuse sentence with "records the grant reference, results and created IDs" and no count. The hole #107's own map named is the one #126 fell through.

F5. The records a self-count can stand on already exist, with no new parts. Per launch through run-check: `check-<name>-<ts>-<pid>.log` in `implementation/` (`checkedRun`, the `kept` write), `check_start`/`check_end` in `issues/timings.jsonl` with slug, phase, name, exit, duration (`appendTiming`). Limits: a launch outside run-check leaves nothing (the #107 intake's `sleep && bun` relaunches), and sessions nested inside one invocation are invisible to akrogon. The leaf grants already name the exact run-check command as the operation (grants[3].operations[0]), so "covered operations run only through run-check" is current practice, not a new rule.

F6. Renewal is by appending a grant entry whose bounds copy the old wording ("Approve same bounds" became grants[2] with "after the amendment"). Five grants on one leaf, three of them for the same recorder. The reader who sums must decide which entries are additive and which supersede. No rule says.

## 2. Lock conflicts with existing text

C1. 2b vs the stop rule. Every reuse sentence says "treats anything outside it as an operator blocker under the stop rule"; the limit-mechanism Taken 1a says "exhaustion is an operator blocker stop, the criterion stays red"; grants' `stop_line` says "more sessions needs new operator approval". 2b reads "a paid run past an approved bound is allowed with a warning". If 2b means the seat may knowingly launch past the bound after writing a warning, it deletes the stop that worked for B in this very leaf (review-B.md OA1, OA3). If 2b means only "akrogon never refuses; an overspend that happens is reported, not hidden", nothing in the seat rule changes and the warning is the seat's own disclosure of a count it discovers was wrong. The signposts' own summary ("overspend past a bound can still happen, with a warning") fits the second reading. A must pick one before writing the brief: see fork Q2 below.

C2. 4a vs bound-unit Taken. 4a's example is "count every paid operation and not only recorder runs". `bound-unit` Taken (2026-10-19) dropped any unit rule and kept free-text bounds. A counting unit written into the shapes.md placeholder and the Take grant paragraph is text, so it adds no part, but it reverses a recorded operator answer. Record the reversal in CHART.md with F1 to F3 as the evidence rather than treating the two as compatible.

C3. 1c and the warning readers. 1c forbids new command refusals and the signposts also declined 1b ("the command shows the problem"). So the warning cannot be an akrogon-printed line; it lives in a seat-written file. Under autopilot the operator reads nothing live (`docs/use/autopilot.md`), so a seat warning reaches a human only through the check seat's review, the leaf's `failure.reason`, or the completion broadcast. The map treats "where the warning goes" as a fork, not a detail.

C4. No conflict with 6a. Every candidate surface is a skill text or `shapes.md`; the herdr-app intake lists only chart-issues peer scripts, `SKILL.md:27`, `questions.md:46,50`, `shapes.md:57,217` and watch-issues as moving. The Take grant paragraph and the shapes grants block are untouched by the move.

C5. Overlap with coverage-audit (#127, handed off). Its brief edits chart-issues "Take" (operation-proof rule, proof budget) and `shapes.md` "Preflight and validation". This chart's edits touch the "Take" grant paragraph and the shapes `grants:` block. Same files, different paragraphs. Whether the door's one approved paid probe counts against the leaf grant is the one sentence both could claim; the leaf's grants[0] already wrote it into bounds ("the door used 1 charting proof session under the same grant"). Put that sentence in the grant paragraph (this chart) and keep the proof paragraph (coverage-audit) silent on counting.

## 3. Material forks

Q1. What does a bound count, and who writes the unit?
- O1a (recommended). The door writes `bounds` as one or more lines of the form "at most N <unit> ... counting <what counts, failed and aborted included> ... read from <source>", with the unit chosen from invocations of a named command, sessions, or money, never "known-good runs". The shapes placeholder shows the form and chart-issues Take names it. Breaks later: the door copies the form without thinking and writes a unit the seat cannot observe (sessions inside a runner akrogon cannot see). Invites: the counting source named in the bound becomes the thing B checks, which is the point.
- O1b. Keep free-text bounds and put the unit in the seat rule only ("every launch that reaches a paid session counts, whatever its outcome"). Breaks later: the seat rule has to guess what a prose bound meant per leaf, and "1 run + 1 rerun" is still readable as "two good runs". Invites: the same ambiguity, moved from the door to the seat.
- O1c. A structured field beside bounds (`bound_count`, `bound_unit`) in `grantSchema`. Ruled out by 1c in effect: akrogon would hold a number it is not allowed to use, and it is a schema part under 4a's "no parts". Also a 5a migration question for open leaves.

Q2. What does the seat do at the bound (the 2b reading)?
- O2a (recommended). Stop stays. The seat compares the live count with the bound before each launch and takes the existing operator-blocker stop at the bound; the warning of 2b is what a seat writes when it finds that a count it or an earlier seat kept was wrong (a launch already happened past the bound), so the overspend is disclosed where the check seat and the operator read, never silently restated as "within bounds". Breaks later: nothing new; this is the rule B already followed. Invites: a seat that wants to continue still has to stop and name an operator action.
- O2b. Warn and run: the seat may launch past the bound after writing a warning line naming the excess. Breaks later: the bound stops being a bound; a fix-and-rerun loop writes one warning per rerun and continues, which is the #107 pattern with paperwork. Invites: a review seat cannot tell an authorized overrun from a disobedient one. I mark this reading as the literal 2b but recommend against it; low confidence on which the operator meant.
- O2c. Warn and run once: one launch past the bound is allowed with the warning, then stop. Breaks later: "once" needs the count to be right, which is the thing that failed. A smaller version of O2b's problem.

Q3. Where does the running count live, and when is it written?
- O3a (recommended). In the pass artifact the seat already keeps (`implementation/report.md` for A, `review-<slot>.md` for B, the merge seat's own record), one line per covered launch written before the launch (grant index, operation, count so far against the bound) and completed after it (session or resource IDs, cost, outcome). A seat starting a pass reads the earlier artifacts' lines before its first launch. Breaks later: two files hold parts of one count (A's report, B's review), so the reader sums across them; a pass that ends in compaction leaves a pre-launch line without a result, which is the signal to recover before relaunching (same shape as the abandoned-capture rule in implement-issue "check.fix"). Invites: B can audit A's lines against `check-<name>-*.log` and `timings.jsonl` with one `grep`, no new command.
- O3b. One shared tally file per leaf (`<leaf>/grant-use.md`). Breaks later: a new file with a new owner is a part; two seats in check.review write it at once; it is not in any existing read list. Invites: a schema around it later.
- O3c. No written tally; the seat counts from `timings.jsonl` and the log files at each launch. Breaks later: sessions nested in a runner and launches outside run-check are not there, so the count is a floor, not the count; money bounds cannot be read from it at all. Invites: using it as the audit source (O3a already does) rather than the count.

Q4. Who reads the warning (C3)?
- O4a (recommended). The check seat: check-issue "check.review" already judges the report against the brief and the grant; add that a launch past the bound, or a count that does not match the leaf's logs, is a finding against the grant with the excess named, recorded under `Operator actions` when it needs a renewed grant. Breaks later: nothing new; the operator already reads `Operator actions` (`docs/reference/limits.md` "Do the operator actions a review names").
- O4b. The leaf's `failure.reason` through `akrogon phase ... failed --reason`. Only when the seat stops. Under O2a that is the path at the bound; it already exists.
- O4c. The completion broadcast (broadcast-issue). It carries no cost or grant line today (grep: none). Adding one is a script change in a skill the move keeps, but it reports after merge, too late to stop anything. Information only; low value for this bug.

Q5. Which seats and operations does the family cover (4a)?
- O5a (recommended). The one reuse sentence, in its four copies (plan-issue, implement-issue, check-issue, merge-issue), for every covered operation: paid launches and live changes alike, direct or through a runner, by A, B, the merge seat and the door's own charting probe. Workers launch no covered operation: implement-issue already gives workers only targeted test commands, so the rule names A as the only counter in a delegated run. Breaks later: a worker whose unit test is itself paid has no grant line to write; the sub-brief rule must say such a unit stays with A. Invites: nothing; this is the existing sentence with a count added.
- O5b. Paid launches only. Breaks later: fixture and live-change bounds ("at most one pass rerun after a failure", media-range-live) have the same hole and get the same recurrence on a different account.

Q6. How is a renewal written (F6)?
- O6a (recommended). A renewal is a new grant entry whose bounds state the new total or say "N more after <date or commit>", and the seat's next count line names which entry it draws on. Text in the Take grant paragraph and the shapes placeholder. Breaks later: nothing beyond what exists; grants[2] already wrote "after the amendment".
- O6b. Edit the existing entry's bounds in place. Breaks later: the approval provenance (`approved.answer`) no longer matches the bound, and the diff history is the only record of what was approved when.

## 4. Questions a practitioner asks

P1. Does a run that reached no paid session count? No under F3's wording ("reaches a paid session"). The seat needs an observable test: here duration and the runner's own session print. The bound names the test.

P2. Does the door's charting probe count against the leaf bound? Grants[0] said yes. Make it the written default, in the grant paragraph (C5).

P3. Who sums across A's report and B's review? The seat that is about to launch, before launching (O3a). B also sums as an audit (O4a).

P4. What if the count is unknown (compaction, a crashed pass, a log without a `check` line)? Treat unknown as exhausted: stop and name the operator action. That is limit-mechanism 1a's "prior use is unknown" clause, which the shrunk 1a dropped and this chart can restore as text.

P5. Can a runner's internal cap (the recorder's own `--grant` literal gate and per-site session caps, framework `record-fixture-weave.ts:174,948,981`) stand in for the count? No: it caps one invocation, not the leaf, and it is the consumer repo's code. Off route for akrogon.

P6. Does a money bound ("chart spend cap $12") get counted? Only from the runner's receipts (`renewal-attempt-2-receipts/result-*.json` here). The bound must name the receipt source or not use money as the unit. Low confidence that every framework runner writes receipts.

## 5. Pitfalls over the work's lifetime

R1. The tally line is skipped under pressure because it is prose a seat "will fill in at the end". Removed by writing it before the launch as the thing that authorizes the launch, and by B's audit against the logs (O3a, O4a). Residual: a seat that launches outside run-check leaves no log to audit; the rule keeps "covered operations run through run-check" explicit.

R2. Two readings of 2b (C1). If the brief leaves it open, A at implement will pick the permissive one. The chart records the reading as a fork answer.

R3. Unit drift inside one grant: "invocations" in one line, "sessions per invocation" in the next, "sessions across the chart" in a third (grants[0], [1], [3]). Each line is its own bound with its own source; the seat counts each. The shapes form should show two lines, not one, so the door does not fold them.

R4. Merge conflicts with coverage-audit on `chart-issues/SKILL.md` and `shapes.md` (C5). Both leaves are text in the same two files. Sequence this leaf after coverage-audit lands, or confine its edits to the grant paragraph and the `grants:` block and accept the rebase.

R5. 5a leaves open leaves with "known-good run" bounds. The counting rule lives in the skills, so a seat on an old leaf still counts every paid invocation against the old prose. No migration needed; an old bound that cannot be read under the new unit is "unknown", so P4 applies and the leaf stops once. Acceptable.

R6. The warning becomes a waiver. A report that says "ran 6 against 4, see warning" and then presents the sixth run as the proof must not pass review. O4a's finding keeps the criterion red until the operator renews the grant (limit-mechanism 1a's "criterion stays red", restore as text).

R7. The #107 revisit trigger (provider-side cap or separate capped key) fired and the signposts did not ask it. It is an operator account action outside akrogon, so not this chart's part; record it in Off route so it is not lost a second time. Low confidence that the operator wants it raised again.

## 6. Proposed split

D1. One leaf, text only, in akrogon: "grant-use-count" (or the chart slug). Files: the reuse sentence in plan-issue, implement-issue, check-issue and merge-issue (count line before each covered launch, read earlier artifacts first, unknown counts as exhausted, stop at the bound per O2a); check-issue "check.review" (B audits the count against `check-<name>-*.log` and `issues/timings.jsonl`, past-bound or mismatched count is a finding under `Operator actions`); chart-issues "Take" grant paragraph (bounds carry a unit, what counts, the counting source, the door's probe counts, renewal form per O6a); `assets/shapes.md` `grants:` block (`bounds:` placeholder shows the form, two lines); `docs/reference/limits.md` or `docs/use` only if a sentence there contradicts the new text (none found; grep shows no bounds wording in docs). No `src/`, no schema, no new file, no command output change. Done-criteria are reader-learns criteria like coverage-audit's, plus the worked example: a reader applying the new text to the closed leaf's `report.md` and `timings.jsonl` reaches 6 against 4.

D2. Not a second leaf: the broadcast line (O4c) and a provider-side cap (R7) go to Off route with their reasons.

D3. Sequence after coverage-audit (R4), or hand off now with the two-paragraph confinement named in the brief.

## 7. Low-confidence items

- Which reading of 2b the operator meant (C1, Q2). I recommend O2a and flag it as the one fork A should not answer silently.
- Whether reversing bound-unit's "no unit" answer (C2) needs an operator word under autopilot's "never raises an existing bound in the skill" clause (chart-issues "Take", the waits paragraph). I read that clause as about autopilot's own limits, not grant text; if it covers this, the chart parks at the fork.
- Whether every framework runner leaves a receipt a money bound can be read from (P6).
- The exact paid-session threshold I inferred from durations (F2): the runner's log would confirm, and the kept logs are no longer under the closed leaf folder (not found by `find`), so F2 rests on `timings.jsonl` durations alone.
