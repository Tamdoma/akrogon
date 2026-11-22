# Merged notes: budget-shape

Sources: map-A.md, map-B.md, map-C.md.

Q1 Ceiling. One optional key in machine `~/.akrogon/config.yaml` (`globalSchema`), shown by `akrogon config`, numbers plus the operator's answer text (A,B,C). Scope (accounts, effects, stop line) written once in `skills/lifecycle-rules.md`, accounts = the `harnesses` record (B); C puts the scope fields in config too. Written only by the operator, never a seat or the door (B; A implied). Rejected: per-repo key (lets a leaf raise its own ceiling by merge, no host total) (A,B,C); separate file (B,C).
Q2 Counting. `akrogon run-check --sessions <n>` reserves n before launch under a lock, counts whatever the outcome, refuses when the window total plus n passes the ceiling (A,B,C). Record: `sessions: n` on the existing `check_start` timing row, summed across `global.repos` timings files, a row that cannot be written refuses (B); a separate host ledger `budget.jsonl` under `globalHome()` (A,C). Lock: B `withAdmissionLock`; C a separate flock never nested inside admission. Rejected: seat-written count lines (A,B,C); parsing harness session records (B).
Q3 Window. Rolling 24 hours (B; C leans rolling, no midnight double burst).
Q4 Grants. No per-leaf grant for paid launches on logged-in accounts plus local cleaned writes (A). Keep a grant entry, schema unchanged, `approved.answer` quotes the standing N1 words, `bounds` holds no counts; it keeps the fixture/cleanup home that abandoned-capture recovery reads (B). Discriminated schema with standing entries lacking `approved` (C). Old entries stay valid with no migration (A,B,C).
Q5 Absent key. One path: `--sessions` refuses naming the key (A,B). C: refuse plus door falls back to per-leaf grants (two paths).
Q6 Per-leaf cap none; each launch states n and its reason; the red-launch paragraph stays the brake (B; A implied). Minutes: the live test enforces and reports it, run-check counts sessions only (B); C exports `AKROGON_SESSION_MINUTES`; A left open. Killing the run scope skips cleanup and leaves hc sessions alive (B).
Q7 Stop. `failed` with one notice (A implied, B O1) vs a self-clearing wait if no new machinery (B O2). C: dedupe the notice per day.
Q8 Sufficiency floor in standing-design's fresh-call sentence, check-issue cites it (B); in lifecycle-rules with standing-design pointing to it (C); lifecycle-rules (A). Review asks for a fresh run only by naming a behavior no recorded run on current inputs shows; wording-only never (A,B,C).
Q9 run-check sets `AKROGON_SESSIONS=n` only for a reserved run and each live test refuses without it (B). Review reads paid activity against reservation rows (A,B,C).

Split: L1 code (config key, `--sessions`, record, refusal, env) then L2 prose blocked-by L1 (A,B,C). C adds a lifecycle-rules copy-equality test (moot: symlinks).

Differ: Q2 record (timing row vs ledger), Q4 (no grant vs quote-N1 grant vs discriminated schema), Q5 fallback (C), Q7, Q8 home.
