# Brief: timing-events

## What
Akrogon appends one JSON line per timing event to `issues/timings.jsonl` at the registered root, alongside `issues/log.jsonl`, which stays phase moves only. Every event carries `ts`, `repo` and, except `repo_pause`, `slug`. Phase-visit identity is derived, not stored: visit `n` of phase `p` for a leaf is the count of earlier `log.jsonl` rows for that leaf with `to == p`, and the initial phase is visit 0 (A,B,C). Events:
- `visit_start`: phase and visit, written by `commitMove` after each move, and by `akrogon next` the first time it observes a leaf with no earlier `visit_start`, so the initial plan visit has a start (B,C).
- `prompt`: slot, phase, visit, session and outcome `delivered` or `failed`, where `dispatchSlot` confirms or fails delivery (`src/next.ts:542-551`); merge prompts add the merge attempt id.
- `seat_done`: slot, phase and visit, where `transition` records a paired seat's completion without a move (`src/phase.ts:406-410`).
- `check_start` and `check_end`: run id, phase, check name, scope `leaf`, `worker` (unit from a `<slug>-u<N>` worktree) or `base` (an `akrogon base-run` counterpart), merge attempt id when inside a merge attempt, and on the end event exit code, duration in ms including install and lock wait, and the kept log path; written by `runCheck`, start before the child spawns. `leafTarget` resolves worker worktrees to their leaf (C). No argv or environment values.
- `batch`: merge attempt id, holder, members and built-on revision, when the batch record is created (`src/next.ts:1055-1075`).
- `wait`: reason `prerequisite`, `parked` or `merge_turn` and the blocking slug when there is one, written by `akrogon next` only when the leaf's reason differs from its last `wait` event; a later `prompt` or a `wait` with reason `none` ends it (C).
- `repo_pause`: `on` or `off`, written by `akrogon pause` and `unpause`; it applies to every leaf of the repo, including leaves created while paused (C).
A failed append writes one warning line to stderr and never changes the outcome of the prompt, check or move. Loss is detected against `log.jsonl`, an independent record, by timing-readout's expected-event rules (A,B).

## Why
The estimated 55 to 60 min fixed cost per framework leaf and 245 h of merge time before the first merge prompt cannot be split into waiting and working from `log.jsonl`: `prompted_at` is reset on every move, first-seat completion has no row and check start time is discarded.

## Done-criteria
1. A leaf driven by real `akrogon next` and `akrogon phase` calls in a temporary registered repo from its initial plan phase to merged leaves `issues/timings.jsonl` holding a `visit_start` for every visit including the initial one, a delivered `prompt` per routed slot per visit, a `seat_done` for the first seat of a paired review, and the merge attempt's `batch` event, all with visit numbers matching the derivation rule.
2. Each check run through `akrogon run-check` writes `check_start` before the command starts and `check_end` with exit code and duration; a check killed before it finishes leaves its `check_start` without an end; runs from a worker worktree carry scope `worker` and the unit, runs from a base run carry scope `base`.
3. A check run inside a merge attempt carries that attempt's id on both events.
4. Pausing and unpausing the repo writes `repo_pause` on and off; parking and unparking a leaf, a leaf waiting on an unmerged `blocked-by` prerequisite and a leaf in merge waiting behind another merge holder each write one `wait` with the reason when the reason starts and one end when it stops, with repeated `akrogon next` calls adding no duplicate.
5. With `issues/timings.jsonl` unwritable, prompts, checks and phase moves complete exactly as without timing, and stderr carries one warning per failed append.
