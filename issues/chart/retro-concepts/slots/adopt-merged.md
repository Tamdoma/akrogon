# Adopt Q1 reopened: merged

Operator correction 2026-10-05: "The only problem is, it becomes a distraction from the main chart that I want to pursue."
Operator follow-up 2026-10-05: "How can we solve it more elegantly as a separate process maybe or something that doesn't distract?"

## Shared finding (A,B,C)
The distraction already exists: the door offers a lesson prune at every chart open (skills/chart-issues/SKILL.md:29). Any option that keeps triage at open keeps or grows it.

## Options
O1 (A,B,C reject). Keep triage at chart open. Every open pays a guard search per active line before the operator's own territory map (C, chart-issues/SKILL.md:37).

O2 (A,B,C recommend). Separate pass on request through the existing door. The door triages lessons only when the operator's note asks for it, for example `/chart-issues triage lessons`. The open-time prune offer is dropped, so every other chart open gets shorter than today. Precedent: the door already imports seeds only "when the door opens without an operator note or the note asks for them" (C, chart-issues/SKILL.md:31). Edits: chart-issues/SKILL.md:29, LESSONS.md:5 "pruned at chart open" to "pruned on request" (B,C), docs/guide/learn.md:18 (B aligns, C says it stays true). Cost: triage runs only when asked. Accepted: a stale list costs plan tokens, not correctness, because lessons are observations (plan-issue/SKILL.md:25-27). No reminder, timer or tracking field (B).

O3 (A, new from operator follow-up). Its own small skill, for example `/triage-lessons`. Fully separate from charting: chart-issues keeps one job. Cost: a tenth skill to install, link in skills/AREA.md and learn. It does the same work as O2 with more surface.

O4 (A, new from operator follow-up). Scheduled report-only run. A cron or scheduled agent writes a triage report (guarded / checkable / stays, with evidence) and changes nothing. The operator reviews it whenever. Never distracts and does not rely on memory. Cost: a scheduler, a report location and a report that goes stale between runs. Unattended runs cannot file seeds (operator accept/decline is locked), so the operator still needs a pass to act on the report, which is O2 plus a scheduler.

O5 (A,B,C reject). A lifecycle seat. Seats pause for nothing (skills/AREA.md:23), so no accept/decline. `/seed-issue` posts to GitHub directly (seed-issue/SKILL.md:54). Unattended line removal sits uncommitted and unseen (check-issue/SKILL.md:59, docs/guide/files.md:56).

O6 (A,B,C reject). Nothing. Keeps today's open-time offer, the distraction the operator named.

## Recommendation (A,B,C on O2; A on O3, O4)
O2. It is already a separate process: a pass the operator starts on purpose, never mixed into another chart. O3 adds a skill for no added behavior. O4 adds a scheduler and still needs O2 to act.

## Pitfalls
- Early removal: a guard counts only when it covers the mechanism everywhere it can recur; unproved coverage stays (B,C).
- A seed is intake, not a prescribed check: it reports the observed gap and case, no fix (B, seed-issue/SKILL.md:26).
- No "want to triage?" prompt at open or close of another chart: that recreates the distraction (B).
- Optional refinement C leans against: also triage when the door opens with no note. Adds a second trigger for little gain.
