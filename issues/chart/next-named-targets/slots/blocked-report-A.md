# Blocked report notes, slot A (written before reading blocked-report-B)

## Q1 Which invocations report
Pick: every manual selection reports: `next <name|path>`, typed bare `next` (selects the cwd folder, src/next.ts:1173,1194-1197) and `next --all`. Automatic passes stay quiet: Herdr events, `--resume`, dependents started after a completion and mergePass. Reuse the classification locked in repo-pause boundary Taken (event JSON or --resume means automatic). Cascaded leaves are not "selected" and never report. Cost: `next --all` from the root exits 1 whenever any dependency chain is waiting, so exit 1 there means "something needs a look", not "something broke".
Rejected: named target only (typed bare `next` inside an epic folder selects the same leaves as `next <epic>` yet would stay silent); every invocation including hooks (each Herdr event would log expected waits as errors).
Evidence: better-than-training, src/next.ts:1247-1262 one leaf is explicit, several sweep; :629-647 explicit throws for deps and inputs, sweep returns waiting; :1341 any report sets exit 1. Intake #59 asks for every selected leaf, single or folder.
Pitfalls: a repo-wide sweep reports the same blocked leaf twice when a cascade also visits it (report() dedupes by slug, src/next.ts:111-118, keep that). Ready leaves must still start before or after the report (report never aborts the loop).

## Q2 Which wait reasons count
Pick: unmerged dependencies (requested), missing inputs and failed phase. Each needs an operator action or another leaf to finish, and the leaf never starts on its own. Missing inputs already error for a single target (src/next.ts:639-644), so this extends today's rule to folders. Failed is silent today even for a single target (src/next.ts:622), although docs/guide/in-practice.md:39 says failed leaves need recovery first. Not reported: merge turn, capacity and busy seats. Those clear on their own.
Each blocker names its slug and its phase, or `missing`, or `parked` (detected by name under issues/parked like missingLeafMessage, src/state.ts:146). A missing dependency joins the same report instead of the separate "Missing or unreadable leaf" throw (src/next.ts:629-632). One line per blocked leaf lists every reason that applies.
Rejected: deps only (a selected failed leaf stays silently stuck, the same complaint as #59).
