# Leaf Last Check — Slot E

### 1. `consultant-weights`: after `hc kill` + `hc rm` drops the old pane, `doc.get` + `<door> <consultant>...` cannot distinguish a last-seat restart from an added consultant or read the dropped block's weight

- **Leaf:** `herdr-setup/herdr-app/consultant-weights` (and `akrogon/herdr-app/hc-doors/chart-door-on-hc`)
- **File & line:**
  - `issues/chart/herdr-app/slots/handoff/herdr-setup/herdr-app/consultant-weights/design.md:108`
  - `issues/chart/herdr-app/slots/handoff/herdr-setup/herdr-app/consultant-weights/brief.md:8-9,21-22`
  - `issues/chart/herdr-app/slots/handoff/akrogon/herdr-app/hc-doors/chart-door-on-hc/design.md:207-208`
- **Problem:**
  `consultant-weights/design.md:108` states:
  > *"A restart is recognized by position: the argument list has the same length and a different terminal at one position (C,E). `hc kill` followed by `hc rm` drops the old pane before the helper runs (C)."*
  And `brief.md:8-9` states:
  > *"it works from the argument list and the current document only, never looking for a replaced consultant's old pane (C,E); heights: equal when the set of consultants changed (added or dropped); when only a terminal at a position changed (a restart), the weight at that position is kept, so dragged sizes stay (C,E)"*

  These two statements contradict what `herdr-app` leaves in `doc.get` once `hc kill` + `hc rm` drops the old pane before `herdr-consultant-column` runs:
  1. **Add vs. restart are indistinguishable in `doc.get` when the last consultant in seat-letter order is restarted:**
     Suppose the column has 3 consultants `[b=t2, c=t3, d=t4]` with dragged weights `[2, 1, 1]`.
     - If `d` (`t4`, the last seat) is **restarted**: `hc kill t4; hc rm t4` drops `block(t4)` from `column.children`, leaving `[block(t2, w=2), block(t3, w=1)]`; starting replacement `t7` splits the last remaining child (`t3`) into `row(w=1)[block(t3), block(t7)]`; the door then calls `herdr-consultant-column t1 t2 t3 t7`.
     - If the column originally had only 2 consultants `[b=t2, c=t3]` with weights `[2, 1]` and a 3rd consultant `d` (`t7`) is **added**: starting `t7` splits the last child (`t3`) into `row(w=1)[block(t3), block(t7)]`; the door then calls `herdr-consultant-column t1 t2 t3 t7`.
     In both cases, the argument list (`t1 t2 t3 t7`) and the `doc.get` JSON (`column[block(t2, w=2), row(w=1)[block(t3), block(t7)]]`) are byte-for-byte identical, yet `brief.md:9,21-22` requires the restart to keep weights `[2, 1, 1]` and the add to reset weights to equal `[1, 1, 1]`.
  2. **The dropped block's own weight and index are gone from `doc.get`:**
     When a non-last consultant `c` (`t3` at index 1 in `[b=t2 (w0), c=t3 (w1), d=t4 (w2)]`) is killed and removed before the helper runs, `herdr-app` removes `block(t3, w1)` from `column.children`, shifting `t4` to index 1 (`column[block(t2, w0), row(w2)[block(t4), block(t7)]]`). There is no longer a node for position 1's old weight `w1` in `doc.get` (index 1 in `column.children` now holds `t4`'s weight `w2`).
  3. **P11 fixture mismatch (`brief.md:21`):**
     Done-criterion 1 cites *"Given the recorded P11 document shapes (... a restart where the killed consultant's pane is gone)"*, but in P11 (`scratchpad/probe/free3.log:146-156`) `t3` was started with `--keep` and `hc rm` was not run, so `block t3` was still present in `doc.get`.
- **Evidence:**
  - `scratchpad/probe/free3.log:136-156` and `issues/chart/herdr-app/forks/proofs.md:73` (P11): a newly started child joins as `row[last_child, new_child]` inside `column.children`; killing a `--keep` child without `hc rm` left `block t3` in place, whereas `hc kill` + `hc rm` (or non-`--keep` exit) removes the killed `block` from `column.children`.
- **Fix:**
  Either:
  - **(Option A — pass `--restart` or old terminal in argv, and normalize column weights to sum to `1.0`):** Have the door pass `--restart` (or `<old>:<new>`) in `herdr-consultant-column`'s argument list on a restart (still working from its argument list and the current document only, per `start-and-pane.md:64`), have `herdr-consultant-column` write normalized column weights summing to `1.0` (e.g. `1/N`), and on `--restart` keep each surviving consultant's weight from its node in `doc.get` (`block(t)` or `row` holding `block(t)`) and assign the replacement `max(0, 1 - sum(surviving weights))` (or `1/N` if `herdr-app` renormalized on close); or
  - **(Option B — keep the old block in `doc.get` until `herdr-consultant-column` runs):** Start consultants with `--keep` (as in P11 `free3.log:147`) and on restart run `hc kill <old>`, start `<new>`, run `herdr-consultant-column <door> <consultant>...` while `<old>`'s finished block and its weight are still at its position in `doc.get`, and then run `hc rm <old>`.

Verdict: changes needed
