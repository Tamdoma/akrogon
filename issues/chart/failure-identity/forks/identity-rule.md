# Identity rule

## Question

Q1. What names does the reader return for a red log?
- 1a Per stream. A real Bun `(fail) <title>` stays as it is. A failed innermost script whose stream printed no `(fail)` line becomes `(script) <script>`. A bare `(fail) (unnamed)` becomes `(unnamed) <script>` when its stream has a script and stays `(unnamed)` otherwise. Wrapper scripts are dropped and only the innermost script token is kept. A log with none of these keeps `(no test name)`.
- 1b As 1a, but a bare hook timeout is qualified by the test file header printed before it, and the check-level marker gets a kind tag such as `(check) <name>`.
- 1c Every failed script is always named, next to any `(fail)` titles, with the full wrapper chain.

Q2. What may the seat take as proof that head and base failed the same way?
- 2a `knownRedReceipt` keeps its compare (every head name among the base names; a head log that is gone never covers). The two seat texts say: the whole two-log causal read is required whenever any red name on the head is not a real test title, meaning `(script) ...`, `(unnamed) ...` or `(no test name)`. Only a head whose red names are all real test titles also failing on the base takes the named branch.
- 2b A script name counts like a real test title.
- 2c The command also refuses a script that ended by a signal.

Q3. Where do stored names live and who reads them first?
- 3a One optional field on an executed red command entry in the run record, written when the run is written, from the live log. `flips` and `newRedUnits` read it first and fall back to the log for rows without it. `knownRedReceipt` always reads both real logs with the current reader.
- 3b The log is read first everywhere and the stored names are used only when the log is gone.
- 3c A separate index file.

Q4. How is a log read that still exists but sits outside the `issues/` path grammar?
- 4a The name reader opens the recorded path when that file exists and otherwise uses `readLog` as today. `src/evidence.ts` and `akrogon log` do not change.
- 4b `readLog` and `readLogAcross` gain the plain-file fallback, guarded so cross-repo lookups stay unambiguous.
- 4c Nothing: stored names (Q3) cover every future row, and the 2 old akrogon rows stay `(log gone)`.

### Carries

