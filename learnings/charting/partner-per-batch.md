# Slot B participates blind at every step

## What was not good
One agent authored the territory map and every question batch. A single view misses forks. The chart skill had a `debate` type for single decisions but nothing for the map or the batches, where most forks are found.

## What the updated way does
Two slots run the chart. Slot A talks to the operator. Slot B is any second agent in its own pane, same vendor or another, roles swappable by config. Both have the same chart skill installed and both do their own research.

For the territory map, then for every decision category after it, slot A sends slot B one prompt through herdr: the checkout, the intake path, the category name, and the instruction to invoke the chart skill and return its own output. Nothing of slot A's own thinking goes in that prompt. Slot A waits for the pane to settle, reads its tail, and synthesizes both outputs into one map or one batch. Items are never marked by author. Slot B's questions that overlap fold into slot A's, new forks join with continued codes.

Measured so far: destination batch, 11 returned, 3 new forks. Territory map, 36 items returned, 9 new. Slot B found what slot A missed because it read the scripts and contracts in the checkout.

## Why
Two blind takes capture more than one, and the second is only worth having if it is blind. The mechanism is one prompt and one read, no file, no protocol, no machinery. Blindness costs one line in the prompt.

## How it gets improved
Log per step how many slot B items were new. If a category yields none for several charts, skip slot B for that category. If the pane read fails on an alternate-screen harness, ask slot B to write a file and reply with the path, as the herdr skill prescribes. If roles swap, nothing changes but the pane ids.
