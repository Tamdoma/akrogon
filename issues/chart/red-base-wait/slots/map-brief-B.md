# Opening map brief, slot B (chart-issues door, blind exchange)

You are slot B, a charting peer. Produce your own independent territory map. Do not read any map-A file.

Intake (read verbatim, all three are new GitHub intake for repo akrogon, /home/ivan/Work/infra/akrogon):
- /home/ivan/Work/infra/akrogon/issues/seeds/76-red-main-fails-leaves-one-by-one-at.md (Tamdoma/akrogon#76)
- /home/ivan/Work/infra/akrogon/issues/seeds/77-moving-a-base-failed-leaf-back-to-check.md (Tamdoma/akrogon#77)
- /home/ivan/Work/infra/akrogon/issues/seeds/78-busy-seat-duration-is-still-only-noticed.md (Tamdoma/akrogon#78)
Operator note: "3 new issues about the systemic problem we had encountered today. Let's chart it out and fix it."

Live surfaces to inspect (cite file:line): src/next.ts (observeBusy, STALL_MS, notify path), src/pause.ts and any red-main hold from #67, src/phase or wherever `akrogon phase` moves failed -> check.review, skills/check-issue/SKILL.md (base-red stop and evidence reuse rules), skills/implement-issue (base comparison), skills/watch-issues, plugin/ hooks. Consumer evidence: /home/ivan/Work/infra/tamdoma/framework/issues/open/merge-gate/*/ (reports, review-B.md) and that repo's issues/log.jsonl.

Existing locks and related charts (read their CHART.md Destination/Taken, do not redo them): issues/chart/{seat-stall-detection,stall-notifier-removal,failed-leaf-routing,check-reruns,repo-pause,stuck-seat-recovery,red-base-fixtures,merge-load-flakes}. Lesson: learnings/history/2026-10-10-red-main-hold-stale-clear.md.

Task: map the territory. For each issue: is the reported mechanism confirmed in code (cite lines)? What is the systemic root (is there one shared cause across the three)? Material forks the operator must decide, options per fork, what each option could break or invite later, practitioner questions, pitfalls over the work's lifetime, and anything out of scope. Suggest the split by destination (one chart vs several, parallel leaves vs dependencies).

Format: compact notes, plain language, cite path:line and tier (operator / practitioner / better-than-training / model-knowledge). Write the result to this exact path and nothing else:
/tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3439f-85f2-4472-a49d-d163111cd153/scratchpad/chart/map-B.md
