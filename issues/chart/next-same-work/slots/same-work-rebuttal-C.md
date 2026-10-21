# Rebuttal, slot C: same-work

## Disagreement

D-unreadable: I keep my position. Refuse the collapse when an unreadable or unknown leaf sits under any matched owner, falling through to today's ambiguous refusal.

A's reason does not remove the problem. In the non-colliding case the user asked for the owner, so starting its readable leaves is what was asked for. In the collapsed case, starting rests on every reading selecting the same leaves. A hidden leaf under the owner falsifies that: the owner reading would select it if readable, the leaf reading would not. Today that exact name refuses, so collapsing is a new start based on an unproven equality, not the same behavior as today.

Evidence:
- better-than-training · `src/next.ts` `resolveName`/`ownerCandidates` (read 2026-10-21) · owner leaf sets are built from readable inventory leaves only, so a hidden sibling is missing from the compared sets and equality looks true when it is only unproven.
- better-than-training · `src/next.ts` `discover`/`selectLeaves` (read 2026-10-21) · unreadable entries are reported as error lines, but selection still proceeds when selected leaves are non-empty. A report line is not a refusal.
- better-than-training · `src/next.ts` `resolveName` (read 2026-10-21) · today a name matching both an owner and a leaf throws Ambiguous and starts nothing, with or without an unreadable sibling.

## Points where slots differ: no other disagreement

- D-scope: no disagreement. My pick was the general equal-set rule. U1 asked the operator to confirm that reach, it was not a counter-pick for the special case.
- D-closed: no disagreement. Keeping today's refusal for a closed leaf against an open owner is fine on this route. U2 stays an unasked question.
- D-extras: no disagreement. U3, U4 and U5 are off route for #109, and B's parts.md leaf-path wording can go inside the planned parts.md change.
