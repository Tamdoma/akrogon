# Merged opening map (A, B, C)

Slot tags name the slots whose blind maps support a line. Window Sep 21 to Oct 12 2026. A's scripts: `scratchpad/door/A-work/`.

## Facts

- M1 (A,B,C): The lifecycle shape is not slow. Akrogon, 106 leaves: median end to end about 0.4 h, merge about 2.5 min, 3 ejections. Framework, 239 leaves: median 3.0 h from first log row (plan excluded), p90 11.4 h.
- M2 (A,B,C): Implement time per size did not change across regimes. Everything after implement did. Before full `framework:verify` became a merge gate (Oct 2 11:43Z): post-implement median 17 min (small leaves 8), merge median 3 min, ejections 0.01 per leaf. Oct 2 to Oct 10: post-implement median 190 min (small 112), merge 108, ejections 0.77. Oct 10 to Oct 12: 90 (small 39), ejections 0.25. After #87 (n=4): 33, 0 ejections (B: one verify still failed then passed on retry).
- M3 (A,B,C): Merge is the biggest time sink: 37% of logged phase time (A). B: 245 of 436 merge-phase leaf-hours were waiting for the merge turn, not running. C: up to 14 leaves queued at once.
- M4 (A): Ejection causes, 90 rows, Haiku classification with low confidence on many rows: leaf defect 17, environment (mostly missing renderer deps like markdown-it in fixtures Oct 2 to 7) 25, stack/rebase interaction 15, flaky 10, red base 3, unknown 20. (B) audited the 8 since Oct 10: 5 leaf defects, 2 newer-base integration, 1 unattributed timeout.
- M5 (A,B,C): Chunks are a small cost. A: inside implement, 61% of time is waiting on workers; the seat's own time is 7 min with 1 worker and 29 min with 6+, about 4 min per extra unit. B: 1,041 worker runs on 226 leaves; of multi-worker leaves 137 overlapped and 66 ran serially, so most are not chained. C: no per-brief tax visible in aggregate. Watch agent's "10 to 20 min per chunk, most chained" does not hold window-wide.
- M6 (B,C): Watch agent's "about 2 h fixed cost per leaf" is an Oct 2 to 9 artifact. Healthy-week small leaves cost 8 to 17 min after implement.
- M7 (C, A checked config): Framework `checks` run parity and contracts 3 to 4 times per pass (`parity`, `contracts`, again in `test`, again in `cheap`). Flagged Oct 1 in akrogon chart `check-reruns`, still open.
- M8 (A,B,C): #87 (`test_changed: bun run test:changed`) is live but uncommitted in framework `issues/config.yaml`. A reset loses it. (C: the old line ran parity+contracts, not a no-op.) (A): `test:changed` selects all 138 scripts when a shared doc changes, so it often runs everything (skip-advances-phase log).
- M9 (A, corrects C): Batches are empty mostly because nothing waits. Since Oct 10, 32 of 41 merge attempts started with only the holder in merge. 9 attempts had 2 to 5 leaves in merge and only one carried a member. Why those 9 carried none is not traced.
- M10 (A,B,C): Plan time is mostly invisible to the log. A and B both measured about 4 to 9 min median from transcripts (debate off).
- M11 (B): Test runs have no complete record. Run-check logs exist for about 21 leaves since Oct 10: median 13 per leaf, max 43. Full verify runs 5.4 to 8.6 min.

## Forks (positions)

- D1 Where does broad testing run? (A,B,C) Leaf runs a real affected-test selector, merge keeps one full verify on the landed top. (C) commit #87 and measure 20 leaves. (B) explicit consumer coverage for shared hooks before narrowing the selector.
- D2 Dedupe framework checks. (A,B,C) Make each check name run distinct work. Framework repo decision.
- D3 Chunks vs leaves. (A,B,C) Not leaves-as-chunks now. (B,C) whole-leaf brief for chained units, keep parallel waves. (C) revisit leaves-as-chunks when small-leaf check+merge stays under about 45 min.
- D4 Merge throughput. (B,C) Make batching actually carry members. (A) Queue is mostly 1 deep since Oct 10, so batching is not today's lever; the Oct 2 to 9 queue was driven by ejections.
- D5 Measurement. (C) log pass start and leaf creation; a weekly readout of ejections, merge-visit median, attempts per merged leaf. (B) one evidence owner per integrated revision, rerun only affected proof after edits.
- D6 Review depth. (C) keep two-seat review; cost sits in fix loops downstream of D1.

## Differences

- C says batching is broken (40 of 41 solo). A finds the queue was 1 deep for 32 of 41.
- B treats environment ejections as rare (8-row recent sample). A's 90-row classification says environment was the largest class in Oct 2 to 7.
- B counts duplicate proof across seats (worker, lane, seat final, B repair) as a target; C focuses on duplicate checks inside one pass.
