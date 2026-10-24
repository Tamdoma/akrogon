# Brief, seat C: two tasks

## Task 1, focused final check (stopped-and-ambiguous)
Read /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/slots/sa-proposed-shape.md. Return only defects or missing pieces with evidence, or "no change", to /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/slots/stopped-and-ambiguous-final-check-C.md. Check especially that the deadline mechanism exists as described in src/shell.ts.

## Task 2, blind fork notes (cross-session-reads)
Do not read A's draft, this fork's Findings, or other seats' notes for this fork.
Permitted context: /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/INTAKE.md; /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/forks/cross-session-reads.md sections Question and Carries; locks in /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/forks/session-address.md section Taken and /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/slots/sa-proposed-shape.md; related questions only in /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/forks/call-coverage.md.
Write five-part blind notes per question as defined in /home/ivan/.claude/skills/chart-issues/assets/questions.md section "Blind peer exchange". Cover: capacity counting (activeCount), reconcile keep-vetoes and closes, hook pane ownership and the tab_closed route deferred from session-address (how a hook pass learns its emitting session; whether herdr plugin commands get server-injected HERDR_SOCKET_PATH and HERDR_PANE_ID, from herdr v0.9.1 source or docs), and when an inherited HERDR_PANE_ID is trusted (src/next.ts hookPane, src/log.ts). Make no herdr mutation.
Return to /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/slots/cross-session-reads-C.md

## Reading rule
Read process text by named section, bounded, at most once per session; unread, changed or compacted content stays readable; full source allowed when it is the subject; reads name sections, never line ranges.
