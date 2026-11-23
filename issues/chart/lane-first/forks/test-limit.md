# Fork: per-test time limit

## Question
Why 30 s? Bigger, none, or adaptive per PC? (operator, 2026-11-22, INTAKE "test limits")

## Taken
A under autopilot, 2026-11-22, from B (slots/limits-B.md) and C (slots/limits-C.md), who agree:
- One fixed limit, 120 s, set once in the test preload (setDefaultTimeout). No per-test numbers. 283 runs: 289 limit firings, 0 real hangs; slowest honest pass 60.8 s on 8 cores.
- Inner waits = limit - 30 s (90 s), so setup plus a hung wait ends before the limit and cleanup runs (D caps round 2).
- No adaptive limit: the PC-dependent knob is tests in flight, not the timeout. Load at start does not predict load mid-run; history-based limits need k=52 x median.
- No --bail: it would cut the failure list land-own-reds compares with base rows.
Proof: V1-V5 in slots/limits-B.md (0 limit hits in the next 100 full runs, wall p50 near 69 s).

## Known limit

Inner waits get WAIT_MS from when each wait starts, not from test entry. A test whose setup exceeds 30 s before a hung wait still leaks past the 120 s limit (D caps round 3). Base had the same class at 15 s. A per-test deadline needs per-test state bun:test does not expose under concurrent tests.
