# Slot C notes, fork peer-packet, 2026-10-06

Read: INTAKE.md, forks/peer-packet.md, questions.md:44-48, SKILL.md:6, the brief files of this chart (six in slots/, five in A's scratchpad from the map and first fork).

## Q1. Task inside the prompt, or a brief file with a one-line prompt?

Options I name:
- 1a. Brief file under `<chart>/slots/<fork>-brief.md` (or `-<slot>.md` when the two briefs differ), prompt is one line: read it and follow it, with the slot letter. The brief holds everything questions.md:48 lists plus the exact output path.
- 1b. Task text inside the `herdr agent prompt` string, as merge-turn did.
- 1c. Both: the prompt carries the task and the path, the file repeats it.

1. Pick: 1a.
   One reason: it is the only form measured to start both peers at once. The inline 1,936-character brief on merge-turn arrived at C as pasted content and C did not start for 9 minutes (map-C.md F2); every one-line pointer since (seed-root-cause, all eight prompts to me on this chart) started the turn immediately. The file also is the record of what each peer was sent, which is the only evidence the blind lock was kept.
   Cost: one more file per round in slots/ (this chart: six briefs, 4.7KB total), and the brief must be complete on its own, because the peer reads nothing else.

2. Rejected:
   - 1b: the measured stall. The threshold at which a harness treats a prompt as pasted text is not under A's control and differs per harness, so inline text works until it does not.
   - 1c: two copies of the task that can disagree, and the long prompt string keeps 1b's failure.

3. Evidence:
   - Tier better-than-training. Source: issues/chart/chart-cost/slots/map-C.md F2 and A's transcript timestamps, measured 2026-10-05/06 by C. Finding: inline brief, 9-minute stall until the operator typed "go"; file pointer, immediate start on seed-root-cause and this chart.
   - Tier better-than-training. Source: this chart's slots/ (peer-effort-brief.md, round-writing-brief.md, map-size-brief.md, map-size-2-brief.md, map-size-2-rebuttal-brief.md, peer-packet-brief.md) and A's scratchpad (intake.md, fork1-B/C.md, prompt-B/C.txt, rebuttal-B/C.txt), listed 2026-10-06 by C. Finding: the practice already exists but the location moved mid-chart from a scratchpad that disappears to slots/ that stays. The map and first-fork briefs of this chart are not in the chart.
   - Tier better-than-training. Source: questions.md:44, :46, :48, read 2026-10-06 by C. Finding: the prompt command is given, the exact output path is required in every prompt, the content list exists, and no line says where the content travels. 1a is a one-sentence edit to :46 or :48.

4. Pitfalls:
   - The brief is thinner than questions.md:48 because the one-line prompt feels like the whole prompt. Removed by: the brief carries the :48 list as its sections (intake path, Question and Carries path, related fork paths, locks, verbatim operator corrections, output path, slot letter), and the peer-wait outcome `failure` already catches a peer that could not start from it.
   - Briefs in a scratchpad vanish with the session and the blind record goes with them. Removed by: the path rule names `<chart>/slots/` for every brief from the map on; before chart folders exist, the temporary path rule at questions.md:46 applies and A moves the map brief into slots/ with the maps, as that line already says for map files.
   - Two peers get different briefs (slot-specific paths) and one drifts. Removed by: one brief for both when the task is the same, with the slot letter in the prompt line, as this chart's last six briefs did.
   - A one-line prompt still exceeds a harness's paste threshold when it includes a long path. Removed by: the line is "Read <path> and follow it exactly. Your slot letter is X." and nothing else; this chart's prompts of that shape were under 200 characters.

5. Missing question: should the briefs stay in slots/ as part of the chart record, or is that clutter the operator does not want in the chart folder? The fork assumes slots/ and does not ask.

## Q2. What bounds the context a peer carries from one turn to the next?

Options I name:
- 2a. The brief is the bound. Every brief is self-contained, so a peer turn needs nothing from earlier turns; context is left to the harness (compaction when it hits its limit). A adds no step.
- 2b. A deliberate reset after the map is merged: compaction or a pane restart, since map text is 0-4% reused and was 206-213k tokens of C's context.
- 2c. A fresh peer session per fork.
- 2d. A reset at a context threshold A watches.

1. Pick: 2a.
   One reason: the measured cost of carried context is small and the measured cost of any reset is about the same as the saving. Cache read on all C turns after the map was $1.60, 12% of C's $13.3; a compaction turn cost $0.81 and a fresh Fable session $0.90 before any work. B's turns took 1-3 minutes at every context size from 21k to 237k. The map turn ($6.90, 52%) and cache write of new text ($5.91, 44%) are where C's money went, and neither is carried context.
   Cost: a peer compacts when its harness decides, mid-chart, and the compaction turn ($0.81 once on this chart) is paid at an uncontrolled moment. With 2a that moment cannot break a turn, because the next brief carries everything.

2. Rejected:
   - 2b: a reset right after the map saves at most the cache read of a 210k context on the fork turns until the harness would have compacted anyway. On this chart that is bounded above by $1.60 total and the reset costs $0.81-0.90, so the net is at most a few tenths of a dollar per chart and can be negative. It also puts a harness-specific command (compaction) or a relaunch with the operator's flags into the door, against the no-hard-coding lock.
   - 2c: $0.90 per fork on Fable before work, against notes turns that cost $0.64-0.90 in total. Doubles the fork cost.
   - 2d: A would read peer context sizes it cannot see (herdr reports working/idle, not tokens), so the threshold has no sensor.

3. Evidence:
   - Tier better-than-training. Source: forks/peer-packet.md Carries, A's fitted figures from C's transcript (fbaaa537 session on this chart) and B's codex transcript, 2026-10-06. Finding: cache read after map $1.60 (12%), compaction $0.81, fresh session $0.90, notes turn $0.64-0.90, rebuttal turn $0.19-0.29, B flat 1-3 minutes at 21k-237k.
   - Tier better-than-training. Source: my cut-boundary N2 and map-size round 1 (merged files share 0-4% of 8-word sequences with peer files, merged maps 0-2% with peer maps), measured 2026-10-06 by C. Finding: the carried map text is not reused, so nothing is lost when it is compacted away; this is why 2a is safe, not why a reset pays.
   - Tier better-than-training. Source: SKILL.md:6, read 2026-10-06 by C. Finding: A does not re-read an unchanged file already in its thread. The same economy applies to a peer only while its context survives; under 2a a peer re-reads the intake (1.1KB on this chart) after a compaction, which is a negligible cache write.
   - Tier practitioner: not searched. The numbers are this door's own.

4. Pitfalls:
   - A peer answers from stale carried context (an earlier fork's Carries or a superseded lock) instead of the brief. Removed by: the brief names the current Question and Carries path and the verbatim operator corrections (questions.md:48), and the peer is told to read them; the rebuttal step catches a note that cites a superseded lock.
   - Compaction lands in the middle of a peer turn and the file comes back empty. Removed by: peer-wait outcome `failure` (idle with a missing or empty file) already reports it and A re-prompts with the same brief; nothing is lost because the brief is complete.
   - B reaches its context limit (237k on this chart with compaction only at the last turn) and codex's behaviour there is unmeasured. Removed by: 2a makes the outcome harmless either way, and proof-of-saving records B's context per turn so a cliff would show as a turn-time jump, which did not happen on this chart.
   - The carried-context cost is small on Fable prices and read as small forever. Removed by: proof-of-saving reports cache read as a share of each peer's bill per chart; the fork reopens if it passes the cost of one reset.

5. Missing question: none. The operator's locks already answer the one I would ask (no harness command or launch flag written into the door).

## Not measured
- B's dollars at any context size.
- Codex behaviour at its context limit.
- Whether a harness paste threshold exists for a one-line prompt with a long path (none hit under 200 characters).
