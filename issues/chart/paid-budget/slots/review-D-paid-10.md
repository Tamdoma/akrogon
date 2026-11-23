# Slot D review of paid-budget, round 10

**Verdict `fix`** for `061cfa66` on `ddff2ddc`.

- **F18 · `tests/e2e/watch-consults-body.ts:38–53,201–208`.** Assigning events by order can corrupt attribution and the count. I rejected the first shimmed consultant request, let the second create `t2`, then launched `t3` directly with the same consultant label. The ledger assigned `t2` to the failed request and `t3` to the second request. It reported three sessions. Under the chosen rule the watcher request, both consultant requests, and the unannounced launch total four. Carry the request ID through to launch evidence so each event can be matched or counted on its own.
- **F19 · `tests/e2e/watch-consults.e2e.ts:60–68,90–121,134–135`.** A refused run can erase an active run's evidence and ownership marker. I started two judges with separate leaf temp directories and the same output directory. The first owned the core and had started its watcher when the second cleared the shared files and refused startup. The first then reported stage `none`, zero sessions, and empty absence while leaving its runtime and state behind. Give each invocation its own control files.
- **F20 · `tests/e2e/watch-tier.ts:125–129`, `tests/e2e/watch-consults.e2e.ts:103–121`.** A cutoff between creating the runtime and writing `owned.txt` leaves the runtime behind even with a private output directory. I paused the body immediately after its successful `mkdir`. The judge killed it at the deadline and reported empty absence while the run's runtime remained. Acquire and track ownership in the judge so killing the body cannot lose it.

The original F14–F17 replays passed. A held watcher reply counted one session, and a held consultant event counted two including the watcher. A sequential retry reported its own outcome and usage. A refused startup with a separate output directory preserved the other run's state and real service. A delayed real scope launcher was killed before it could register.

Typecheck, `git diff --check`, and 117 focused tests passed. The supplied logs report eight deadline cases, 1,376 suite tests, and 485 repeat tests passing. The live probes used private sessions and stand-ins.
