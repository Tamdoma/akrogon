# Chart: broadcast message reads as Before and Now for any team member

## Destination
A completed-issue broadcast renders as `## 🧪 <repo>: <one plain sentence> (MM/DD/YY)` followed by exactly two sections, `Before` (what was wrong or missing) and `Now` (what is better about the system). Every bullet is one sentence a marketing, design or account-management reader understands. The sender rejects any other shape, its tests cover the new shape, and the guide example matches.

## Forks taken
- Title format: operator keeps `<repo>: <headline>` plus emoji and date; the headline becomes one plain sentence stating the result. (operator, intake)
- Sections: `Before` and `Now` only; the former "what changed" section is removed and `Now` states what is better. (operator, intake)
- [Before for additions](forks/before-for-additions.md): Before stays required and names what was missing.
- [Detail per part](forks/detail-per-part.md): the writer scales detail to readability, merging parts when that reads better; small issues get a few short bullets.
- [Readability enforcement](forks/readability-enforcement.md): writing rules only, no mechanical guard in the sender.

## Forks open
None.

## Fog
None.

## Off route
- Any change to the merge-issue trigger, chunking, retry or redaction behaviour of the sender.
Handed off 2026-09-14 into `../../open/broadcast-two-sections/`.
