# Blocked report, merged notes (A, B)

## Agreed
- Manual selections report: `next <name|path>`, typed bare `next` and `next --all`. Classification follows the repo-pause lock (event JSON or --resume = automatic), never leaf count or HERDR_PANE_ID. (A,B)
- Automatic passes stay quiet for expected waits: Herdr events, --resume, mergeWake. Real errors (parse, missing record, foreign repo, delivery) keep reporting on every path. (A,B)
- Only the leaves the operator selected report. Dependents started after a completion and mergePass work are not selected and stay quiet, even inside a manual pass. (A,B)
- One diagnostic per blocked selected leaf, naming every unmet dependency with its phase, or parked, missing, or unreadable. A merged closed dependency satisfies. Parked detection by name, never by parsing parked state (src/state.ts:146-158). (A,B)
- Ready siblings still start. Any report sets exit 1 (src/next.ts:1341). Dedupe by selected slug (src/next.ts:111-118). (A,B)
- Merge turn, capacity and busy seats are never reported. (A,B)
- Blockers are read at the moment that leaf's dispatch is attempted, from current inventory. (B) A agrees.
- eligibility() keeps its truth value and readiness priority. Richer blocker data must not change merge order. (B)
- Evidence: src/next.ts:1247-1257 one leaf explicit, many sweep; :634-643 errors only when explicit; GNU make -k and Gradle --continue run independent work and still fail the command overall (B).

## Differ
- Missing inputs and failed phase.
  - A: report both for selected leaves. Missing inputs already error for a single target (src/next.ts:639-644). Leaving folders silent keeps the exact unevenness #59 complains about: a one-leaf issue errors, a two-leaf issue stays silent. Failed is silent even for a single target (src/next.ts:622) although docs/guide/in-practice.md:39 says failed needs recovery first.
  - B: deps only. #59 asks for dependency diagnostics, not a general wait reporter. Inputs and failed are a scope expansion for the operator. Keep today's single-leaf input refusal and the failed skip.
