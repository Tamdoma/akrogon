# A coverage pass after the first decisions

## What was not good
The territory map was built once, at the start, from a 292-line intake. After seven decisions the intake still held items with no home: a config schema nobody owned, two locks the operator had stated that never reached Decisions So Far, and three decision Questions that locked what the intake left open.

## What the updated way does
After the first work-lane decision, both slots run a blind coverage pass: every intake line against the chart and every decision Question. Gaps join an existing decision or open a new one, stated locks become Decisions So Far lines, and a Question that contradicts the intake is reworded. The two lists are merged by the same rules as question batches.

## Why
The map is written before the domain is understood. The first decisions teach what the intake meant, and that is when a second reading finds the rest.

## How it gets improved
Log the gap counts per slot and the overlap each time. If the overlap is low, the two slots are reading differently and the map is still incomplete.
