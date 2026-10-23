# Merged opening map (A, B)

## Confirmed defects
- README reading order puts State (internals) before Install and Setup; no short path to a first result. (A,B) README.md "Guide" list.
- README command table sits in a `text` code fence, so GitHub shows raw pipes. (B) README.md "Command"; A confirmed.
- docs/guide/merge.md opens "Seat B merges reviewed work"; skills/merge-issue/SKILL.md "merge" says the command lands a green top itself via `akrogon land`, B only on handover. Stale. (B) A confirmed.
- limits.md / merge.md cleanup claims contradict per-pass reconciliation in src/next.ts; already a recorded lesson learnings/history/2026-10-11-cleanup-timing-guide-claims.md. (B)
- chart.md restates chart-issues SKILL rules (autopilot, direct, peers) that change weekly; autopilot and direct are at the end of a 269-line page. (A,B)
- create.md frames charting as operator-led only; README diagram shows only lifecycle/manual dispatch. (B)
- cheat.md mixes agent phase commands with operator actions; stop/start, rollback, autopilot missing. (B)
- install.md assumes a checkout without saying how to get it; mixes clean install with a one-time migration note. (B)
- readiness.yaml (inputs, grants, proofs), config keys implement/broadcast/harnesses/toolkits: no guide coverage. (A)
- Counts in prose go stale ("ten agent workflows"). (A)
- No SVG anywhere; only ASCII diagrams. (A,B)

## Forks
1. Reader floor: prepared machine vs clean-machine install; "all people" vs needs terminal, Git, Herdr, Linux/systemd, agent CLI. (A,B)
2. Publication: repo Markdown rendered by GitHub vs GitHub Pages site vs wiki. (A,B)
3. Architecture: short guided first run + task pages + reference + explanation, Diátaxis used as a judgment tool not as folder labels (B) / concept ladder + separate reference (A). Same core: (A,B). README boundary: outcome, audience, prerequisites, one overview SVG, links; no duplicated install/command chapters (A,B). Concepts introduced at first use; charting consultants vs execution seats named apart (B).
4. Fact ownership and staying current: one home per fact; source owns syntax, skills own rules, task pages own operator steps; guide links instead of restating (A,B). Mechanical link check vs review-only (A raises a link-check prerequisite, B: link/asset/syntax checks mechanical, clarity judged by agent).
5. SVG: few checked-in self-contained SVGs, CSS animation, readable with motion off, prefers-reduced-motion (A,B). One theme-safe asset vs light/dark pairs (B prefers one). No generator/framework by default (B) vs generate from source to avoid staleness (A, weak). Needs a real GitHub render probe before the art approach is locked (A,B).
6. Examples: one simple running example through the first run + real case walkthroughs from public records, scrubbed of private paths/customers (A,B). Candidates: next-same-work (direct), orphan-pane / config-walls (lifecycle), P1 autopilot batch (autopilot), varhop overlay-rework (failed leaf carried forward + seat override), P2 app epics (A,B). Verify delivery before any success claim (B).
7. Split: B proposes foundation+first run / daily ops+reference / use cases / SVG with a probe; A notes paths can be fixed in design so leaves run in parallel; README/nav edited by one owner to avoid collisions (B).

## Modes to explain truthfully (B, A agrees)
Attended charting, direct route (small, B reviews, not under autopilot), autopilot (answers chart rounds and hands off; does not start execution, approvals stay human), event dispatch via `akrogon next`, watch-issues (Claude Code cron, separate), merge landing by the command, broadcast. Deploy is out of scope of the factory.

## Practitioner sources (B, read 2026-10-23)
Diátaxis (Daniele Procida) diataxis.fr; MDN SVG as image / SMIL / prefers-reduced-motion; GitHub Docs diagrams + collapsed sections; GitHub changelog theme-context images; Docker get-started as a navigation example.

## Lifetime pitfalls (A,B)
Drift between README/guide/skills; beginner route accreting internals; "automatic" overpromised; historical walkthroughs read as current instructions; animations contradicting prose; recovery bypassing supported controls (pause/park/stop before phase mutation); scope ballooning into new tooling or hosting; inbound links broken by moves (skills and grounding.index link docs/guide/*).
