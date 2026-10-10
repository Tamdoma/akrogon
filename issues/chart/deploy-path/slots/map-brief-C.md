# Opening map brief, slot C (chart door, akrogon)

You are slot C, an independent consultant. Work blind: do not read other slots' map files. Read-only: write nothing except your return file.

## Operator note (verbatim)
"Look at the 4 latest issues pulled. We need to consolidate and chart them out. See if those issues still stand And whether we can make the system faster, more efficient, cheaper and move faster. Look at it from the system thinking perspective. Look at all the reinforcing and balancing loops and figure out the stalk and flow and whether something can be changed systematically without making the system work worse."

## Intake (the 4 pulled reports, read in full)
- /home/ivan/Work/infra/akrogon/issues/seeds/63-merge-gate-passed-in-the-leaf-worktree.md
- /home/ivan/Work/infra/akrogon/issues/seeds/69-heavy-check-runs-from-all-seats-share.md
- /home/ivan/Work/infra/akrogon/issues/seeds/73-lessons-never-feed-back-into-skills-or.md
- /home/ivan/Work/infra/akrogon/issues/seeds/75-leaf-plan-schedules-13-serial-live.md

## Existing locks (already charted and handed off today, 2026-10-10)
- #63 -> /home/ivan/Work/infra/akrogon/issues/chart/clean-merge-gate/ (leaf open/clean-merge-gate/merge-clean-worktree, phase implement)
- #69 -> /home/ivan/Work/infra/akrogon/issues/chart/merge-load-flakes/ (leaf open/merge-load-flakes/merge-attempt-pressure, phase implement)
- #73 -> /home/ivan/Work/infra/akrogon/issues/chart/lesson-guards/ (leaves lesson-write-rule and seed-owner-routing merged, guard-retires-lesson implement)
- Related, closed: /home/ivan/Work/infra/akrogon/issues/chart/merge-throughput/ (red-main hold, bounce counting, queue order, attempt records, batch limit), chart/leaf-run-stalls, chart/akrogon-slow-phases, chart/test-runs (host-load Off route).
- #75 has no owner yet.

## Live surfaces
- Lifecycle log (stock and flow data): /home/ivan/Work/infra/akrogon/issues/log.jsonl and the framework consumer log /home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl
- Command: /home/ivan/Work/infra/akrogon/src (next.ts: dispatch, max_active, STALL_MS, observeBusy), docs: /home/ivan/Work/infra/akrogon/docs/guide/
- Skills: /home/ivan/Work/infra/akrogon/skills/ (chart-issues shapes.md ~line 286, plan-issue, implement-issue, check-issue, merge-issue)
- #75 consumer evidence: /home/ivan/Work/infra/tamdoma/framework/issues/open/formspark-api/formspark-build-wiring/ and /home/ivan/Work/infra/tamdoma/framework/.claude/workflow/scripts/run-formspark-build-wiring-proof.ts
- Lessons: /home/ivan/Work/infra/akrogon/learnings/LESSONS.md

## Task
1. For each of the 4 reports: does it still stand (cite evidence), and is it already owned in full, partly, or not at all.
2. Systems map of the issue lifecycle (chart -> plan -> implement -> check -> merge -> merged): name the stocks (e.g. open leaves, seats busy, bounces queued, lessons), the flows, the reinforcing loops (R1..) and balancing loops (B1..), with delays. Use measured numbers from the logs where you can (phase durations, bounce counts, fix_rounds, time per phase). State which numbers you measured and how.
3. Leverage points: changes that would make the system faster, cheaper or higher throughput without making it worse. For each: what it changes, which loop, what it could break or invite later, and the evidence tier (operator material, named practitioner, primary docs/code/measured, model knowledge with the searches that found nothing stronger).
4. Forks: material questions the operator must answer to chart #75 and any new systemic destination. Pitfalls over the work's lifetime and what removes each.
5. Anything already handed off today that the systems view says is wrong or redundant.

Keep it compact: notes, not prose. Cite path:line.

## Return
Write your full answer to: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/0f21842f-d038-46f1-a1db-ba2b3c8ebb07/scratchpad/chart/map-C.md
