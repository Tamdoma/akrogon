# Final-shape check for slot B (codex, pane w8:pGY)

Operator answered round 1 of /home/ivan/Work/infra/akrogon/issues/chart/leaf-seat-override/forks/setting-home.md. Verbatim:

> 1 - Leaning towards a, but we need one place to do this per issue, or per epic. Not per leaf. Come up with a solution for that | 2 - full line, but look what full lines look like in config.yaml in the root. It's diffrerent for different harnesses. These need to be the same. |

Proposed final shape A will record unless you find a defect:

1. The seat setting lives only in YAML front matter at the top of `EPIC.md` and `ISSUE.md` (between `---` lines). Leaf `state.yaml` gains no field. `stateSchema` is untouched.
2. Resolution for a leaf folder under `issues/open` or `issues/closed`: nearest index wins, walking up from the leaf: parent `ISSUE.md`, then grandparent `EPIC.md` when the leaf is at depth 3, then repo `issues/config.yaml` `slots`, then machine `config.yaml` `slots`. Per seat independently (`a` and `b`). An issue inside an epic may carry its own block and wins over the epic for its leaves.
3. Seat shape is identical in every file: `{harness, model, effort}`, whole seat, nonblank strings, keys `a` and/or `b` only, strict. The machine `harnesses:` launch templates keep differing per CLI; they never appear in an issue file. A's reading of the operator's point 2 is that the `slots:` lines are already one shape and the differing lines are the templates; A will say so in the round.
4. Front matter that fails to parse or fails the schema throws with the file path. An index without front matter means no override. A file whose first line is not `---` has no front matter.
5. `seats()` gains the leaf path as input and stays the only resolver, used by `launch()`, by `akrogon config` inside a managed leaf worktree, and by status if that fork takes it. Harness template presence is validated in the resolver before tab or worktree allocation.

Return only disagreements with evidence (path and line), or one line saying none, to exactly:

/home/ivan/Work/infra/akrogon/issues/chart/leaf-seat-override/slots/setting-home-final-check-B.md

Read-only task. Do not edit repo files or run `akrogon next` or `akrogon phase`. Finish by writing the file.
