# Rebuttal B: fork seat-root (codex-seat-scope)

No misstatements of my position. Two position updates and one disagreement.

## 1. I withdraw O1 in favor of O2 — agreeing with A's lean

Re-examined against the lock: the closed design rejects "a parent test at spawn" by name. The lock clause opens only when the bash-wrapped chain shows the design *cannot hold*; it is not a license to pick any fix. O2 is a conformant member of the design's own family — an env marker plus a pid equality check, the same idiom the design already uses (`toolShellAlive`, pid plus start time). O1 requires reading `/proc/$PPID/cgroup`, a parent test at spawn, squarely inside the rejected line. Since O2 exists, the correct reading is: the design holds with its predicate extended in-kind, not revised against its own rejection. The parent-outside fact I probed remains true and useful as an explanation of *why* the seat pid is unique in the scope, but it should stay out of the mechanism.

I verified O2's core mechanic in a probe (free, cleaned): `sh -c 'export AKROGON_SEAT_PID=$$; exec "$0" "$@"'` — the trampoline pid survives the exec into the chain root (`match=yes`) and a nested bash differs (`match=no`).

## 2. Disagreement: O3's escape window is not a close call

The merged open question frames "startup-window escape acceptable (D) or regression of tool kill" as open. It is not. O3's window is real and recurring: it sits inside the agent's first task, which is exactly when tool shells spawn — every leaked shell escapes the phase-move kill until leaf close, the original incident's failure shape, silently. O3 buys in exchange coverage for fork-and-wait wrappers, a chain shape no observed harness has. Trading a real, silent, recurring hole in the mechanism the whole design exists to provide, for hypothetical coverage, fails the removing-the-class test in the wrong direction. O1/O2 leave fork-style chains failing loudly at dispatch, which is the correct behavior for an unsupported shape.

## 3. Small sharpening of O2's unset-marker rule

The merged "unset means place as today" rule deserves one explicit caveat for the fork decision: after the fix lands, unset can only mean a pre-fix seat (whose chain is already done), so placing-as-today is correct and the rule is safe. But it must not silently extend to a *set* marker: once the marker exists, an unmatched pid means move, with no exception — no fail-open path. The test should pin both directions: unset places, set-and-equal exempts, set-and-unequal places.
