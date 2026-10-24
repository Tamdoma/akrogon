# Fork notes brief, seat B: session-address

Write blind fork notes as consultant seat B. Do not read A's draft, the fork's Findings, or another seat's notes for this fork (files named session-address-*.md other than this brief). Write nothing else in the repo.

## Permitted context

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/INTAKE.md
- Fork question and carries: /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/forks/session-address.md (sections Question and Carries)
- Related forks (questions only): /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/forks/stopped-and-ambiguous.md, /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/forks/cross-session-reads.md, /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/forks/call-coverage.md
- Locks: split taken 2026-10-24, two charts, this one first. No other locks. No operator corrections yet.
- Your own opening map from this session.

## Task

Notes per question in the shape defined in /home/ivan/.claude/skills/chart-issues/assets/questions.md, section "Blind peer exchange" (the five-part blind notes paragraph): pick with reason and cost, each rejected option with reason, evidence with tier, source and date, pitfalls with what removes each, and any question the fork does not ask. For Q2, trace the consumers that rely on stored tab and pane ids (state.ts, next.ts allocate and hook ownership, reconcile, phase, land) and say concretely what breaks under each option when a workspace moves session or a session restarts.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work (akrogon src and tests here). Reads name sections, never line ranges.

## Return

Write exactly: /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/slots/session-address-B.md
