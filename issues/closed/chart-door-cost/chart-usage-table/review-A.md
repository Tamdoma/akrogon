# Review A: chart-usage-table

Base: 3ce20853c64d843d97a1ebe0fbef335958ac0dff · Reviewed head: 4a56324.

## Verified

- Ran the diff's tests and checks in the worktree: `bun test tests/chart-usage.test.ts` 9/9, full suite 510/510, `bun run typecheck` clean, `bun run format` clean, worktree clean, `src/`/`issues/` untouched.
- Re-ran the live proof myself: temp chart with the three design sessions at `until` 2026-10-06T20:16:00Z — C and B exact vs reference; A differs by one assistant group at 20:15:56Z (the door's own measurement record); `until` 20:15:50Z reproduces all A reference figures exactly. Record class identified per criterion 10.
- Counting method, outcome/exit contract, sibling printing, replace-on-rerun, marker non-leak, missing/ambiguous/broken transcript rows: verified against the code and fixtures. Fixture record shapes match the live transcripts (verified codex top-level types: `event_msg`/`response_item`/`turn_context`; claude `isCompactSummary` marks injected continuations; `cost-state` has no `timestamp`).
- SKILL.md Open/Take/Handoff additions cover criteria 1, 2, 6-skill-part, 8; shapes.md tree + `### seats.yaml` and chart.md edits cover criterion 9; `files.md` correctly reported no hit. AREA.md files are curated non-exhaustive lists — no stale pointer created.
- Interpretation choices reviewed and accepted: `<local-command-stdout>` exclusion (real records carry no `isMeta`; excluding them is what reproduces the reference); operator-turn rows read only the first seat's transcript, per the criterion's "in A's transcript"; operator-row output span runs message→next-message with the reply minutes shown separately (the round-cost reading).

## Findings

### Fix

- **F1 — the outside-herdr table never says `usage unmeasured`.** Source: the door on any non-herdr run writes `seats.yaml` with `seats: []` (the shape this leaf's own shapes.md now documents), then runs the script at handoff. Consequence today: `seats: []` produces `chart X - operator wait 0.0 min, operator turns 0, restatements 0` + `outcome done` with no `usage unmeasured` anywhere — reproduced on `$TMPDIR/rev-empty`. This contradicts done-criterion 1 ("Outside herdr the record holds the open time and no session, and the table says usage unmeasured") and the SKILL.md sentence added by this leaf claiming the same. The covering test (`second run replaces USAGE.md`) seeds `seats: []` but never asserts the missing label, so the gap is untested. Smallest repair: when `seats` is empty, emit the unmeasured statement in `USAGE.md` (and arguably `outcome partial`); or state in SKILL.md/criteria text that no seats mean unmeasured — as written, the docs claim the label exists.

### Nits

- **N1 — out-of-window timestamp validation.** `claudeSession` errors the seat on any user/assistant record lacking/|unparseable `timestamp` and codex on `payload.turn_id`/`total_token_usage` fields, even when the record sits outside the window. Criterion 5 says out-of-window records are excluded. Realistic source: a transcript edge record without a timestamp outside the measured window (I did not find one in the live transcripts, so evidence of reachability is thin). Deferred: no live transcript exhibits it; promote if a real transcript trips it.
- **N2 — sibling `USAGE.md` read between `existsSync` and `readFileSync` can crash.** A sibling `USAGE.md` deleted mid-run makes `readFileSync` throw and exits 1 with an unhandled error. Realistic source: concurrent door runs on sibling charts. Deferred: narrow race, no observed instance; a `try/catch` skip is the one-line hardening.
- **N3 — claude incomplete turn contributes no `turns` entry while codex's does.** A claude operator turn with no reply is invisible in the seat's `turns N, M incomplete` count; a codex unfinished turn is counted as incomplete. Cosmetic inconsistency; criterion satisfied (the operator row is labelled incomplete either way). Promote only if someone reads seat-level turn counts as complete-only for codex.
- **N4 — `first turn in window` skips an incomplete first turn.** `firstTurn` filters to complete turns only, so a seat whose first window turn is unfinished shows its second turn as the "first" row. Rare on real charts (openings almost always complete); wording ambiguity in the criterion. Fix would be trivial (don't filter).

## Verdict

`fix` — one blocking defect (F1) against done-criterion 1.
