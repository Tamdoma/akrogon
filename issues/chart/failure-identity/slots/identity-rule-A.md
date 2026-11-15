# Identity rule, slot A notes

Written 2026-11-11 before reading B's or C's notes.

Observation P1 (A, 2026-11-11, Bun 1.4.4, throwaway project in the session scratchpad, no cleanup needed beyond deleting the folder): `bun run --parallel --no-exit-on-error` over a wrapper and four scripts printed on stderr `grp-a | t:custom | Exited with code 3`, `grp-a | t:named  | (fail) named > breaks [0.18ms]`, `grp-a | t:named  | Exited with code 1`, `grp-a | t:sig    | Signaled: SIGTERM` and the wrapper's `grp-a | Exited with code 3`. Without `--no-exit-on-error` the first failure made Bun kill the siblings, which then printed `Signaled: SIGINT` although they had not failed. A hook timeout printed `(fail) after hook [100.13ms]` with the test's title, so `(fail) (unnamed)` is a different Bun case, seen only in framework's recorded logs (map B F7, map C). Limits: one Bun version; says nothing about other runners.

Q1: 1a. Reason: every part is a fact Bun prints; real titles keep their history; the innermost token survives the wrapper drift C measured. `Signaled:` lines are not names: P1 shows Bun prints them for healthy siblings it killed. A script that died by a signal then shows as its wrapper's exit line, coarse and true. Rejected 1b: the file header needs a second line-tracking rule for 2 logs, and a renamed check marker changes every existing nameless expectation for no new fact. Rejected 1c: doubles each named flip and splits a script's history when it moves between wrappers. Pitfall: mixed logs (per-stream rule removes it); padding (trim each segment); a script token repeated under two wrappers merges (accepted, coarse names always get the two-log read).

Q2: 2a. Reason: signpost 2a; the compare code needs no change because the names changed. Rejected 2b: a script holds many checks. Rejected 2c: P1 shows signal lines are ambiguous, and the seat already judges "not killed, timed out or crashed".

Q3: 3a. Reason: signpost 4a; the writer holds the real file, so the field also answers logs outside `issues/`. Stored-first keeps reports stable and cheap. Cost: an older akrogon cannot parse a ledger with the field (strict schema), so a rollback past this change needs the rows rewritten or the field dropped. Blocked and reused entries store nothing. Rejected 3b: every report keeps unpacking archives. Rejected 3c: a second file to keep in step.

Q4: 4c. Reason: with 3a every new row has its names, so the only gain of 4a or 4b is 2 old akrogon rows, and `verify --known-red` with a holder outside the grammar is not a path any skill uses (the direct route uses `<chart>/direct`). Nothing already broken is fixed by adding a read path. If a consultant shows a live known-red path outside the grammar, 4a.

Question the fork does not ask: should `flakyCommand` print change? No: `(script) test:remote-image` reads well in the existing line.
