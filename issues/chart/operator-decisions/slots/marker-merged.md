# Marker, merged notes, 2026-11-19

## Q1 What marks it, how far the lock reaches
- 1a (A,B) A heading line starting `## Operator decision (<name>, <date>)`, rest of line free; lock = text under it to the next `## ` heading; body free; `Not in scope:` and `Done when:` locked when present, never required. Cost: a decision under another heading is asked as today.
  - Must be a heading line, not a mention: #144's own body names the heading in prose and must not be taken (B).
  - Taken wherever it sits; seed-issue places it after `Unverified intake.` (B). Counts only in GitHub seeds (A,B).
  - Text it points to ("details in Proposed solution below") is not locked (A,B).
  - Near miss named in the opening map, "marked differently, not taken" (B).
- 1b required parts: rejected (A,B). 1c door judges decision-like text: rejected (A,B). Label: rejected, mirror has no labels and needs code (B).
- Evidence: #714 body (A,B); #144 prose mention (B); src/pull.ts keeps body unparsed (A); Nygard ADR status and superseded-not-deleted (B).
- Pitfalls: two copies of the literal, removed by one binding decision copied to both leaves (A,B); a `## ` inside the section cuts the lock, removed by the seed-writer rule using `### ` (B); two marked sections that disagree are two taken forks, the clash goes to the operator (B).

## Q2 Whose section counts
- 2a (A,B) Counts only when the issue author and every body editor are the door's own gh login, read once at import in one GraphQL call; else plain intake shown as "marked, not taken" with the reason, and the operator may take it there in words. Cost: proves "this account, untouched by others", not "this person".
- Rejected: marker alone (A,B); author only, since Write collaborators can edit bodies and akrogon has 4 (B, GitHub roles doc); `authorAssociation` (B); per-section confirmation (signposts 1a).
- Evidence: Invariant Labs 2025-05-26 (A,B); Willison lethal trifecta 2025-06-16 (A,B); Snyk on Clinejection 2026-02-09 (B); GitHub roles table and gh-aw integrity reference (B); free proof #714 and #144 pass (A,B).
- Pitfalls: edit between pull and identity read, removed by comparing last edit time with pull time, later edit = not taken (B); failed read = not taken with the error shown (A,B); silent miss, removed by the map line and autopilot pass-end line (B); an agent writing the marker unasked under the operator's token, not removed here, left to seed-writer (A,B).

## Open questions
- Autopilot and a "marked, not taken" section: ordinary forks A answers, reason in the pass-end line (B). Belongs to finding-against.
- Ambiguous decision text under autopilot: operator settles (B). Belongs to finding-against.

## Where slots differ
- None on picks. B adds the heading-line test, the near-miss line, the `###` rule and the edit-time race.
