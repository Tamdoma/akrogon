# Map: slot A (blind)

Inspected 2026-11-22: src/run-check.ts (no paid or count notion; `runCheck(cwd, name, leaf, holder, argv)`), src/akrogon.ts `run-check` case, src/config.ts `globalSchema` (strictObject; slots incl. consultant), src/readiness.ts `grantSchema` (read by status.ts/turn.ts only for `gaps(inputs)`; no code reads `grants` or `bounds`), skills/*/lifecycle-rules.md (4 identical copies) `## Grant reuse and count lines`, check-issue SKILL `## Shared context` operator-only paragraph and the `check.review` "launches no covered operation ... audits the leaf's count" paragraph, check.repair B-repairs paragraph, chart-issues SKILL `## Take` grant paragraph, autopilot.md waits paragraph. `akrogon status`: no open leaves.

## Forks

F1 Ceiling: shape and absence. (a) machine `~/.akrogon/config.yaml` `budget: {sessions_per_day, minutes_per_session}`, absent = 0, so a paid launch refuses with "set budget" (one path, no fallback); (b) absent = old per-leaf grant path (two paths forever); (c) per repo. Pick (a). Breaks later: nothing reads two paths; an install without the key gets one clear refusal instead of a silent default.
F2 Counting: (a) `akrogon run-check --sessions <n>` declares the paid sessions a launch may prompt, appends to a machine ledger, refuses when today's total plus n passes the ceiling, and kills at minutes_per_session x? (timeout is its own question); (b) seat-written count lines as today. Pick (a): a per-day total across leaves and the watch cannot be known from per-leaf prose; removes count lines, "unknown prior use", renewal entries and the review's count audit. Cost: one flag and one ledger file. Risk: a seat that omits `--sessions` on a paid launch; the review reads paid activity against ledger rows (already a Fix today).
F3 What's left of `grants[]`: (a) only outside live changes, destructive/public/billing/DNS, new identity or target (S2); paid launches on logged-in accounts and local cleaned writes need no grant; schema unchanged; (b) keep grants for paid launches with seat-written `approved.by: seat`. Pick (a): removes the per-leaf grant for the common case; no fake approvals (classifier, B R1). Standing authority text lives once in lifecycle-rules; setting the ceiling is the operator's approval of it (Needs N1+N2).
F4 Sufficiency floor (S5): one paragraph in lifecycle-rules; standing-design's fresh-call line points at it; check-issue may ask a fresh run only by naming a concrete behavior no recorded run on current inputs shows; wording-only never.
F5 Door: autopilot.md "a mutating or paid proof call ... waits for the operator's grant approval" narrows to outside live changes; SKILL `## Take` grant paragraph narrows the same way and its "door itself never warns and runs" goes; needs sheet drops "paid or nested launches, paid budget" rows; charting probes draw on the same ledger.
F6 Per-session time limit: run-check enforcing minutes (kill) vs seat's own timeouts as today. Open.
F7 Old leaves: no open leaves now and no code reads bounds, so no migration; closed records stay as history.

## Surfaces and removable redundancy

lifecycle-rules (x4): count lines, warn-past-bound, unknown prior use, stop-vs-warn clause go; red-launch gate stays. check-issue: count audit paragraph shrinks to "paid activity has ledger rows"; Operator actions for a ceiling or stop_line only. chart-issues SKILL `## Open` needs list, `## Take` grant paragraph, `## Handoff` live-run line (stays, information). autopilot.md waits paragraph and "never ... raises an existing bound". standing-design fresh-call line ("A fresh call runs only under a covering grant" -> under the ceiling). shapes `### readiness.yaml` bounds example. docs/use/autopilot.md, watch-while-away.md, reference/limits.md, checks.md, files.md, plan-work.md, quick-fix.md (grep "grant").

## Pitfalls

Self-serving "budget-only" label (S5 floor + machine fact: the ledger shows the run hit the time limit or ceiling, not a check exit). Shared subscription quota with the operator's own sessions (per-day ceiling). Cleanup debt (cleanup before the next launch stays required). Prose in 4 copies drifting (edit all, agreement already identical).

## Split

One leaf, or two: L1 code (config key + run-check flag + ledger + refusal; free tests: under passes, over refuses, absent refuses, deliberate break) then L2 prose (blocked-by L1, names the flag). Real dependency: prose cites the flag.

## External operations

None paid. Free observation: none beyond the repo's own test runner.
