# Timeout cause: merged A and B

## Agreed facts
- M1 (A,B) Cause: a request-lifecycle race in the capture code (`unchanged-output.ts@ab700d4cc:507-534`). A resize starts a srcset image load, the next `goto` cuts it off, Chromium sends no terminal event, and `body()` never settles. Fixed by framework commit 2cb00d537 (16:06 UTC), about 3 h after the incident. High confidence.
- M2 (B) Limit: the noon runs themselves were not traced. The cause rests on a same-revision trace, identical capture code on base and leaf, matching srcset fixtures (01, 04, 07, 13), and exactly one 300 s wait per ~478 s run.
- M3 (A,B) Load: after the fix, three parallel whole-file runs ran twice, 239/0, about 182 s each, the same as idle runs. This is not a measured maximum and does not cover three full `framework:verify` runs at once (B).
- M4 (B) Collisions: this path uses port 0, `mkdtemp` profiles, a fresh browser per capture, and no Wrangler, Miniflare or browser-core socket. No collision evidence. Journald 12:00-14:30 UTC shows no OOM, IO error or hung task, and no sysstat history exists.
- M5 (A,B) Base verdict: base ab700d4cc really carried the hang, so "red on base" was true. (B) The first base run was killed after about 25 min without final counts, so the rule reached a true verdict from an incomplete run.

## Disagreement
- D1 Slot: (A) no evidence that load fails a test on this host, so the heavy-run slot has no current need; move it to Off route and reopen on a traced load failure. (B) keep the agent-run slot the operator chose, but set its count from a measured workload, not 1 and not a guess from 32 threads and 123 GB.

## Optional measurement (B)
15-20 min, only with operator approval and no active leaves: pre-fix and fixed whole-file deploy-core runs at concurrency 3 (and 4, plus 3-5 min), with protocol logs and per-second CPU, memory, IO and PSI sampling.
