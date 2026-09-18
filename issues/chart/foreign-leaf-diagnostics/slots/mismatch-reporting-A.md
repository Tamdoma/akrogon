# Round A: mismatch reporting (blind draft, 2026-09-19)

Correction to the map finding: a mismatched leaf does not block that repo's healthy leaves. `discover()` drops it from `leaves` and `sweepAll` dispatches the rest (src/next.ts:515-525); tests/next.test.ts:1098-1113 proves healthy dispatches with one mismatch present. `selectLeaves` returns silently only when nothing matched (src/next.ts:566-570).

### Q1 · One aggregated line per repo per pass, or one line per leaf?
`report()` (src/next.ts:77-83) prints one JSON line per path per invocation; `discover()` calls it per mismatched leaf (:102-107). With 96 foreign leaves and `next` on every herdr event, that is 96 lines per event.
Research: primary code · src/next.ts:77-135 read 2026-09-19 · per-leaf reporting is unconditional · shaped A as grouping by stored key.
- A (recommended) Group mismatches by stored key inside `discover()` and report one line per (repo, stored key) naming registered key, stored key, count and the first path. Keep per-leaf lines for every other unreadable cause (schema, depth, duplicate slug). Wins because a foreign tree is one fact, and one line names the repair.
- B Keep per-leaf lines. Cost: the flood, and the one real message is buried.
Pitfalls: a single genuinely mislabeled leaf is still one line, so nothing is hidden. Tests at tests/next.test.ts:1117-1130 read `skip.path` for the mismatched leaf and need the first-path field. `unreadable` count stays per leaf so `activeCount` and selection behavior are unchanged.

### Q2 · Does a foreign leaf stop the repo's own valid leaves?
Today it does not (see correction). The seed's expectation says only "detected once with a single actionable message".
Research: primary code and test · src/next.ts:515-525, tests/next.test.ts:1098-1113.
- A (recommended) Keep dispatching valid leaves. Wins because the foreign tree is someone else's history, not a defect in this repo's leaves, and the consumer's own work should not wait on cleanup.
- B Refuse the whole repo until clean. Cost: blocks the consumer's real leaves; changes tested behavior for no reported need.
Pitfalls: none beyond keeping the existing test green.

### Q3 · Walk-time only, or also refuse at registration?
`init` registers without reading leaves (src/init.ts:16-49). Registration catches the inherited case only; a later merge lands after registration, which is exactly the clinique sequence (registered, then merged the framework).
Research: primary code · src/init.ts:16-49, clinique git log (merge 19cd1bb0 after registration).
- A (recommended) Walk-time only. Wins because it covers both orders and adds no second code path.
- B Also refuse at init. Cost: a second check that would not have caught this incident.
Pitfalls: none.

Challenge check: a practitioner could ask for "once until repaired" (remembered state). Ruled out in Carries: no persistent machinery, and each pass re-reporting one line is the honest signal. B's rebuttal pending.
