# Chart: watch-merged-siblings

## Destination
The watch treats a merged leaf under `issues/open` as waiting on its siblings while any leaf of its top-level owner folder is unmerged, taking no action and saying so; only when every leaf of the owner is merged and the folder remains does it run `akrogon next <slug>` once and report a completion error if the folder stays.

## Forks taken
- [sibling-evidence](forks/sibling-evidence.md): wording-only merged rule, read the owner folder's states, no `next` while a sibling is unmerged, one `next` and command-error rule when all are merged (2026-09-21).

## Open forks
none

## Fog
none

## Off route
- Changing `completeOwner` or `next` output; the silent `completed` return is correct behavior.
- Any docs/guide change; the guide does not state the merged rule.

Handed off 2026-09-21
