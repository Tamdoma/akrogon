# Adopt C: where lesson triage runs

Slot C, 2026-10-05. Independent round. No other adopt-*.md read.

## Options

O1. Keep at chart open (earlier 1a).
- Breaks: the operator's stated goal. Triage needs a guard search per active line, verified "everywhere it can recur" (forks/adopt.md:19). With 15 lines (LESSONS.md:7-22) that is a block of unrelated findings and seed offers before the territory map of the chart the operator came for (chart-issues/SKILL.md:37).
- Invites: the cost grows with the list, and it is paid at every open, including opens where nothing changed since the last one.

O2. Operator-requested door pass only. Drop the open-time offer.
- The door runs triage only when the operator's note asks for it. The door already has this shape for other intake: seeds are imported "only when the door opens without an operator note or the note asks for them" (chart-issues/SKILL.md:31).
- Breaks: nothing in the locks. The operator is present, so "operator accepts or declines" each seed holds.
- Needs: `LESSONS.md:5` says a line leaves when "pruned at chart open". That wording changes to match. `docs/guide/learn.md:18` ("Charting can propose removing stale entries") stays true as written.
- Invites: the operator never asks, and the list goes stale. That equals O4 in practice. The cost is bounded: the only pass that reads the list is plan (plan-issue/SKILL.md:25), and it treats lines as observations to verify (plan-issue/SKILL.md:27).

O3. A lifecycle seat.
- Plan is the only seat that reads the list (plan-issue/SKILL.md:25). Implement, check and merge exclude it as input (implement-issue/SKILL.md:31, check-issue/SKILL.md:45, merge-issue/SKILL.md:35).
- Breaks the seed lock. Seats send no questions and pause for nothing (skills/AREA.md:23), so no operator can accept or decline. `/seed-issue` posts a GitHub issue directly (seed-issue/SKILL.md:54), so an unattended seat would file public intake on its own judgement.
- Breaks the write rule. Seats leave lesson files uncommitted for the operator (check-issue/SKILL.md:59, merge-issue/SKILL.md:35, docs/guide/files.md:56). An unattended removal of a line sits uncommitted in the registered checkout, unseen.
- Invites: a wrong "already guarded" call with no human looking, the pitfall at map-merged.md:33. It also puts a repo-wide chore inside one leaf's plan pass, which is the same distraction moved to a place where nobody can decline it.
- The watch seat is no better: it is unattended and capped at five lines per fire (watch-issues/SKILL.md:61).

O4. Adopt nothing.
- Keeps today's open-time prune offer, which is the smaller version of the same distraction. Leaves LESSONS.md:10 active although `src/phase.ts:270-271` enforces it.

Considered and dropped: run triage at handoff, after the chart is done. It no longer delays the chart, but it lands when the door's context is longest and the operator wants to start leaves. It is still an unrequested step at every chart.

## Recommendation

O2. Change the sentence at `skills/chart-issues/SKILL.md:29` so the door reads `learnings/LESSONS.md` as a resource at open and says nothing more about it. Lesson triage, with the three locked outcomes, runs only when the operator's note asks for it. Update `LESSONS.md:5` to say "pruned on request".

Why: the correction is about attention, and only O2 gives the operator full control of when attention goes to lessons. It also removes today's open-time offer, so every chart open gets shorter than it is now. It reuses a condition the door already applies to seeds (chart-issues/SKILL.md:31), so it adds no new trigger type.

The risk is that triage never runs. I accept it. A stale list costs a few extra lines in each plan pass. A triage that interrupts every chart costs the operator's focus each time.

One refinement to decide, not required: also run triage when the door opens with no operator note, the same second condition as chart-issues/SKILL.md:31. No operator-chosen chart exists in that case, so nothing is displaced. I lean against it. It adds a second trigger for a small gain, and the seed drain is itself the main work of such an open.