- Signposts: forks/signposts.md, A's picks 1a 2a 3a 4a 5a 6a.
- Lock: issues/chart/known-red-nameless/forks/coverage-rule.md `## Taken` (a nameless head is covered only by a nameless base of the same command; a gone log never covers; a blocked check is never reported as passing; the leaf's own done-criteria proofs must pass on their own).
- Map: slots/map-merged.md.

## Findings

Notes: slots/identity-rule-A.md, -B.md, -C.md; merged slots/identity-rule-merged.md; rebuttals slots/identity-rule-rebuttal-B.md, -C.md; final shape slots/identity-rule-final-shape.md with checks slots/identity-rule-final-check-B.md, -C.md.

Research (better-than-training unless said):
- R1 `src/flaky.ts` `failedTests`, `src/verify.ts` `knownRedReceipt`, `newRedUnits`, `verifyRunSchema`, `runOnce`, `src/evidence.ts` `locate`, `readLog`, read 2026-11-11 (A,B,C). The compare already requires every head name among the base names, so new names tighten it with no compare change.
- R2 framework ledger and its 254 readable red logs, read-only, 2026-11-11 (C): 90 of 90 logs with no `(fail)` line hold `<chain> | Exited with code <n>`; 23 logs mix a `(fail)` title on one stream with a failed script on another; `test:remote-image` moved from `rest-c` to `rest-d`. Changed the question: script names cannot be a whole-log fallback and the wrapper is not part of the name.
- R3 operator tier, INTAKE.md `## Observation`: free-text `[FAIL]` is printed in green runs. Changed the question: structure only.
- R4 no outside practitioner source was searched: the questions are about akrogon's own mechanism and Bun's printed lines, answered by the code and the observations below.

Observations run before handoff (free, read-only or throwaway, no cleanup beyond deleting a scratch folder; identity: the operator's local shell user, no credential):
- P1 Bun fan-out lines. Command: `bun run all` in a throwaway package whose `all` runs `bun run --parallel --no-exit-on-error grp-a t:ok` and `grp-a` runs four scripts (one exits 3, one failing `bun test`, one hook timeout, one killed by SIGTERM). Bun 1.4.4, 2026-11-11 (A). Result on stderr: `grp-a | t:custom | Exited with code 3`, `grp-a | t:named  | (fail) named > breaks [0.18ms]`, `grp-a | t:named  | Exited with code 1`, `grp-a | t:sig    | Signaled: SIGTERM`, `grp-a | Exited with code 3`. Without `--no-exit-on-error` the healthy siblings printed `Signaled: SIGINT`. Cleanup: scratch folder removed with the session scratchpad. Limits: one Bun version; proves the line shapes exist, not that every consumer script uses Bun's fan-out.
- P2 recorded `(fail) (unnamed)` line. Command: `akrogon log issues/open/dilutor-overlap/dilutor-rebalance/implementation/check-verify-1793306012300-1260164.log` in framework, filtered for `(unnamed)` and `Exited with code`, 2026-11-11 (A; B found the run). Result: `framework:verify:rest-a      | test:emdash-kit     | (fail) (unnamed) [7668.89ms]` twice, `framework:verify:rest-a      | test:emdash-kit     | Exited with code 1`, `framework:verify:rest-c      | test:variant-parity                        | Exited with code 1`, and both wrappers' own exit lines. Limits: a recorded log; the Bun version that wrote it is not recorded.
- P3 strict schema. Command: `bun -e` parsing one row with `failures: ['a']` on a command entry through `verifyRunSchema.safeParse` at akrogon main 97e88038, 2026-11-11 (A). Result: `false`, `unrecognized_keys ["failures"]`. Limits: shows today's reader rejects the field, which is the stated rollback cost; says nothing about the new reader.
- P4 framework red logs, shapes of the exit line. Command: a read-only script over framework `issues/verify-runs.jsonl` rows ended after 2026-10-28 with a plain log on disk (15 red entries), 2026-11-11 (A). Result: one-level `lint                                 | Exited with code 1` and nested `framework:verify:rest-d      | test:remote-image                              | Exited with code 1` with the wrapper's own line. Limits: 15 entries.

Standing dissent: B, Q1, the script and the source kind should stay in the comparison identity of real titles too (same title in two scripts compares equal; a title spelled like a marker collides). B, Q4, prefers 4b so `akrogon log` reads the same path. C: no disagreement.

## Taken

A's picks under full autopilot (2026-11-11T21:50:47Z, door t126), not operator words: `1a 2a 3a 4a`. Checked by B and C as one final shape; both checks found wording defects in item 5 and in the hook-timeout sentence, corrected below as restatements, and no other defect.

Reasons. Q1 1a: signposts 1a and 3a, a certain coarse name from lines Bun prints, real titles keep their history. Q2 2a: signpost 2a, the command compares facts and the seat still judges the cause; a coarse name never proves by itself. Q3 3a: signpost 4a, one optional field and no second file. Q4 4a: signpost 5a with the fewest parts; C showed a known-red run with a holder outside the grammar fails today right after it ran.

Rejected. 1b (file headers, renamed check marker): state for 2 logs. 1c (every script, full chain): doubles flips, splits history. B's 1d (script and kind on real titles): renames every existing series for a case outside #134; kept as stated cost. C's `Signaled:` as a name: Bun prints it for healthy siblings it stopped (P1). 2b: a script holds many checks. 2c: signal lines are ambiguous. 3b: every report keeps unpacking archives. 3c: a second file. 4b: a change in the shared reader and a third leaf for plain files that can be read directly. 4c: leaves the holder case broken.

Binding shape, carried verbatim into the leaves:

Lines marked [corr] differ from the option text in forks/identity-rule.md.

## Q1 names (leaf failure-names)

The name reader returns, for one red log:

1. Each real Bun title from a `(fail) <title>` line, unchanged and without its script prefix, as today.
2. `(unnamed) <script>` for a `(fail) (unnamed)` line whose stream has a script prefix, and `(unnamed)` when it has none.
3. `(script) <script>` for each failed script, read from `<chain> | Exited with code <n>` with n not 0, whose own stream printed no `(fail)` line. `<script>` is the innermost token of the chain, trimmed.
4. [corr] A failed chain that is a strict prefix of another failed chain is a wrapper and is dropped. Whether a stream printed a `(fail)` line is matched on the whole trimmed chain before the innermost token is taken.
5. [corr] A `Signaled:` line is ignored and gives no name. An accepted ancestor `Exited with code` line may give a coarse name; the log gets `(no test name)` only when no accepted name remains anywhere in it. (reworded after the check, B,C)
6. `(no test name)` when the log yields none of the above; `(log gone)` when no log can be read. Both unchanged.
7. [corr] A line that starts with `(fail) ` is unprefixed even when its title contains ` | (fail) `.
8. Names are deduplicated. No name comes from free text.

Stated cost: the same real title failing in two different scripts compares equal, as today (B's dissent). Two bare hook timeouts in one script share one name. A script that died by a signal with no failed wrapper, beside a named failure on another stream, adds no name, so that head takes the named branch as it does today (C's check, kept as cost: Bun prints the same line for healthy siblings it stopped).

## Q2 proof (leaf failure-names)

- `knownRedReceipt` and `newRedUnits` compare code does not change. The new names alone make a head red in script X uncovered by a base red in script Y.
- [corr] In `skills/lifecycle-rules.md` (`## Red check with no cause in the leaf's diff`) and `skills/chart-issues/assets/direct-route.md` (landing step 3): the branch "the log names no test on the head and on the base" becomes "any red name on the head is not a real test title, meaning `(script) ...`, `(unnamed)`, `(unnamed) ...` or `(no test name)`"; that branch requires the existing whole two-log read. Only a head whose red names are all real test titles that also fail on the base takes the named branch.
- [corr] One sentence in both texts: tests or hooks that timed out inside a run that ended with the runner's own summary are the command's own verdict, not a killed, timed-out or crashed command.
- Unchanged: a gone log never covers; the refusal cases of coverage-rule; the blocked-check exception; the leaf's own done-criteria proofs.

## Q3 stored names (leaf stored-failure-names, blocked by failure-names)

- [corr] `verifyRunSchema` command entry gains optional `failures`: a non-empty deduplicated string array holding exactly what the name reader returns for that entry's live log at write time. It is written only where the command itself ran and exited non-zero: never on `blocked`, `reused`, exit 0, or an entry pushed because setup failed, and never holding `(log gone)`.
- `flips` and `newRedUnits` use `failures` when present and the log otherwise. `knownRedReceipt` never reads `failures` and always reads both logs with the current reader.
- Rows without the field parse as today.
- Stated cost: an akrogon older than this change cannot parse a ledger holding the field.

## Q4 existing log outside the grammar (leaf failure-names)

- [corr] In the name reader only: `readLog` first; on its no-match result, read `resolve(repo.root, recorded)` when it is a regular file; otherwise `(log gone)`. `src/evidence.ts` and `akrogon log` do not change (B's dissent: 4b).

Pitfalls avoided, binding: names come from tool structure only, so planted free text never becomes a name; per-stream collection keeps a failed script beside a named failure; a wrapper never doubles a name; padding never changes a name; a coarse name always gets the whole two-log read; stored names never let a missing log through `verify --known-red`; a blocked, reused or setup-failed entry stores no names; the symlinked `skills/lifecycle-rules.md` is edited in place.

Recorded only, for the operator: C asks whether a red-main notice should print the check name beside `(no test name)`; not in #134.
