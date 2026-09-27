# Implementation report: peer-c-role

Single delegated unit (brief-1). One worker edited all three owned files in one pass. No `## Implementation notes` appended to plan: no implementation-only constraint was missing.

## Changed files and reasons

- `skills/chart-issues/SKILL.md`: first-reply rule names B then C when given or says single slot with C-only-with-B; map, per-fork exchange, rebuttal, direct-request, late-check, and handoff-review rules apply to each named peer stated once; attribution is agreeing-slot lists. Covers A1, A2, A4.
- `skills/chart-issues/assets/questions.md`: research tail generalized; "Blind B exchange" renamed "Blind peer exchange"; per-peer exact paths including C variants; idle wait plus `herdr agent wait` without timeout per peer; each peer blind to A's draft and the other peer's work; each rebuttal reads only A's merged file. Covers A3, A4.
- `docs/guide/chart.md`: second-seat section renamed "Independent views when you name a peer seat" with optional C prose, three-lane diagram, each-named-peer contract review. Covers A4, A5.

No other files touched. No new tests: prose-only leaf with no runtime path per design.

## Commands run with results

Worker (brief-1), before edit, red state confirmed:

- `grep -rn "(both)" skills/chart-issues docs/guide/chart.md` → 3 hits (SKILL.md x2, questions.md x1).

Worker, after edit:

- `grep -rn "(both)" skills/chart-issues docs/guide/chart.md` → no output, exit 1.
- `git --no-pager diff --name-only` → exactly the three owned files.
- `AKROGON_BASE=9aaadd379d9c46c49fd0b6a6460c6c39f898fc53 bun test --changed="$AKROGON_BASE"` → 0 tests affected, 0 pass 0 fail (prose-only diff).

B, after worker (scratch `verify-*.txt` removed first):

- Stale-term sweep `grep -rniE "two-slot|both slots|When B|Blind B|second seat|naming B" ...` on the three files → clean.
- Inbound-anchor sweep for old heading/section names → no references.
- `bun run format` → exit 0.
- `bun run typecheck` (`tsc --noEmit`) → exit 0.
- `bun test` → 291 pass, 0 fail, 3468 expect() calls, 14 files.
- `git --no-pager diff --name-only "9aaadd379d9c46c49fd0b6a6460c6c39f898fc53"...HEAD` → exactly:
  - `docs/guide/chart.md`
  - `skills/chart-issues/SKILL.md`
  - `skills/chart-issues/assets/questions.md`

No end-to-end artifact path exists for a prose-only leaf; grep and diff outputs above are the evidence. Worker scratch files were deleted, not committed.

## Base and head

- Base: `9aaadd379d9c46c49fd0b6a6460c6c39f898fc53`
- Head: `ffd7be074571782b21c69dc5329fbf79db11e316`
- Branch `peer-c-role`, tree clean at handoff.

## Known limitations

- Prose-only change: no behavioral test path; verification is grep plus diff plus repo checks.
- Guide ASCII diagram is wider than before (three lanes).
- Guide heading renamed since "second seat" no longer covers a third seat; no inbound links found.
- Existing charts under `issues/` keep `(both)` tags as history by design.

## Unverified criteria

None. A1-A7 all verified: A1-A3 and A5 by diff read against plan wording, A4 by empty grep, A6 by base...HEAD diff names, A7 by format, typecheck, and full test exits.

## Repair round 1 (2026-09-26, review-A F1)

- Before: `ffd7be074571782b21c69dc5329fbf79db11e316`
- After: `1a21e22e0056a7e9d6b5e35a5a395b867847a844`
- Change: `skills/chart-issues/assets/questions.md:24` template line, "including B's remaining disagreements" to "including each named peer's remaining disagreements". One line, no other files.
- Worker evidence: grep for `(both)` empty; slot-B sweep shows only the permitted guide prose "blind to both A's and B's work"; diff names still the three owned files; changed tests 0 affected.
- B checks after repair: format exit 0, typecheck exit 0, `bun test` 291 pass 0 fail. Tree clean.
