# Map, merged (A,B,C)

Maps: slots/map-A.md, slots/map-B.md, slots/map-C.md. Signposts 1a 2a 3a 4a 5a 6a bind.

## Facts

- (A,B,C) `src/flaky.ts` `failedTests` reads only Bun's `(fail)` line and otherwise returns a shared placeholder. Its callers are `flips`, `knownRedReceipt` and `newRedUnits` (twice). `knownRedReceipt` already requires every head name among the base names, so a richer name set tightens the compare with no new compare code.
- (A,B,C) Bun's fan-out prints `<script> | Exited with code <n>` for each failed script, padded, nested as `<outer> | <inner> | Exited with code <n>`, with the wrapper printing its own line too. (C) In framework's ledger 90 of 90 readable red logs with no `(fail)` line hold such a line; akrogon's own 63 nameless reds (`format`, `typecheck`) hold neither.
- (B,C) Mixed logs are real: 23 framework logs hold a `(fail)` name on one stream and a failed script with no name on another, which today drops the script silently. So script names cannot be a whole-log fallback.
- (C) The same script moved between wrappers across flips (`rest-c | test:remote-image` once, `rest-d | test:remote-image` 8 times), so the wrapper chain is not a stable identity.
- (B,C) Both `(fail) (unnamed)` logs carry the script prefix on the same stream.
- (B,C) The seat judgment lives in two texts, not four: `skills/lifecycle-rules.md` (`## Red check with no cause in the leaf's diff`), symlinked into three skills, and `skills/chart-issues/assets/direct-route.md` landing step 3.
- (A,B,C) `verifyRunSchema` is a strict object with no failure names. (C) An older akrogon rejects rows that carry a new field, so a rollback after the change fails to parse the ledger. (C) A blocked entry shares its blocker's log and exit, so it must store no names.
- (A,C) `src/evidence.ts` `locate` returns no match for a recorded path outside its `issues/` grammar even when the file exists; akrogon's ledger has 3 such rows, 2 with the file still on disk. (B) `readLogAcross` relies on a miss to keep cross-repo lookups unambiguous.
- (C) The check log is stdout followed by stderr, not time-ordered across the two; Bun writes both line kinds to stderr.

## Forks

One fork, [identity rule](../forks/identity-rule.md), four questions presented together: the name grammar, what the seat may take as proof, the stored names, and reading a log that still exists outside the `issues/` grammar.

## Split (A's answer under full autopilot)

One issue `failure-identity`, two leaves (A,B; C's 3-leaf variant matches). `failure-names`: grammar, the compare it tightens, flaky and notice output, the two seat texts, the existing-file read. `stored-failure-names`: the record field and its readers, blocked by `failure-names` because a stored name must come from the new grammar. C's separate `holder-log-read` leaf is folded into `failure-names` unless the fork picks a change in `src/evidence.ts` itself.

## Differences

- (C) wants a bare hook timeout qualified by its test file header; (A) by its script only; (B) open.
- (C) wants the check-level marker renamed with a kind tag; (A) keeps `(no test name)`.
- (B) raises whether a parser change may regroup stored history; (C) picks stored-first for reporting.
- (C) widens `readLog` and `readLogAcross`; (B) warns about owner priority; (A) reads the recorded file in the name reader only.
