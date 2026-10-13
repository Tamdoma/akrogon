# Intake: idle-processes

## Operator notes (verbatim)
2026-10-13: "don't put any caps, it must not be the solution. The solution is killing idle processes, and figuring out how to make the tests better."
2026-10-13, replying "yes" to A's proposal to chart I1-I3:
- I1. `akrogon status` shows only the cwd's repo (operator could not find 9 framework leaves).
- I2. No signal when processes leak: 57 browsers (~19 GB, ~6 cores) sat in akrogon.slice unnoticed.
- I3. A leaf's leftovers outlive the work that started them (crawl-run-binding had 61 idle shells up to ~4.4 h old, plus zombies).
