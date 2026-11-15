# Signposts angles, slot A

Written 2026-11-11 before reading B or C.

1. Does the operator's 2026-11-09 answer 3a (known-red-nameless: the command checks function only, the seat judges the cause) reopen, so the command itself refuses a nameless head that differs from its base?
   - 1a (recommended) Narrowly: the command compares a failure identity it can read as a fact (which script or check failed), and the seat still judges the cause. No output normalizing.
   - 1b Keep 3a whole: only reporting gets better names; the known-red compare stays as it is and the seat stays the only guard.
   - 1c Reverse #133: a red with no name is never covered again.
   - Steers: whether `knownRedReceipt` and `newRedUnits` change, the seat texts, which existing tests change.

2. Where may a failure name come from?
   - 2a (recommended) Only from generic facts akrogon can read in any repo with no setting: Bun's `(fail)` line, Bun's fan-out line `<script> | Exited with code <n>`, and the check's own name and exit. No parsing of a repo's custom `[FAIL]` text (the report's planted-control trap).
   - 2b A consumer setting: a pattern per check in config.
   - 2c akrogon learns more formats (Playwright titles, `[FAIL]`, tsc, lint).
   - Steers: parser size, whether the earlier 4a (no new configuration) holds, upkeep.

3. Receipts whose log is gone.
   - 3a (recommended) From now on the run record keeps the failure names when the run is written, so retiring evidence loses nothing. Old entries stay `(log gone)`.
   - 3b Also backfill framework's 36 old entries from its Git history.
   - 3c Leave it: evidence retirement is the consumer's choice and the names go with it.
   - Steers: `verifyRunSchema`, reader fallbacks, whether a leaf touches another repo's records.

4. Reach.
   - 4a (recommended) All three consumers of the name follow one rule: `akrogon flaky`, `verify --known-red` and the red-main notice grouping. Landing in akrogon only. Framework's own flaky scripts (`test:remote-image`, 8 flips) are recorded for framework, not fixed here.
   - 4b Reporting only (`akrogon flaky`).
   - 4c Also open the framework fix for `test:remote-image`.
   - Steers: owned surfaces, leaf count, destinations.

5. When wins pull apart, what ranks first?
   - 5a (recommended) A wrong pass at the merge gate first (two different failures judged the same), then a readable name for the merge owner, then old receipts. Fewer parts breaks ties.
   - 5b Readable names first, because that is the observed cost (8 unnamed flips, no fix leaf).
   - Steers: split order, which leaf is the prerequisite, what gets cut if proof is short.

6. Proof spending (same as the last sessions).
   - 6a (recommended) No paid calls and no live changes. Local tests on isolated fixtures; framework's real red logs are read only, as recorded samples.
   - 6b One live replay in framework.
   - Steers: needs sheet (none), proofs, grants.

Needs foreseen: none. No key, login, file, grant, paid approval or operator-decided close.
