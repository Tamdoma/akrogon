# Signposts: state-hand-edits

Original: this chart, door session opened 2026-11-24T16:09:28Z in t126.

## Question

1. When a fix trades scope for completeness, which wins? 1a (recommended) remove the failure where it happens, at the smallest surface. 1b cover every bypass, even with new records and commands. Steers: the guard shape fork.
2. May the fix add friction for an operator who edits `state.yaml` on purpose? 2a (recommended) yes, one deliberate extra step is fine, since docs already forbid hand edits. 2b no, operator edits stay untouched. Steers: whether a file-level block is allowed.
3. Hard limits? 3a (recommended) akrogon code and its docs only, no harness or machine config change, no change to seat models. 3b also change seat recipes. Steers: which surfaces leaves may own.
4. Order or drop of the session's charts? 4a (recommended) one chart, state-hand-edits, nothing dropped. Steers: drain order.

Reply `1a 2a 3a 4a`, or a numbered free-text answer.

Challenge check: a practitioner could argue 1b, because a block that a `chmod` or `sed -i` bypasses is incomplete. Answered in the guard-shape fork, where that bypass is the stated cost.

## Taken

A's picks (full autopilot, 2026-11-24): 1a 2a 3a 4a.

Account (A): the session prioritizes stopping a seat's hand write at the moment it happens, with the fewest new parts. It gives up catching a deliberate bypass (`chmod`, rename over the file) and accepts one extra step for an operator who edits on purpose.

## Needs

none
