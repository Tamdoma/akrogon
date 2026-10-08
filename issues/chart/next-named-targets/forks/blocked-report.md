# Blocked report

## Question
Q1. Are blocked leaves reported only for operator-typed targets (hooks, startup and dependent sweeps stay quiet)? Do missing inputs and failed phase count as reported wait reasons alongside unmerged dependencies?

### Carries
- [Names](names.md)

## Findings
Merged notes: [slots/blocked-report-merged.md](../slots/blocked-report-merged.md). Rebuttal: [slots/blocked-report-rebuttal-B.md](../slots/blocked-report-rebuttal-B.md).
- operator · #59 intake · asks for every selected dependency-blocked leaf, each blocker with phase, missing or parked, ready siblings continuing, exit non-zero · sets the minimum.
- better-than-training · src/next.ts:1247-1257, :634-643 (read 2026-10-08) · one selected leaf runs explicit and errors on deps and inputs, several run as a sweep and stay silent · the unevenness is by leaf count, so names that select one-leaf issues inherit it.
- better-than-training · src/next.ts:622 · a failed leaf is skipped silently for one or many · failed is even, but silent.
- better-than-training · src/next.ts:1151-1162, :1332 · a manual pass also starts dependents and a merge pass outside the selection · diagnostics must track selected leaves, not the manual flag alone.
- better-than-training · src/turn.ts:8-20 · deps are checked before inputs and only a kind is returned · richer blocker data must keep the same truth value and order.
- better-than-training · GNU make Options Summary (-k) and Gradle CLI (--continue), read 2026-10-08 · both keep running independent work and still fail the overall command · supports ready siblings starting with exit 1.
- B rebuttal F1 · inherited event JSON on an explicit target or --all is still manual. Only no-input next reads event JSON (src/next.ts:1232) · precedence carried as binding.
- B rebuttal F2, F3 · B keeps deps only. Inputs and failed are separate operator choices. A failed dependency still shows as phase failed in its dependent's report.
- Practitioner search for CLI wait-diagnostic case studies: none stronger than the primary docs above.

## Taken
Operator answer 2026-10-08: `1a | 2a | 3a`. B final-shape check: [slots/blocked-report-final-check-B.md](../slots/blocked-report-final-check-B.md), both corrections applied (--all subjects, merged exclusion).
- Subjects are the leaves a manual invocation selects: the selectLeaves result for `next <name|path>` and typed bare `next` without event JSON, and the swept inventory for `next --all` (current repo, or every registered repo outside one, src/next.ts:1260-1270). An explicit target or --all is manual even with inherited event JSON. --resume, Herdr events and mergeWake are automatic. Dependents started after a completion and mergePass leaves are never subjects. Real errors keep reporting on every path. Reason: one rule for everything typed, and the operator sees why picked work did not start.
- Each subject is evaluated when its dispatch is attempted, against current inventory, with at most one error line (existing report() dedupe). Merged leaves keep today's completion branch first and are never diagnosed (src/next.ts:618-621). Then, in order: failed phase gives one line saying the leaf is failed and needs phase recovery; else every unmet dependency with its phase, or parked, missing or unreadable (parked detected by name, src/state.ts:146-158); else every missing input by kind, name and holder, never values.
- Dependencies are checked before inputs, matching eligibility (src/turn.ts:8-20). eligibility's truth value and merge order do not change.
- One-leaf and many-leaf selections behave the same. Today's explicit-only throws (src/next.ts:629-644) become this shared report. Ready siblings still start. Any report sets exit 1. Reason for inputs and failed (2a, 3a): no difference by leaf count, and no silent skip of picked work.
- Merge turn, capacity and busy seats are never reported. Automatic passes keep today's silent waiting.
- Binding tests: epic target with ready, dep-blocked, input-blocked and failed leaves starts the ready one, prints three lines, exits 1; single leaf gives the same lines; a hook pass on the same tree prints nothing for waits; a manual leaf target whose completion starts a still-blocked dependent does not report that dependent; merged closed dependency satisfies; parked and missing dependencies are labelled; --all inside and outside a repo reports.
