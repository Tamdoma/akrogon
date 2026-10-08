# Slot B brief: Blocked report final-shape check

Operator answer 2026-10-08: `1a | 2a | 3a` (manual selections report; missing inputs report for every selected leaf; a selected failed leaf reports).

Proposed final shape to record as Taken:
1. Reporting subjects are the leaves selectLeaves returned for a manual invocation: `next <name|path>`, typed bare `next` without event JSON, `next --all`. Explicit target or --all is manual even with inherited event JSON. --resume, Herdr events and mergeWake are automatic. Dependents started after a completion and mergePass leaves are never subjects. Real errors keep reporting on every path.
2. Each subject is evaluated when its dispatch is attempted, against current inventory, and gets at most one error line (existing report() dedupe):
   - failed phase: "<slug> is failed; recover its phase" and nothing else for that leaf;
   - else unmerged dependencies: every unmet dependency with its phase, or parked, missing, or unreadable (parked by name, src/state.ts:146-158);
   - else missing inputs: every gap by kind, name and holder, never values.
   Priority matches eligibility (deps before inputs, src/turn.ts:8-20); eligibility's truth value and merge order are unchanged.
3. Single-leaf and multi-leaf selections behave identically. The current explicit-only throws (src/next.ts:629-644) become this shared report. Ready siblings still start. Any report sets exit 1.
4. Merge turn, capacity and busy seats are never reported. Automatic passes keep today's silent waiting.

Return only problems with this shape (contradictions, missed cases, evidence) to /home/ivan/Work/infra/akrogon/issues/chart/next-named-targets/slots/blocked-report-final-check-B.md, or "No problem." No repo edits.
