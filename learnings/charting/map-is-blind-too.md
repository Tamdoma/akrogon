# The territory map is a blind two-slot pass, and provenance is visible

## What was not good
This chart's territory map was drawn by slot A alone. Slot B joined blind from the first decision on. Every later batch, from both slots, was asked inside forks slot A had already fixed, so the two batches overlapped on most questions and slot B's new forks were few. The operator asked why the slots kept asking the same things and found the cause. Provenance was kept in the decision file only, so the operator could not see who proposed what in the batch.

## What the updated way does
When a second slot is elected, slot B writes its own map blind, slot A merges, and each fork names its slot. Every merged batch tags questions and recommendations `(A)`, `(B)` or `(both)`. After the merge, one rebuttal round: slot B reads the merged batch and replies once with its disagreements, shown under the challenge check as `Slot B disagrees:`. The second slot is elected at the door in one word, recommended for a chart whose decisions reference each other, not for a single fuzzy issue.

## Why
The map is the only step where a second view changes the tree rather than a branch. Blindness after the map catches contradictions between decisions, which is where slot B earned its cost today, but it cannot add forks the map never had. Visible provenance lets the operator weigh a recommendation by who made it.

## How it gets improved
Count new forks from slot B's map on the next chart. If it adds none, the map pass can drop to one slot. If the rebuttal round rarely disagrees, drop it.
