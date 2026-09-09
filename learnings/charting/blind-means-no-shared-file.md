# Blind means slot A writes nothing slot B can read

## What was not good
Slot A appended its own lean to the decision file's Findings before prompting slot B. Both slots run in the same checkout and the skill tells every work-lane session to read the decision file. Slot B read slot A's position, said so, and its batch could no longer count as blind.

## What the updated way does
Until slot B has returned, slot A keeps its own view in its scratchpad, not in the repo. The decision file holds only operator words and research with sources. Slot A's view enters Findings in the merge, next to slot B's, headed by slot.

## Why
The shared checkout is a shared channel. Anything written there before slot B answers is a leak, whatever the prompt says.

## How it gets improved
If slot B ever reports seeing slot A's position again, find the file it read and add it to this rule.
