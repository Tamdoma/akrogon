# Brief: door-seat-capture

## What

The chart-issues door learns the seat block: `skills/chart-issues/assets/shapes.md` documents the optional front matter `slots:` block in `EPIC.md` and `ISSUE.md` (shape, resolution order, write order before any leaf `state.yaml`), and `skills/chart-issues/SKILL.md` adds the handoff rule: the door asks one seat question at the handoff review only when the intake, map or a leaf design names model-sensitive work, writes the block into the chosen owner's index when answered, writes nothing otherwise, and lists each leaf's effective seats in the handoff review.

## Why

Without a door rule the only way to set seats per epic or issue is editing an index by hand after handoff; the door already writes those indexes and already elects `debate` once per handoff. This leaf consumes the resolver `index-seats` delivers: a block the door writes takes effect only once `akrogon next` reads index front matter, so this leaf waits on `index-seats` through `blocked-by` and no door writes a block the command ignores. (A,B)

## Done-criteria

1. `skills/chart-issues/assets/shapes.md` shows the `EPIC.md` and `ISSUE.md` templates with the optional front matter block and states the complete accepted shape: keys `a` and `b` only, each a whole seat with exactly `harness`, `model` and `effort`, every value nonblank after trim with no quote character in the decoded value, no other key at any level, and `harness` naming a machine template; it states that the block is written before any leaf `state.yaml`, that `state.yaml` carries no seat field, and the resolution order ISSUE.md, EPIC.md, repo, machine; the index contract sentence "Container indexes hold no lifecycle state or global order" is amended to permit the seat block as configuration. (A,B)
2. `skills/chart-issues/SKILL.md` Handoff section states when the seat question is asked (only for model-sensitive work named by intake, map or a leaf design), its default (no block), where the answer is written (the owner index of the operator's chosen scope) and that the handoff review lists each leaf's effective seats, in the same sentence style as the `debate` election.
3. The operator guide `docs/guide/chart.md` mentions the seat question in one sentence; `grep -rn restatement skills/chart-issues` stays as it is after the 2026-10-07 removal, and no other skill or doc is changed.
