# Handoff review (autopilot, answered by A, 2026-11-20)

Tree: issues/open/watch-any-harness/ISSUE.md with leaves agy-skill-link and watch-timer, independent (no blocked-by). Registered repo: akrogon (/home/ivan/Work/infra/akrogon). Route: lifecycle (autopilot; direct not offered).
Scope: Destination in CHART.md. Choices: signposts 1a-6a with corrections S1, S2a, S3a (operator); timer-design items 1-10 (A's).
Grants: agy-skill-link none. watch-timer one grant under N1: at most 8 harness sessions, 2 per harness, each within 10 minutes, akr-e2e-watch tier, trust entries removed, no outside writes. Confirmed by A against N1's words (approval is the operator's N1).
Seats: no model-sensitive work named; no slots block.
Usage: chart watch-any-harness - operator wait 46.0 min, operator turns 5; A=113879, B=12598, C=unmeasured output; outcome partial.
Live run (watch-timer, estimate): 8 sessions, 1 at a time (shared akr-e2e-watch tier), 8 rounds; about 5 min each, about 40 min; worst case 80 min if every session hits its bound; basis: operator N1 "each ending within 10 minutes" (forks/signposts.md Needs N1); machinery: tests/e2e/watch-tier.ts, tests/e2e/tier.ts, src/hc.ts waitFor, akrogon run-check.
Key parts: tick text starts the skill (P2); skill from the root, codex/agy .agents/skills, pi --skill (P9), claude .claude/skills (existing watch-check.e2e.ts); hc child and env from a tool shell (P1, P4); send joins a running turn (P5); reset visibility (P6); hc guards, name, label list (P7); --rm, foreground, hc label (P10); agy global folder (P3, agy-skill-link). Nothing cut.
Skill change: watch-issues reaches running doors and watchers at the next deploy link (docs/reference/releases-and-updates.md).
Destination check: akrogon pull ok (1 open issue); seed #146 is a different outcome, recorded only.
A's answer: approve this tree and these contracts.

Update after the leaf-writing exchange (A, 2026-11-20): destination re-checked (akrogon pull ok; seed #146 recorded only). Cut: compaction continuation from the live proof (no safe free probe; stays a skill-text rule; held disagreement in watch-timer design). Held disagreements recorded for the operator: compaction cut, P12/P13 route sufficiency (both B). Operator N2a supplied the last three launch-shape proofs (P13). Breach recorded (CHART.md). Presence check: [] for both leaves; akrogon preflight exit 0; no collision under issues/open or issues/closed. A's answer stands: approve.
