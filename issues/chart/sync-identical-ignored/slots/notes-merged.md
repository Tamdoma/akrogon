# Merged notes: equality-rule

Sources: slots/notes-A.md, notes-B.md, notes-C.md. Code at akrogon HEAD 96a96979, read 2026-10-19.

## Options
- Keep the guard in shared `integrate` and add one narrow exemption inside its collision filter (A,B,C). An ignored path stops colliding only when: it is an exact incoming entry (A,B,C); the entry is a blob and the local `lstat` type and Git mode match, regular 100644 or 100755 by the owner executable bit, or symlink 120000 compared by link-target bytes without following the link (A,B,C); the content hashes to the incoming blob id (A,B,C); and no replayed local commit touches the path (A,B,C). Ancestor and descendant collisions, gitlinks, directories and other types keep today's refusal (A,B,C). Reason: `integrate` is the only point before both destructive moves (A,B,C). Cost: the incoming mode and blob id, through an enriched listing (B) or a per-candidate `ls-tree` lookup (C), plus an `lstat` and hash per exact candidate only (A,B,C).
- Remove the guard and trust Git or `moveCheckout` (rejected A,B,C). Both moves overwrite differing ignored files silently (B,C probes).
- Per-route comparators (rejected A,B,C). Two definitions that drift; self-update's `moveCheckout` runs in `after`, too late for the current refusal (C).
- Hash only, no type or mode (rejected A,B,C). Mode or symlink is lost silently; `hash-object` follows symlinks (B,C).
- Exempt replayed paths by comparing a later tree (rejected B,C). Add-then-delete replay deletes an equal file (B probe, C from the replay tests).
- Delete or mutate identical ignored files before the move (rejected A,B,C). Adds a destructive step for nothing.
- Regular files only, symlinks always refuse (rejected C, a fallback if scope must shrink). Smaller, but leaves one false-refusal class.

## Where slots differ
- Filters. A,B: raw bytes via `git hash-object --no-filters`, so CRLF vs LF refuses (B probe: default hash equals LF blob, `--no-filters` does not). C: filtered `hash-object`, the form `moveCheckout` uses, because raw bytes refuse a CRLF file Git calls unmodified. C withdrew its second reason ("new byte plumbing"): `--no-filters -- <path>` prints a hex id.
- `moveCheckout` equal-collider loop. A: extract one shared predicate for both. B: leave it outside this fix; it runs only after `read-tree` fails, which ignored collisions never cause. C: its dirty set excludes ignored paths, asks whether it should get the same gate.
- Lookup failure. C: any stat, hash or lookup error counts as a collision. B: propagate it as its own error with path and command context; the collision refusal is only for a proven mismatch or shape.

## Evidence
- `src/sync.ts` `integrate`: ignored list `ls-files --others --ignored --exclude-standard -z`; incoming names via `ls-tree --name-only`; replay names via `log incoming..HEAD`; any overlap throws `Cannot sync over ignored operator paths`; runs before the move (A,B,C).
- `src/self-update.ts`: calls `integrate`, then `moveCheckout` (`read-tree -m -u`); its equal-collider loop compares filtered `hash-object` with `rev-parse <target>:<path>`, no mode, dirty set without `--ignored` (A,B,C).
- `tests/sync.test.ts` ignored-collision matrix for incoming and replay sources, shapes and odd filenames; `tests/self-update.test.ts` differing ignored file on a behind-only move; no identical case exists (B,C).
- Probes, Git 2.56.0, 2026-10-19: identical regular and symlink files survive both moves (B,C), identical executable too (C); differing bytes are overwritten silently (B,C), mode is changed (B,C) and type is swapped (B); a non-ignored untracked identical file makes rebase abort (C).
- Intake #106: 28 ignored `.spec/` files, byte-identical by `cmp` (A,B,C).

## Pitfalls
- Replay overwrites or deletes an equal file: replayed paths stay collisions (A,B,C).
- Symlink hashed through its target: `lstat` first, hash the link text (B,C).
- Mode-only difference: compare the executable bit; under `core.fileMode=false` this may refuse, which fails safe (B,C).
- Filters hide different bytes: `--no-filters` removes it (A,B); C accepts it as blob equality.
- Binary content through string helpers: compare blob ids only (C).
- Odd filenames: keep `-z` listings and literal pathspecs; reuse the existing odd test path (B,C).
- Mixed batch: compare every candidate before the move; a batch with equal and differing files refuses with nothing changed (B).
- Race between check and move: C says same exposure as today. B: the exemption newly accepts a present collider after a hash, so a write in between can be lost; record it as a limit, no new mechanism (B).

## Open questions
- Q1 (A,B,C): raw bytes (`--no-filters`) or Git's filtered blob equality?
- Q2 (A,C): should `moveCheckout`'s equal-collider loop share the new predicate, or stay out of scope (B)?
- Q3 (C): print the adopted paths on a successful move?
- Q4 (C): non-ignored untracked identical file is a separate issue (Git refuses it itself).

## Rebuttals

- B: R1 executable-pair probe was C's; R2 race window is new, record it; R3 lookup errors propagate, not a collision. Applied above.
- C: tag corrections on cost, symlink fallback and probes applied; withdraws the byte-plumbing reason but holds filtered equality on the CRLF reason.
