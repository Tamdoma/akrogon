# equality-rule

## Question

Where does the check live (shared `integrate` vs per move route) and what counts as identical (bytes, type, mode)?

### Carries

- Operator 2026-10-18: "most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."
- Opening map: issues/chart/paid-proof-bounds/slots/map-merged.md

## Findings

Merged notes with tags: slots/notes-merged.md (A,B,C notes, B and C rebuttals). Code at HEAD 96a96979, probes on Git 2.56.0, 2026-10-19.

- The guard stays in shared `integrate`: both moves (`rebase --autostash`, `read-tree -m -u`) silently overwrite a differing ignored file (A,B,C).
- Exempt only an exact incoming blob entry whose local type and mode match and whose content hashes to the incoming blob, never a replayed path or a file/directory shape clash (A,B,C).
- Split: raw bytes via `--no-filters` (A,B) or Git's filtered blob equality (C).
- Split: share one predicate with `moveCheckout`'s equal-collider loop (A), leave it out (B), or ask (C).
- Lookup errors propagate with context rather than becoming a collision (B, matches the operator's error rules); C proposed collision.
- The check-then-move race is a new small window for exempted files; recorded as a limit, no mechanism (B).

## Taken

Operator 2026-10-19: `1a | 2a | 3a`.

- 1a: identical means the same raw bytes (`git hash-object --no-filters`), plus the same type and executable bit. Reason: the operator's file is never rewritten without asking; a line-ending-only difference still refuses, which is rare and safe.
- 2a: `moveCheckout`'s equal-collider loop stays as it is. Reason: it handles non-ignored untracked paths after a failed move, a different case; changing it widens the fix.
- 3a: sync prints no list of adopted paths. Reason: identical files lose nothing.
