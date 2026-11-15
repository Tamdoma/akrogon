# Identity rule, proposed final shape (round 1, A's picks 1a 2a 3a 4a)

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
