# Fork notes C: loop-counts build-scope

## Pick

Q1: build, small. Q2: the script prints counts as evidence only, over the same last-20 entries it already prints; the skill keeps the thresholds (three or more) and every judgment.

Shape: after the 20 lines, print summary lines computed from exactly those printed entries, only for facts worth seeing (groups of 2 or more, any undo pair):

- repeats grouped by command hash and status, e.g. `repeat #<hash> x4 status "exit 1"`, counting only `allLiteral` shell calls (`#-` never counts, as today);
- repeats of the identical edit (same target file, same old and new text) grouped the same way;
- the longest run of consecutive error statuses (`exit N` or `error`; `running` and `unknown` are not errors and do not count);
- undo pairs: a successful edit whose old/new exactly invert the most recent prior successful edit on the same target file, printed with the file.

Reason: the script already parses the whole log into entries carrying target, literal flag, edit texts and results (skills/watch-issues/scripts/log-tail.ts:75-92, status at :379) and then throws everything except the last 20 rendered lines away (:486). Grouping those entries is a small pure function next to tested code (472 lines of tests exist). Counting matching hashes by eye across 20 lines, per busy seat, per tick, is exactly the mechanical step agents do worst and pay tokens for, and both errors are costly: a missed loop burns seat hours, a false loop `esc`-stops a healthy seat. Evidence-only counts cut both error rates without moving any authority.

Cost: the skill paragraph shrinks less than under a verdict line (the threshold sentence and the hash-marker meanings stay, because the agent still confirms "same result" from the printed excerpts). A few extra output lines per tick. Invites later: pressure to promote the counts into a verdict; that step should be resisted until "same result" has an exact definition, which it does not today.

## Rejected options

Defer, build nothing. Honest on the evidence: no observed missed or false loop call, pain unmeasured, urgency low in the seed itself. Rejected because the build is one small function over data already in memory, the counting cost is paid by an agent on every watch tick for every busy seat forever, and deferring keeps a purely mechanical rule in prose that this repo has already once decided belongs in code (the hashes themselves). Breaks nothing; also removes nothing, and the idea will be re-seeded.

Script owns the bar and prints a verdict line. Rejected on one hard point: "same result" has no exact mechanical meaning. Same status only (exit 1 three times) flags the normal edit, test, edit, test cycle every implement seat runs. Same full output text misses real loops, because repeated outputs differ in durations, temp paths and timestamps. So a verdict line is either false-positive on healthy work or false-negative on loops, and either way it reads as authority next to a stop action; agents will stop reading excerpts. Tuning the threshold also becomes a code change instead of a skill edit. Invites later: verdict creep into auto-steer.

Whole-log window (with either owner). Rejected. A seat session log spans hours; a loop from early in the leaf, already steered or self-corrected, would re-fire on every later tick, and lifetime counts (the same test command run 30 times over a leaf) say nothing about being stuck now. The last-20 window self-clears as the seat moves on and matches the evidence the agent is shown, so the counts can be checked against the lines above them. Breaks: a slow loop whose repeats sit more than 20 calls apart is missed by the counts; the agent's pane read remains the backstop, as today.

Counts grouped by command only, without status. Rejected: a bare `x4` invites the misread the bar exists to prevent, since repeating a command while results change is progress. Grouping by status is free (statusOf already ran) and keeps the fact honest.

## Evidence

- operator · GitHub Tamdoma/akrogon#97 as carried in INTAKE.md, 2026-10-17 · loop bar counted by the agent from hash lines each tick; urgency low, no observed missed or false loop call, frequency and cost unmeasured; originally seeded as an idea, charted under the 2026-10-17 autopilot switch-on.
- better-than-training · skills/watch-issues/SKILL.md:42, read 2026-10-17 · the bar (same command or edit three or more times with the same result, three or more consecutive errors, an edit-undo cycle), `#<hash>`, `old#`/`new#`, `#-` never counts, stop-and-resteer once per seat per watch, insufficient evidence reported with no action.
- better-than-training · skills/watch-issues/scripts/log-tail.ts, read 2026-10-17 · entries hold kind, target, allLiteral, editOld, editNew and the full result (:75-92); `statusOf` derives ok / exit N / error / unknown / running per format (:379); codex and pi exec calls join inner commands into one composite target (:224); pi multi-edits are joined into single old/new strings (:323-327); only `entries.slice(-20)` is printed (:486).
- better-than-training · issues/chart/base-red/slots/map-merged.md #97 section (A,B), read 2026-10-17 · script has no result equality, so "same result" cannot come from hashes alone; an undo needs the same file and successful inverse edits; counts are evidence, not stop authority; not a removal of watch turns.

## Pitfalls, and what removes each

P1. Counts harden into accidental authority: the agent steers on `x4` without checking excerpts or the brief. Reduced by form: print facts (`repeat`, `errors`, `undo`) with no `loop:` word and no threshold in the script, and keep the skill's "act only on loop evidence" sentence naming the counts as one input beside the pane read. Not fully removable; accepted, since the same risk exists today with hashes and the counts are at least exact.
P2. Normal iteration flagged: same test command, exit 1, three times, with edits between that change the failure each time. Removed as a stop risk by evidence-only: the agent confirms same-result from the excerpts printed directly above the counts. The counts alone never satisfy the bar.
P3. Codex and pi exec composite targets hide an inner repeat (one sub-command looping inside varying composites). Not removed; counting stays at entry granularity so counts always match the visible lines. Splitting inner commands for counting while printing composites would make counts unverifiable against the output. Accepted limitation, same as today's agent view.
P4. Pi multi-edit calls join several edits into one string pair, so a partial undo inside a multi-edit is missed. Accepted for whole-call pairs only; per-edit pairs would need the collector to retain the list, which is scope beyond counting. The agent still sees `old#`/`new#` per call.
P5. `unknown` and `running` statuses pollute the consecutive-error run. Removed by definition: error means `exit N` or `error`; a trailing `running` entry neither counts nor erases the run before it; `unknown` (unparsable codex block) breaks a run rather than extending it.
P6. Output format change breaks the existing test fixtures and any reader expecting exactly 20 lines. Removed by appending summary lines after the 20, never interleaved, and updating the last-20 fixture test (log-tail.test.ts:266) to match. The only consumer is the watch agent reading text.
P7. The same counts reprint next tick and look like a new loop after a steer already happened. Not a script problem: the once-per-seat-per-watch stop limit and the next-fire notify rule stay in the skill and in watch context, unchanged. The script stays stateless; adding tick state to it would invite a second store of watch memory.

## Questions the fork does not ask

Q1. What is "same result" for the agent's remaining judgment: same status plus same excerpt, or same status plus no intervening edit to the failing thing? The skill never defines it, and Q2's verdict option quietly assumes the script could. If counts group by status, the prose should say in one line what the agent confirms from the excerpts.
Q2. Do repeated `other` calls (same read, same grep, same search) count toward the bar? Today they render identity `-` and only shell and edit carry hashes, so a read-loop is invisible to counting either way. State excluded, or extend identity to other calls deliberately.
Q3. Should an undo pair require no other successful edit to the same file between the pair? Edit A→B, then B→C, then C→B is not the first edit undone. My pick defines undo against the most recent prior successful edit on that target only; the fork's "edit-undo on the same file" does not say.
Q4. How will anyone know this helped? There is no baseline count of loop calls, missed or false. One cheap signal: the watch report already names its evidence when it steers; if steers start citing count lines, that is visible in reports without new recording. Worth one line in the leaf, or explicitly not measured.
