# Map, slot A

Written 2026-11-11 before reading B's or C's map. Signposts 1a 2a 3a 4a 5a 6a bind.

## Inspected

- `src/flaky.ts` `failedTests`: one regex for Bun's `(fail)` line, optionally behind a `| ` prefix; placeholders `(no test name)` and `(log gone)`. Callers: `flips` (same file), `knownRedReceipt`, `newRedUnits` twice (`src/verify.ts`).
- `src/verify.ts` `knownRedReceipt`: refuses a head entry with `(log gone)`, then `names.every((name) => baseNames.includes(name))`. So any richer name set from `failedTests` already tightens the compare with no change to this function.
- `src/verify.ts` `newRedUnits`: a unit is check name, command and one `failedTests` name; an earlier red run covers when its names include the unit's.
- `src/verify.ts` `verifyRunSchema`: a strict object; a command entry holds `name`, `command`, `exit`, `log`, `reused`, `blocked`. No failure names. Strict means an older akrogon reading a row with a new field fails to parse, and a new one must accept rows without it.
- `src/evidence.ts` `locate`: a recorded path outside `issues/(open|closed|parked|chart)/` is `nomatch`, read as `(log gone)` even when the file exists.
- Observation, framework ledger, 2026-11-11 (read-only script over `issues/verify-runs.jsonl` rows ended after 2026-10-28 with a plain log still on disk, 15 red entries): every red log holds at least one Bun fan-out line. Shapes seen: `lint                                 | Exited with code 1` (one level) and `framework:verify:rest-d      | test:remote-image                              | Exited with code 1` (nested), with the wrapper also printing `framework:verify:rest-d      | Exited with code 1`. The script name is padded with spaces before ` | `. 11 `cheap` reds have no `(fail)` line and one exit line; 1 `verify` red has no `(fail)` line and two exit lines; 3 `verify` reds have both.

## Forks

- M1 Name grammar. What `failedTests` returns for a red log. Options: (a) Bun `(fail)` names plus, for each failed innermost script whose stream printed no `(fail)` name, the script path; wrappers dropped; the check-level placeholder only when neither exists. (b) every failed innermost script always, plus `(fail)` names. (c) script names only. Risk of (a): attribution by stream prefix must be right for nested fan-out. Risk of (b): one flip shows as two lines. A bare `(unnamed)` hook timeout needs the stream's script in front to stop two different files comparing equal.
- M2 Which names count as proof by themselves in the seat rule. Today the seat text splits "a real test name" from "names no test". A script name is coarse: two different checks inside one script fail under the same name. Options: (a) only a real Bun test name is self-proving; a script name, a qualified hook timeout and the nameless marker all need the two-log causal read. (b) a script name is self-proving. Four seat texts carry the rule.
- M3 Stored names. Options: (a) one optional field on a red command entry, written when the run is written from the live log file, read first by `flips` and `newRedUnits`; `knownRedReceipt` keeps requiring both logs. (b) a side file. (c) read-time only plus a wider `locate`. (a) also answers logs written outside `issues/`, because the writer holds the real path.
- M4 Old rows and mixed versions: rows without the field fall back to the log; a row written by the old grammar never has the field if the field lands after the grammar, which is a real ordering reason.

## Pitfalls

- Planted `[FAIL]` output in green runs: removed by reading tool structure only (signpost 3a).
- Wrapper lines doubling an identity: drop an exit line whose path is a prefix of another's.
- Padding and nesting in the prefix: trim each segment.
- A check that is not a Bun fan-out (single command, no exit line, no `(fail)`): stays on the check-level marker, covered only by the same marker on the same command (#133 lock kept).
- A release where consumers hold an older installed akrogon: strict schema rejects unknown fields, so the field must not reach a repo whose seats run an older copy. akrogon is installed once per machine, so one release moves every reader.
- Existing tests that pin `(no test name)` for script failures change.

## Split

One issue, two leaves. `failure-names`: the grammar, the tightened compare it brings, notices and flaky output, the four seat texts. `stored-failure-names`: the record field and its readers, blocked by `failure-names` because the field must hold the new grammar's names (M4).

## Pre-existing key parts to observe before handoff

- Bun's fan-out exit line format, one level and nested (observed above in framework logs; also one local run of `bun run --filter`-style fan-out to pin the tool and version that prints it).
- Bun's `(fail) (unnamed)` hook-timeout line (reported; one local observation).
- `verifyRunSchema` strictness against an unknown field (one local parse).
