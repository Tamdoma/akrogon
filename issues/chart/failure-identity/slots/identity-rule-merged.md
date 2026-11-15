# Identity rule, merged notes

Sources: slots/identity-rule-A.md, slots/identity-rule-B.md, slots/identity-rule-C.md.

## Q1 names

- 1a (A,C): per stream; real `(fail) <title>` unchanged; `(script) <innermost script>` for a failed script whose stream printed no `(fail)` line; `(unnamed) <script>` for a bare hook timeout with a script, `(unnamed)` without; wrappers dropped; `(no test name)` otherwise. Reason: only facts Bun prints, real titles keep their history, survives the measured `rest-c` to `rest-d` move. Cost: two bare hook timeouts in one script share a name and rely on the seat's two-log read.
- 1d (B): 1a plus the script in front of real titles too, and the source kind kept in equality apart from the label. Reason: `script-X | (fail) shared title` and `script-Y | (fail) shared title` compare equal under 1a; a title spelled `(script) foo` could equal a script name. Cost: every prefixed real title changes, existing series split, an expectation in `tests/flaky.test.ts` changes (C).
- 1b rejected (A,B,C): file-header tracking and a renamed check marker add state for 2 logs.
- 1c rejected (A,B,C): doubles flips, unstable under wrapper moves.
- Differ: `Signaled:` lines. (C) counts `<script> | Signaled: <SIG>` as a failed script. (A) does not: A's probe P1 (Bun 1.4.4, 2026-11-11) shows that without `--no-exit-on-error` Bun kills healthy siblings after the first failure and prints `Signaled: SIGINT` for each, so the line does not say the script failed; a script that died by a signal then shows through its wrapper's `Exited with code` line or as `(no test name)`.
- Evidence: better-than-training, `src/flaky.ts` `failedTests`, `tests/flaky.test.ts`, 2026-11-11 (A,B,C); framework ledger, 254 readable red logs, 90 of 90 nameless with an exit line, 23 mixed, 2026-11-11 (C); run `1704b5ef` with two `(unnamed)` hooks and a failed script (B); Bun 1.4.4 probes (A,C).
- Pitfalls: mixed logs, removed by per-stream collection (A,B,C); wrapper doubling, removed by dropping a failed chain that is a strict prefix of another failed chain, matching `(fail)` cover on the whole chain before taking the innermost token (C); padding, removed by trimming segments (A,B,C); a title containing ` | (fail) `, removed by matching a line that starts with `(fail) ` as unprefixed first (C); planted free text, removed by reading structure only (A,B,C).
- Open: C asks whether a red-main notice should print the check name beside `(no test name)`.

## Q2 proof

- 2a (A,B,C): compare code unchanged; the two seat texts require the whole two-log causal read when any head red name is not a real test title. (B,C) want the "any" stated explicitly for a mixed head.
- 2b, 2c rejected (A,B,C).
- Open: (C) the existing words "not killed, timed out or crashed" could be read as refusing every hook timeout, although the runner finished with its own summary; say that a single test or hook timeout inside a run that ended with its own summary is the command's own verdict. (C) keep a gone base log explicit; (A,B) the existing head refusal already catches it.
- Pitfalls: symlinked `skills/lifecycle-rules.md` edited in place, literal substrings kept for `tests/docs-links.test.ts` and `tests/run-units.test.ts` (C); refusal matrix, blocked-check exception and own-criterion proof unchanged (B).

## Q3 stored names

- 3a (A,B,C): optional field on a command entry; `flips` and `newRedUnits` read it first; `knownRedReceipt` never reads it. (C) field `failures`, a non-empty deduplicated string array, present only where the command itself ran and exited non-zero: not on `blocked`, `reused`, exit 0, or entries pushed because setup failed. (B) it holds the same identities the reader returns, never a missing-log placeholder.
- 3b, 3c rejected (A,B,C).
- Cost (A,B,C): an older akrogon cannot parse a ledger holding the field; a parser defect at write time stays on the rows written before its fix.

## Q4 existing log outside the grammar

- 4a (C): in the name reader, `readLog` first; only on its no-match result read `resolve(repo.root, recorded)` when it is a regular file; else `(log gone)`. Reason: 3 lines, no cross-repo ambiguity, `verify --holder <outside> --known-red` works, akrogon's 2 rows resolve. Cost: `akrogon log <path>` still refuses such a path.
- 4b (B): the shared reader gains the literal-file read, once at the cross-repo boundary, as its own leaf. Reason: the seat must read a cited log with `akrogon log`, so the path the command accepts should be readable there. Cost: `src/evidence.ts` change, a third leaf.
- 4c (A): nothing. A moves to 4a on C's evidence that a known-red run with a holder outside the grammar fails today right after it ran.

## Where slots differ

1. Q1: script in front of real titles and a kind kept apart (B) against bare titles (A,C).
2. Q1: `Signaled:` as a name (C) against not (A).
3. Q4: 4a (A,C) against 4b (B).

A's intended pick: 1a without `Signaled:`, 2a with the explicit "any" and the hook-timeout sentence, 3a with C's field contract, 4a in C's order.
