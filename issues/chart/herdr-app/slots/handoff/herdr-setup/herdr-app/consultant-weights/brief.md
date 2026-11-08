# Brief: consultant-weights

## What

herdr-setup ships one named helper, `bin/herdr-consultant-column`, linked to `~/.local/bin/herdr-consultant-column` by `./install` (start-and-pane Q3 with its 2026-11-07 correction, P11) (B,C,E):

- `herdr-consultant-column [--save | --restart] <door terminal> <consultant terminal>...` (in the caller's hc session; the consultants are the door-created ones in seat-letter order) reads the core's `herdr-app` document with `doc.get` and finds the tab holding the door;
- it lays that tab out as the door on the left and one column on the right holding exactly the given consultants, top to bottom in argument order; door and column at 50% each when it first builds the column (operator, INTAKE "Consultant panes: one column, in order") (B); it works from the argument list, the current document and its own saved snapshot, never looking for a replaced consultant's old pane (B,C,E);
- heights: plain call, equal (a consultant was added or dropped); `--save` (the door, right before killing a consultant to restart it) records the column's order and weights in the core document `herdr-setup.consultant-column`, keyed by the door terminal, and changes nothing else; `--restart` (right after the replacement started) lays the column out with the saved weights by position, the replaced position taking its saved weight, so dragged sizes stay (B,D,E);
- a block whose terminal is not live in `hc ls` (a removed consultant, if herdr-app left its block) is dropped from the tab (C); any other pane in that tab, and any live terminal not given (a supplied consultant), keeps its node and is never moved (B);
- a door in no tab of the document exits non-zero with "door not in a tab" and changes nothing (C);
- it writes with `doc.set` and the read version, re-reads to verify, and on `conflict` re-reads the latest document and applies its change to that, never resending a stale copy (F1);
- the engine never calls it; the chart door calls it after a start, removal or restart of a door-created consultant.

## Why

The door's consultants must sit at equal heights in one column beside the door, A on the left half, consultants stacked on the right half in naming order, while a restart keeps the operator's dragged sizes. herdr-app's label placement puts them in one uneven row and splits an added one beside the last pane, so the column must be built by a document rewrite, which lives only in herdr-setup (forks/start-and-pane.md Q3, F1, F3; forks/proofs.md P11).

## Done-criteria

1. Given the recorded document shapes (P11: one row of door and consultants; a column with an added consultant split beside the last one; from criterion 2's recording: the document after `hc kill` and `hc rm` of a consultant, and a restart, including a middle-seat and a last-seat restart with unequal dragged weights against adding a last seat (B,D,E); a tab also holding an unrelated pane and a supplied consultant; a door in no tab), the helper's routine returns the layout stated above with the stated weights, every node outside the given terminals unchanged, and "door not in a tab" for the last case. Proof: own tests in the `test` check on those recordings (B,C).
2. In a throwaway herdr-app session with a door and three stand-in consultants started with the door's tab labels, the document after `hc kill` and `hc rm` of one stand-in is recorded first (it fixes criterion 1's restart fixture) (C); the helper leaves them in one right-half column in seat order at equal heights in `doc.get`; a fourth added consultant ends in the column; a restarted one keeps its position and weight; when another tab is changed between the helper's read and its write, its retry keeps that change. Proof: attended window tier (free), artifact in the report.
