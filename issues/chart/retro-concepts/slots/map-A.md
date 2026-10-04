# Map A: retro-concepts

## What retro does
A user-invoked skill (`disable-model-invocation: true`, source-retro-SKILL.md:4) run after a coding session. It reads the session log and lists environment changes, ranked by severity, in seven categories: navigation pointers, automated checks, coding standards for the reviewer, AGENTS.md size, tool economy, no-op instructions, information access (source-retro-SKILL.md:16-22). Two ideas carry it:
1. Route by kind: a mechanical mistake becomes a deterministic check, a judgment call becomes a reviewer standard, and steering files hold only navigation pointers (source-retro-SKILL.md:18, 36-41).
2. The reviewer, with the least context pressure, enforces standards, not the implementer (source-retro-SKILL.md:28-32).
It changes no code itself. It only proposes.

## What Akrogon already has
- Capture: every phase seat writes reusable findings as one LESSONS.md line plus a history file (skills/plan-issue/SKILL.md:39, skills/implement-issue/SKILL.md:31, skills/check-issue/SKILL.md:59, skills/merge-issue/SKILL.md:35).
- Class-level prevention is already doctrine: learnings/history/README.md:3-5 asks what change to code, charts or verification prevents the class.
- Reviewer owns standards: check-issue judges the diff against plan, brief and standing design. Implementer pressure is bounded by worker sub-briefs.
- Navigation pointers: docs/reference-index.md plus per-area AREA.md files.
- Automated checks: `checks` in config, `akrogon preflight`, phase guards in src/phase.ts.
- Session logs are already readable: skills/watch-issues/scripts/log-tail.ts parses claude and codex logs, and every issues/log.jsonl transition records `session`.
- Ad hoc retros already happen through charts: akrogon-slow-phases, leaf-run-stalls, long-implement, test-time-and-temp.

## Real gaps
G1. Promotion has no destination rule. Chart open "offers a lesson prune" (skills/chart-issues/SKILL.md:29), which only removes. Nothing asks whether a lesson should become a check, a review rule or a pointer. Evidence: two active lessons are already enforced in code and still listed: uncommitted work (LESSONS.md bullet 4, enforced at src/phase.ts:271) and blank reasons (LESSONS.md bullet 11, enforced at src/phase.ts:327). The list drifts because "applied" is never checked.
G2. Capture is self-report only. Seats record what they notice. Waste they do not notice (slow navigation, expensive tool calls) surfaces only when the operator charts a stall.

## Where a retro concept helps
- G1 fits inside the existing chart-open step: turn "prune" into "triage". Each lesson ends in one of four outcomes: already applied (remove), mechanical (becomes a fork or seed for a check), judgment (becomes a review or standing-design rule), stale (remove). No new door, file or phase. This is retro's routing rule applied to lessons Akrogon already collects.
- G2 would need a new reader over session logs. That duplicates watch-issues and the operator's stall charts and adds a door. Not worth it now.

## Forks
1. Adopt anything? None / triage at chart open / new retro door.
2. If triage: does a promoted lesson become a fork in the current chart, or a seed for later intake? A fork widens the current chart. A seed keeps the chart on its destination.

## Pitfalls over the lifetime
- Triage every chart open could become a tax. Remove by triaging only lines not triaged since their date, or only when the operator accepts the offer (already an offer today).
- Rules in skills grow without bound. Retro's own "no-ops" category argues for removal as a peer outcome of promotion.
- A mechanical check written into a skill instead of code is a rule an agent can ignore. Route mechanical lessons to code (src/ guards or `checks`), never to skill prose.
- A new retro door adds a tenth workflow to learn. Rejected.

## Recommendation
Adopt one narrow change: chart-open lesson prune becomes lesson triage with retro's routing (applied, mechanical → check, judgment → review rule, stale). Small, inside an existing step, fixes observed drift. Do not add a retro door or session-log review. Worth it only because it is a few lines in one skill; anything bigger is not.
