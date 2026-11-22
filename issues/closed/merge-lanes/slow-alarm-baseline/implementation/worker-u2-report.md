# Worker report: brief-2 (docs, wave 1)

Commit: 6aa7bb15 `docs: slow alarm carried normal and accepted rule` (2 files, 2 insertions, 2 deletions).

## Changed files and reasons

- `docs/reference/checks.md` — slow paragraph (line 81) rewritten to the locked rule: carried `slow.normal_ms` lowered to the rolling last-20-eligible median, rising only at `accepted`; open episode pins normal; `recovered` on the episode's own last-20-eligible median (>=5, run under test included) back under the 1.5x + 2 min threshold; `accepted` at >=14 days first flagged `end` to this `end` with last 20 eligible runs inside it; `<repo>.merge-slow-accepted.<run>` notice naming old/new normal, send state on the closing row as `slow.accepted_notice` retried by next checked run; next run takes window's median; cold start unchanged.
- `src/AREA.md` — same rule in the verify line's slow clause, single bullet, existing dense semicolon style; includes the strict-key consequence (`slow.accepted_notice` unparseable under older akrogon, mirroring `failures`) and keeps the status line, the `; accepted as new normal` print, and never-checked leaf/compares facts. Still 39 lines (cap 40).

## Tests run

- `akrogon run-check --name u2-format -- bunx prettier --check docs/reference/checks.md src/AREA.md` — exit 0, "All matched files use Prettier code style!". No other checks apply to docs.

## Known limitations

None known.

## Unverified criteria

None. Acceptance 1 verified by rereading the paragraph against each listed element; acceptance 2 verified the same way plus strict-key phrasing mirrored from `files.md`; acceptance 3 verified via `git show --stat` (only the two owned files in the commit; `files.md` and `tests/AREA.md` untouched).
