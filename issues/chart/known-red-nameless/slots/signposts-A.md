# Signposts angles, slot A

1. The 2026-10-10 lock: does it reopen? (red-base-wait comparison Q2 2a: a red with no test name is "unverified, never known-red, and blocks"; foreclosed "command-exit comparison; crash exemption".)
   - 1a (rec) Reopen narrowly: a red that names no test may be covered by its base only where nothing a leaf could break is hidden behind it. A test run that crashed stays unverified.
   - 1b Keep the lock whole and solve the stop on the other side (main gets fixed fast, the stopped leaves resume by themselves).
   - 1c Reopen fully: same exit and same output on both sides covers any command.
   - Steers: the mechanism fork, seat skill text, which earlier tests change.

2. Ranked priority when the two pull apart.
   - 2a (rec) Never let a leaf's own break pass as known-red comes first; not stopping every leaf on a broken main check comes second.
   - 2b Flow first: a broken main check must never stop leaves, accept a small chance of a hidden leaf break until main is fixed.
   - Steers: how strict the sameness test is, what the seat still judges.

3. Who decides that head and base failed "the same way"?
   - 3a (rec) The command checks function only (same command, both red, completed, the compared evidence present); the seat keeps the judgment gate (causal fit, nothing of the leaf hidden), as today for named reds.
   - 3b The command decides alone by a strict mechanical comparison.
   - Steers: code size, skill text, function over form.

4. New configuration?
   - 4a (rec) None: no per-check kind, flag or marker a consumer repo must set.
   - 4b Allow one config key that marks a check as naming no tests.
   - Steers: reach to every consumer repo without edits, upkeep.

5. Reach beyond `--known-red` judging `fail`.
   - 5a (rec) Only this: a nameless red identical on base can be covered. The leaf stopping in `failed` when it is not covered, and how fast a broken main check gets fixed, stay as they are.
   - 5b Also make the broken main check itself visible or filed sooner (it is already filed through the existing base-red filing once known-red agrees).
   - Steers: leaf count.

6. Proof spending.
   - 6a (rec) No paid calls and no live mutations: local tests on isolated fixtures, red before and green after. The stopped herdr-setup leaf is not a completion requirement.
   - 6b A live replay on the herdr-setup leaf.
   - Steers: needs sheet, proofs, grants (none).

Needs: none foreseen. No key, login, file, grant or paid approval; #133 closes through the leaf's `sources`.
