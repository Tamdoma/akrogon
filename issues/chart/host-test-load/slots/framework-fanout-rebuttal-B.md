F1: Remove the (B) attribution for “409 Chrome processes are a few dozen browsers”. I established no process-to-browser ratio. `framework-fanout-B.md`, E2 and R1, distinguishes ten capture instances from the suite's process peak without estimating total instances.

F2: “Sequential capture exceeds the harness timeout” is a source comment, not a measured result (`site-nav-e2e-run.ts:552-554`). The current child timeout is 780000 ms (`site-nav-e2e.test.ts:33`). Preserve the parallelism rationale without claiming a proven serial-time comparison.

F3: Ceiling engagement alone should not trigger a framework chart. CPU throttling and MemoryHigh reclaim are intended control behavior. Keep their counters as diagnostics, and revisit fan-out on reproducible timeouts, material slowdown or harmful sustained pressure attributable to concurrency. Repeated known-red timeout records warrant investigation but do not establish that cause.
