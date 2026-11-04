# Merged opening map: signposts (A, B, C)

Sources: map-A.md, map-B.md, map-C.md; direction answers in forks/direction.md (A's picks plus operator corrections: name "signposts", three modes, one per session).

## Settled by direction and operator words

- One signposts round per door session, covering every chart charted in it; general direction only: ranked priorities, hard limits, order or drop of the session's charts (operator).
- Modes: manual (operator answers signposts and forks), autopilot (operator answers signposts, A answers forks), full autopilot "autopilot signposts" (A answers both) (operator).
- Placement: at Open, after intake import and the consultant restart, before any map; every map brief carries the answers (A,B,C after the per-session correction).
- Consultants add missed angles in one exchange before the round (A,B,C; direction 2a).
- Light format: question, 2–3 options, recommendation, what it steers; reply key and challenge check kept (A,B,C; direction 4a).
- Unanswered signposts questions stay open and are asked once more before the first fork round (B,C pick b/A).
- Record: `forks/signposts.md` copied verbatim into every chart folder of the session, naming the chart holding the original (C, A; B dissent: one file with links).

## Forks

- S1 · What a session is. The door run from its first operator message to pass end, across same-session and fresh-A handovers (A,B,C). A handover entry carries the signposts path. A chart resumed in a later run gets that run's signposts; the earlier ones stay as an earlier correction (C). Reuse of a chart folder alone never selects another run's signposts (B).
- S2 · How the mode is read from the operator's words. Judgment over the first message, recorded verbatim in the mode line; no fixed phrase (A,B,C). Later words in the session ("You answer the directions.") are a mode entry (C).
- S3 · Mid-session switch to autopilot. A session with no signposts at switch-on asks them first; otherwise reuse (A,B,C; one clause).
- S4 · A's signposts under full autopilot. Echoed in the first reply and the run continues (C); labelled "signposts: A" in `## Autopilot`, never as operator values (B,C).
- S5 · Previous run's signposts offered as proposed answers on the same repo, "same" or change (C, A's pick); B not asked.
- S6 · Round shape exception. questions.md says every round uses the full shape; the signposts round must be named there as the light exception, or the texts contradict (B,C).
- S7 · Autopilot pick rule. "by the evidence, the session's signposts, and where silent the values: simplicity, ..." (A,B,C; direction 7a). Later recommendations name the steering signpost when it decides a pick (B; A's B-G4 pick).
- S8 · Conflicts. A later operator word that conflicts with a taken fork or a signpost is shown in one line and asked; plain additions are appended with date (A,B,C; existing correction rule).
- S9 · Direct single item first in a session. Pays the one signposts round; accepted (A). C's earlier skip rule (no round when no fork) predates the per-session correction.
- S10 · Usage. chart-usage.ts unchanged; the first chart's first span covers the signposts round (B,C).

## Records and tests

- SKILL.md: Open (round position, first reply names the mode), Drain (maps under the signposts), Take (one sentence: the signposts round is the light exception, no research line), Autopilot (three modes, pick rule, echo), Handover (entry carries the signposts path) (A,B,C).
- questions.md: the signposts round's light shape; the consultant angle exchange (B,C).
- shapes.md: `forks/signposts.md` shape, `signposts:` line in `## Autopilot` (A,B,C).
- Tests: string-presence in the style of `tests/docs-links.test.ts` (SKILL.md names signposts in Open, Autopilot, Handover); no exact-phrase or quality parser (B,C). `tests/chart-shapes.test.ts` untouched unless a parsed example is added (C).
- Docs: `skills/AREA.md`, README chart-issues row, `docs/` pages describing the door's order (A).

## Pitfalls

- Fresh A cannot see chat: the handover entry and each chart's copy carry the signposts (A,B,C).
- Questions drift to generic lists: define a signpost by its test (changes several picks across the session's charts, evidence cannot settle it), no seed list in the skill (C).
- Guessed intent passed off as the operator's: label A's signposts (B,C).
- Legacy charts: the rule applies to sessions opened after it lands (C).

## Where slots differ

- Storage: copy per chart (A,C) vs one file with links (B).
