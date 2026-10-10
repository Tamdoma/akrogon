# Intake: proof-cost

## Scope
A leaf's expensive live proof is seen and agreed before it runs, instead of discovered mid-implement. Repo: akrogon.

## Provenance
- GitHub: Tamdoma/akrogon#75
- Operator: chart door 2026-10-10, /chart-issues note (verbatim in issues/chart/deploy-path/INTAKE.md)

## Source: Tamdoma/akrogon#75
# Leaf plan schedules 13 serial live-session proof cases with no wall-time budget; seat estimated 30-60 min per case (about 6-13h)

Source: Tamdoma/akrogon#75
URL: https://github.com/Tamdoma/akrogon/issues/75

Unverified intake.

## Observation
Consumer repo `framework`, leaf `formspark-api/formspark-build-wiring`, phase `implement`, seat A busy 1h15m+ at the last observe. Seat A told the operator it would run the full proof in the background: 13 cases, "each taking about 30-60 minutes with the current timeout settings". The operator rejected a multi-hour leaf run.

What the files show:
- `plan.md` Verification table (rows 3-8) planned about 8 dispatch sessions, "minutes each", and says "Wave 4 dispatch sessions run sequentially". The runner now has 13 cases.
- The proof runner `.claude/workflow/scripts/run-formspark-build-wiring-proof.ts` runs the cases in one serial `for` loop in `main`, one real `claude` session each via `launchSkillSession`.
- `.claude/workflow/scripts/lib/session-trace.ts:12` sets `SESSION_TIMEOUT_MS = 1_800_000` (30 min). The seat's "30-60 min" matches this ceiling, not a measured run time. No per-case time was measured in the observed log.
- The plan's "Size" column holds words ("minutes", "seconds"), no numbers. `plan.md`, `brief.md`, the chart `CHART.md` and `seats.yaml` contain no wall-time or duration budget.
- The seat had already committed a fix to the proof harness itself (`fix(proof): mkdir scratch dir before planting call-log shim`).
- Observe line at `busy=1h15m` still showed `notified=` empty, though `src/next.ts` has `STALL_MS` = 60 minutes.

## Location
akrogon `chart-issues` handoff contract (`skills/chart-issues/assets/shapes.md`, implementer-audit paragraph near line 286) and `plan-issue` Verification table; `src/next.ts` stall notice (`observeBusy`, `STALL_MS`); consumer repo `framework`, leaf `formspark-api/formspark-build-wiring`.

## Reproduction
Seen once, in this leaf. Not provided for other leaves.

## Expected behavior
Not provided.

## Urgency
A leaf can hold its seat and its dependent for hours on proof runtime alone. Dependent leaf `formspark-build-wiring` blocks nothing else yet. Known workaround: the operator steered seat A (via `herdr agent prompt`) to run the cases concurrently and measure one case first.

## Suspected cause
Both reporter (operator) and agent view; agent hypothesis, not tested:
- Main condition: nothing in charting, planning or the audit asks for a numeric wall-time budget on proof. `shapes.md:286` requires proof to be observable and in an allowed form but sets no cost or duration bound, and states "no count, size or duration trigger" for prerequisite splitting. The brief's criterion 1 asks for a real dispatch of every blueprint path, so proof breadth grows with paths while cost is unbounded.
- Contributing: proof rows carry qualitative sizes, so an estimate has no baseline from a measured precedent (`run-offer-reservation-proof.ts` exists as one). Cases run serially with a shared consumer root, `CALL_LOG` env and lease, so concurrency is not the default. Rerun triggers ("every change", "blueprint/route change") re-run the whole set, so each proof-harness fix lengthens the loop.
- Sensor: the existing stall notice is a single fixed 60 min threshold that notifies only from `akrogon next`. During a watch that does not run `next` for a busy leaf, `notified=` stayed empty at 1h15m. It does not compare elapsed time with a leaf-specific budget.

Files read: framework `issues/open/formspark-api/formspark-build-wiring/{plan.md,brief.md,design.md grep,readiness.yaml grep}`, `issues/chart/formspark-api/proofs.md`, `.claude/workflow/scripts/run-formspark-build-wiring-proof.ts`, `.claude/workflow/scripts/lib/session-trace.ts`; akrogon `skills/chart-issues/assets/shapes.md`, `src/next.ts` (grep of lines 227-251 only), issue #51 body. The framework worktree copies are consumer files, not akrogon source.
Not inspected or would disprove: the measured wall time of one case (the real total may be well under 13h), seat A's reply to the operator's question, `plan-issue` skill text, whether `next` ran for this leaf and why `notified=` was empty.
Related reports: Tamdoma/akrogon#51 (closed): leaf phases had no duration ceiling and the stall notice only ran from `next`; this report adds the planning side (no proof time budget) and an observed `notified=` empty at 1h15m. Searches on `proof duration` and `wall time budget` in Tamdoma/akrogon (all states, limit 10) returned none; `stall` and `slow leaf` returned #51 and others about stall detection and merge-check load.

## Agent findings
- The instance runner is now parallel: framework worktree formspark-build-wiring commit 88adda0fc, pool of 10 consumer roots, per-session CALL_LOG (run-formspark-build-wiring-proof.ts:66-83,836-900). The serial-loop claim no longer stands. (B,C)
- Still standing: no numeric duration anywhere in chart, brief, plan or audit (plan-issue Size column is words; shapes.md:286 "no count, size or duration trigger"); no measured per-case time; 30 min is SESSION_TIMEOUT_MS, not a measurement. (A,B,C)
- Lock: issues/chart/leaf-run-stalls/CHART.md Off route "Any clock, watchdog, elapsed trigger or numeric size gate (locks, A,B,C)". An enforced budget reopens it; an estimate shown to the operator does not. (B)
- `notified=` empty at 1h15m: hooked `next` events touch only the pane's owning leaf; not traced whether a pass observed this leaf. (B,C)
- The leaf was 1h35m busy in implement at 2026-10-10 09:30Z.
